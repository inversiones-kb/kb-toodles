import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/config/firebase-admin";

// Payload posted by agent/master-machine after one shift's cash report is
// pulled from the ADN MySQL database, scoped to that shift's own
// open_at -> closed_at window (see GET .../shifts, which resolves doc_id).
// Only the "_system" money fields are trusted from this source; cash
// counts stay manually entered by the cashier.
interface IngestPayload {
  doc_id: string;
  money: {
    cop: { system: number };
    bs: { pos_system: number; mobile_system: number };
  };
}

function isValidPayload(body: unknown): body is IngestPayload {
  if (!body || typeof body !== "object") return false;
  const p = body as Partial<IngestPayload>;
  return (
    typeof p.doc_id === "string" &&
    p.doc_id.length > 0 &&
    typeof p.money?.cop?.system === "number" &&
    typeof p.money?.bs?.pos_system === "number" &&
    typeof p.money?.bs?.mobile_system === "number"
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
  const { doc_id, money } = body;

  try {
    const docRef = adminDb.collection("register_balances").doc(doc_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: `No register_balances doc with id=${doc_id}` },
        { status: 404 },
      );
    }
    if (doc.data()?.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: `register_balances/${doc_id} is not PENDING (status=${doc.data()?.status}) - already reconciled or not ready`,
        },
        { status: 409 },
      );
    }

    await docRef.update({
      "money.cop.system": money.cop.system,
      "money.bs.pos_system": money.bs.pos_system,
      "money.bs.mobile_system": money.bs.mobile_system,
      status: "CHECKED",
      updated_at: new Date(),
    });

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
