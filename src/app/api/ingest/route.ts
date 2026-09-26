import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/config/firebase-admin";
import { BUSINESS_BRANCHES, BusinessBranch } from "@/types/businessBranch.types";

// Payload posted by agent/master-machine after each checkout's cash report
// is pulled from the ADN MySQL database. Only the "_system" money fields are
// trusted from this source; cash counts stay manually entered by the cashier.
interface IngestPayload {
  branch: BusinessBranch;
  checkout_number: number;
  date: string; // YYYY-MM-DD, the report's business day
  money: {
    cop: { system: number };
    bs: { pos_system: number; mobile_system: number };
  };
}

function isValidPayload(body: unknown): body is IngestPayload {
  if (!body || typeof body !== "object") return false;
  const p = body as Partial<IngestPayload>;
  return (
    typeof p.branch === "string" &&
    (BUSINESS_BRANCHES as readonly string[]).includes(p.branch) &&
    typeof p.checkout_number === "number" &&
    typeof p.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(p.date) &&
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
  const { branch, checkout_number, date, money } = body;

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const snapshot = await adminDb
    .collection("register_balances")
    .where("branch", "==", branch)
    .where("checkout_number", "==", checkout_number)
    .where("status", "==", "PENDING")
    .where("open_at", ">=", dayStart)
    .where("open_at", "<=", dayEnd)
    .get();

  if (snapshot.empty) {
    return NextResponse.json(
      {
        success: false,
        message: `No PENDING register_balances for branch=${branch} checkout_number=${checkout_number} date=${date}`,
      },
      { status: 404 },
    );
  }
  if (snapshot.size > 1) {
    return NextResponse.json(
      {
        success: false,
        message: `Ambiguous match: ${snapshot.size} PENDING register_balances for branch=${branch} checkout_number=${checkout_number} date=${date}`,
      },
      { status: 409 },
    );
  }

  const docRef = snapshot.docs[0].ref;
  await docRef.update({
    "money.cop.system": money.cop.system,
    "money.bs.pos_system": money.bs.pos_system,
    "money.bs.mobile_system": money.bs.mobile_system,
    updated_at: new Date(),
  });

  return NextResponse.json({
    success: true,
    message: "register_balance updated",
    data: { id: docRef.id },
  });
}
