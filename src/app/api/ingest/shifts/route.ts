import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/config/firebase-admin";
import { BUSINESS_BRANCHES } from "@/types/businessBranch.types";

// Tells master-machine which PENDING register_balances exist for a given
// branch/checkout/date, each with its own shift time window (open_at ->
// closed_at) — a checkout can have more than one shift/cashier in a day,
// so a single whole-day match isn't always correct.
const TIME_ZONE = "America/Caracas";

function toLocalTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch");
  const checkoutNumberRaw = searchParams.get("checkout_number");
  const date = searchParams.get("date");

  if (
    !branch ||
    !(BUSINESS_BRANCHES as readonly string[]).includes(branch) ||
    !checkoutNumberRaw ||
    !date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return NextResponse.json(
      { success: false, message: "Missing or invalid branch/checkout_number/date" },
      { status: 400 },
    );
  }
  const checkoutNumber = Number(checkoutNumberRaw);
  if (!Number.isFinite(checkoutNumber)) {
    return NextResponse.json(
      { success: false, message: "checkout_number must be a number" },
      { status: 400 },
    );
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  try {
    const snapshot = await adminDb
      .collection("register_balances")
      .where("branch", "==", branch)
      .where("checkout_number", "==", checkoutNumber)
      .where("status", "==", "PENDING")
      .where("open_at", ">=", dayStart)
      .where("open_at", "<=", dayEnd)
      .get();

    const shifts = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const openAt: unknown = data.open_at;
      const closedAt: unknown = data.closed_at;
      if (
        !(openAt instanceof Date) &&
        !(typeof openAt === "object" && openAt !== null && "toDate" in openAt)
      ) {
        console.error(`register_balances/${doc.id} has no open_at, skipping`);
        continue;
      }
      if (
        !(closedAt instanceof Date) &&
        !(typeof closedAt === "object" && closedAt !== null && "toDate" in closedAt)
      ) {
        console.error(`register_balances/${doc.id} is PENDING but has no closed_at, skipping`);
        continue;
      }
      const openDate = (openAt as { toDate?: () => Date }).toDate?.() ?? (openAt as Date);
      const closedDate = (closedAt as { toDate?: () => Date }).toDate?.() ?? (closedAt as Date);

      shifts.push({
        id: doc.id,
        start_time: toLocalTime(openDate),
        end_time: toLocalTime(closedDate),
      });
    }

    return NextResponse.json({ success: true, shifts });
  } catch (error) {
    console.error("Error in /api/ingest/shifts:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
