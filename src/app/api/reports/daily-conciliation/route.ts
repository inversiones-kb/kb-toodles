import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/config/firebase-admin";
import { BUSINESS_BRANCHES, BusinessBranch } from "@/types/businessBranch.types";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { computeRegisterBalanceDiff } from "@/utils/reconciliation.utils";

// Same fixed-offset anchoring as /api/ingest/shifts: Venezuela has no DST,
// so this always means the Caracas calendar day regardless of the server
// process's own timezone.
const LOCAL_OFFSET = "-04:00";

function todayLocalDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Caracas" }).format(
    new Date(),
  );
}

interface CheckoutSummary {
  checkout_number: number;
  status: RegisterBalance["status"];
  is_balanced: boolean | null;
  diff: number | null;
}

interface BranchSummary {
  checkouts: CheckoutSummary[];
  matched: number;
  discrepancy: number;
  pending: number;
  total_diff_cop: number;
}

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-ingest-key");
  if (!key || key !== process.env.REPORTS_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!adminDb) {
    return NextResponse.json(
      { success: false, message: "Firebase Admin failed to initialize" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || todayLocalDate();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { success: false, message: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const dayStart = new Date(`${date}T00:00:00${LOCAL_OFFSET}`);
  const dayEnd = new Date(`${date}T23:59:59.999${LOCAL_OFFSET}`);

  try {
    const branches: Partial<Record<BusinessBranch, BranchSummary>> = {};

    for (const branch of BUSINESS_BRANCHES) {
      const snapshot = await adminDb
        .collection("register_balances")
        .where("branch", "==", branch)
        .where("created_at", ">=", dayStart)
        .where("created_at", "<=", dayEnd)
        .where("is_deleted", "==", false)
        .get();

      const summary: BranchSummary = {
        checkouts: [],
        matched: 0,
        discrepancy: 0,
        pending: 0,
        total_diff_cop: 0,
      };

      for (const doc of snapshot.docs) {
        const balance = doc.data() as RegisterBalance;

        if (balance.status !== "CHECKED") {
          summary.pending += 1;
          summary.checkouts.push({
            checkout_number: balance.checkout_number,
            status: balance.status,
            is_balanced: null,
            diff: null,
          });
          continue;
        }

        const { diff, isBalanced } = computeRegisterBalanceDiff(balance);
        summary.total_diff_cop += diff;
        if (isBalanced) summary.matched += 1;
        else summary.discrepancy += 1;

        summary.checkouts.push({
          checkout_number: balance.checkout_number,
          status: balance.status,
          is_balanced: isBalanced,
          diff,
        });
      }

      summary.checkouts.sort((a, b) => a.checkout_number - b.checkout_number);
      branches[branch] = summary;
    }

    return NextResponse.json({ success: true, date, branches });
  } catch (error) {
    console.error("Error in /api/reports/daily-conciliation:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
