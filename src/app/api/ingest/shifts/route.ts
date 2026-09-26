import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/config/firebase-admin";
import { BUSINESS_BRANCHES } from "@/types/businessBranch.types";

// Tells master-machine which register_balances shifts exist for a given
// branch/checkout/date, each with its own time window. A checkout can have
// more than one shift/cashier in a day, and a shift's own open_at is just
// "when the cashier clicked open in this app" - not necessarily when the
// register actually started being used, so windows are chained by
// closed_at instead: each shift's window is [previous shift's closed_at
// (or business open, for the first shift that day), this shift's own
// closed_at]. That way sequential shifts tile the whole day with no gaps,
// regardless of when each one happened to be opened.
const TIME_ZONE = "America/Caracas";
const BUSINESS_OPEN_TIME = "07:00:00";
// Venezuela is a fixed UTC-4 offset (no DST) - anchoring the day boundary
// with this explicit offset means it is always the Caracas calendar day,
// regardless of what timezone the server process itself runs in.
const LOCAL_OFFSET = "-04:00";

function toLocalTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
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
  const includeChecked = searchParams.get("include_checked") === "true";

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

  const dayStart = new Date(`${date}T00:00:00${LOCAL_OFFSET}`);
  const dayEnd = new Date(`${date}T23:59:59.999${LOCAL_OFFSET}`);
  const businessOpen = new Date(`${date}T${BUSINESS_OPEN_TIME}${LOCAL_OFFSET}`);
  const eligibleStatuses = includeChecked ? ["PENDING", "CHECKED"] : ["PENDING"];

  try {
    // No status filter here on purpose: computing correct windows needs
    // every sibling shift that day (including already-CHECKED ones), even
    // though only eligibleStatuses are actually returned below.
    const snapshot = await adminDb
      .collection("register_balances")
      .where("branch", "==", branch)
      .where("checkout_number", "==", checkoutNumber)
      .where("open_at", ">=", dayStart)
      .where("open_at", "<=", dayEnd)
      .get();

    const withClose = snapshot.docs
      .map((doc) => ({ doc, closedAt: toDate(doc.data().closed_at) }))
      .filter((d): d is { doc: (typeof snapshot.docs)[number]; closedAt: Date } => d.closedAt !== null)
      .sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime());

    const shifts = [];
    let previousClose = businessOpen;
    for (const { doc, closedAt } of withClose) {
      const status = doc.data().status;
      if (eligibleStatuses.includes(status)) {
        shifts.push({
          id: doc.id,
          start_time: toLocalTime(previousClose),
          end_time: toLocalTime(closedAt),
        });
      }
      previousClose = closedAt;
    }

    return NextResponse.json({ success: true, shifts });
  } catch (error) {
    console.error("Error in /api/ingest/shifts:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
