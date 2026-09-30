import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/config/firebase-admin";

// Payload posted by agent/master-machine after one shift's cash report is
// pulled from the ADN MySQL database, scoped to that shift's own
// open_at -> closed_at window (see GET .../shifts, which resolves doc_id).
// Only the "_system" money fields are trusted from this source; cash
// counts stay manually entered by the cashier.
interface IngestPayload {
  doc_id: string;
  // Opt-in only: lets a deliberate re-run overwrite an already-CHECKED doc
  // (e.g. one processed before a windowing fix). Normal runs never send
  // this, so a PENDING-only doc stays the default, safe target.
  allow_checked?: boolean;
  money: {
    cop: { system: number };
    bs: { pos_system: number; mobile_system: number; cash_system?: number };
  };
}

function isValidPayload(body: unknown): body is IngestPayload {
  if (!body || typeof body !== "object") return false;
  const p = body as Partial<IngestPayload>;
  return (
    typeof p.doc_id === "string" &&
    p.doc_id.length > 0 &&
    (p.allow_checked === undefined || typeof p.allow_checked === "boolean") &&
    typeof p.money?.cop?.system === "number" &&
    typeof p.money?.bs?.pos_system === "number" &&
    typeof p.money?.bs?.mobile_system === "number" &&
    (p.money.bs.cash_system === undefined ||
      typeof p.money.bs.cash_system === "number")
  );
}

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-ingest-key");
  if (!key || key !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    return NextResponse.json(
      { success: false, message: "Firebase Admin failed to initialize" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ success: false, message: "Missing or invalid fields" }, { status: 400 });
  }
  const { doc_id, money, allow_checked } = body;

  try {
    const docRef = adminDb.collection("register_balances").doc(doc_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: `No register_balances doc with id=${doc_id}` },
        { status: 404 },
      );
    }
    const status = doc.data()?.status;
    const isEligible = status === "PENDING" || (allow_checked && status === "CHECKED");
    if (!isEligible) {
      return NextResponse.json(
        {
          success: false,
          message: `register_balances/${doc_id} is not eligible (status=${status}) - already reconciled or not ready`,
        },
        { status: 409 },
      );
    }

    await docRef.update({
      "money.cop.system": money.cop.system,
      "money.bs.pos_system": money.bs.pos_system,
      "money.bs.mobile_system": money.bs.mobile_system,
      "money.bs.cash_system": money.bs.cash_system ?? 0,
      status: "CHECKED",
      updated_at: new Date(),
    });

    // Guard: Bs cash is never legitimate, so any amount is a cashier mistake.
    // Fired here (not on a timer) so n8n always sees the just-ingested values.
    const cashBs = money.bs.cash_system ?? 0;
    if (cashBs > 0 && process.env.N8N_BS_CASH_WEBHOOK_URL) {
      const d = doc.data()!;
      const closed = d.closed_at?.toDate?.() as Date | undefined;
      try {
        await fetch(process.env.N8N_BS_CASH_WEBHOOK_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            branch: d.branch,
            checkout_number: d.checkout_number,
            cashier: `${d.user_snapshot?.name ?? ""} ${d.user_snapshot?.last_name ?? ""}`.trim(),
            date: closed?.toISOString() ?? null,
            cash_bs: cashBs,
            doc_id,
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch (e) {
        // A failed alert must never fail the ingest itself.
        console.error("Bs-cash webhook failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "register_balance updated and marked CHECKED",
      data: { id: doc_id },
    });
  } catch (error) {
    // Surfaces Firestore errors to master-machine's own output, instead of
    // only Vercel's server logs.
    console.error("Error in /api/ingest:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
