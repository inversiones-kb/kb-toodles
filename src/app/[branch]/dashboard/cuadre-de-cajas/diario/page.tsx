"use client";

import CardTitle from "@/components/home/CardTitle";
import {
  Icon24Hours,
  IconChevronLeft,
  IconChevronRight,
  IconUserDollar,
} from "@tabler/icons-react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useMemo, useState } from "react";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { Button, DateRangePicker, Spinner } from "@heroui/react";

import { RegisterBalanceFilters } from "@/components/registerBalances/RegisterBalanceTableToolbar";
import {
  and,
  or,
  orderBy,
  QueryCompositeFilterConstraint,
  QueryConstraint,
  where,
} from "firebase/firestore";

import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { useParams } from "next/navigation";
import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";
import { dateToString } from "@/utils/dateUtils";
import EmptyState from "@/components/general/EmptyState";
import RegisterBalanceCard from "@/components/registerBalances/RegisterBalanceCard";

export default function DaylyRegisterBalancesPage() {
  const branch = useParams().branch as keyof typeof BUSINESS_BRANCH_MAP;

  const [filters, setFilters] = useState<RegisterBalanceFilters>({
    search: "",
    status: "PENDING",
    checkout_number: undefined,
    dateRange: {
      start: today(getLocalTimeZone()) as any,
      end: today(getLocalTimeZone()) as any,
    },
  });

  const queryConstraints = useMemo(() => {
    const ors = [
      where("is_deleted", "==", false),
      where("branch", "==", branch),
    ];
    const ands = [];
    const constraints: (QueryConstraint | QueryCompositeFilterConstraint)[] =
      [];

   /*  if (filters.status) {
      ors.push(where("status", "==", filters.status));
    } */

    if (filters.dateRange) {
      const start = new Date(
        filters.dateRange.start.toDate(getLocalTimeZone()),
      );
      start.setHours(0, 0, 0, 0);

      const end = new Date(filters.dateRange.end.toDate(getLocalTimeZone()));

      end.setHours(23, 59, 59, 999);

      ands.push(
        and(where("created_at", ">=", start), where("created_at", "<=", end)),
      );
    }

    constraints.push(and(...ands, ...ors));

    constraints.push(orderBy("checkout_number", "asc"));

    return constraints;
  }, [filters]);

  const { data, isLoading, refetch } = useCollectionQuery<RegisterBalance>(
    "register_balances",
    queryConstraints,
    [filters],
  );

  function changeDatePeriod(orientation: -1 | 1) {
    setFilters((e) => ({
      ...e,
      dateRange: {
        start: e.dateRange!.start.add({ days: 1 * orientation }),
        end: e.dateRange!.end.add({ days: 1 * orientation }),
      },
    }));
  }

  return (
    <main className="flex gap-5 h-full">
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle
          Icon={Icon24Hours}
          title="Cuadre de cajas diario"
          endContent={
            <div className="flex items-center gap-3">
              <Button onPress={() => changeDatePeriod(-1)}>
                <IconChevronLeft />{" "}
              </Button>
              <p className="w-full max-w-3xs text-center">
                {dateToString(
                  filters.dateRange?.start.toDate(getLocalTimeZone()),
                )}
              </p>

              <Button
                isDisabled={
                  filters.dateRange!.end.compare(today(getLocalTimeZone())) >= 0
                }
                onPress={() => changeDatePeriod(1)}
              >
                <IconChevronRight />
              </Button>
            </div>
          }
        />

        <div className="w-full overflow-y-auto h-full flex flex-col gap-5">
          {isLoading ? (
            <div className="flex justify-center w-full h-fit">
              <Spinner label="Cargando cuadres de caja..." />
            </div>
          ) : null}

          {!isLoading && data ? (
            <div className="grid grid-cols-2 gap-4">
              {data.map((item) => {
                return <RegisterBalanceCard key={item.id} data={item} />;
              })}
            </div>
          ) : null}

          {!isLoading && !data.length ? (
            <div className="">
              <EmptyState title="No hay cuadres de caja este día" />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
