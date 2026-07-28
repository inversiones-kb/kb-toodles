"use client";

import CardTitle from "@/components/home/CardTitle";
import {
  IconCashRegister,
  IconConfetti,
  IconInvoice,
  IconNote,
  IconUserDollar,
} from "@tabler/icons-react";
import HomeNoteCard from "@/components/home/HomeNoteCard";
import HomeClockCard from "@/components/home/HomeClockCard";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { Note } from "@/validations/note.validations";
import { useAuthStore } from "../../context/AuthProvider";
import { Button, Spinner } from "@heroui/react";
import EmptyState from "@/components/general/EmptyState";
import HomeNextSeasonCard from "@/components/home/HomeNextSeasonCard";
import BranchLink from "@/components/general/BranchLink";
import SalesChart from "@/components/home/SalesChart";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { useParams } from "next/navigation";
import { BusinessBranch } from "@/types/businessBranch.types";
import { orderBy, where } from "firebase/firestore";
import CurrencySalesChart from "@/components/home/CurrencySalesChart";
import DiffSalesChart from "@/components/home/DiffSalesChart";

export default function DashboardPage() {
  const user = useAuthStore((store) => store.user);
  const branch = useParams().branch as BusinessBranch;

  const { data: notes, isLoading: notesLoading } = useCollectionQuery<Note>(
    "notes",
    [],
    [user?.uid],
  );

  const { data, isLoading } = useCollectionQuery<RegisterBalance>(
    "register_balances",
    [
      where("branch", "==", branch),
      where("status", "in", ["CHECKED", "PENDING"]),
      orderBy("created_at", "asc"),
    ],
    [user?.id],
  );

  return (
    <main className="grid grid-cols-3 grid-rows-7 gap-5 h-full max-sm:flex max-sm:flex-col max-sm:overflow-y-auto">
      {/* CHART SECTION */}
      <section className="col-span-2 row-span-3 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconCashRegister} title="Ventas" backButton={false} />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          <SalesChart data={data} isLoading={isLoading} />
        </div>
        {/* 
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          <EmptyState />
        </div> */}
      </section>

      {/* ORDERS SECTION */}
      <section className="row-span-4 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle
          Icon={IconInvoice}
          title="Ventas por moneda"
          backButton={false}
        />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          <CurrencySalesChart data={data} isLoading={isLoading} />
        </div>
      </section>

      {/* DEBTS SECTION */}
      <section className="row-span-4 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle
          Icon={IconUserDollar}
          title="Diferencias de cuadres de caja"
          backButton={false}
        />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          <DiffSalesChart data={data} isLoading={isLoading} />
        </div>
      </section>

      {/* CLOCK SECTION */}
      <section className="row-span-2 bg-layer-2 rounded-3xl flex items-center justify-between gap-20 p-3 relative">
        <HomeClockCard />
      </section>

      {/* NOTEPAD SECTION */}
      <section className="row-span-3 max-sm:hidden bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconNote} title="Notas" backButton={false} />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          {notesLoading ? <Spinner /> : null}

          {!notesLoading && notes ? (
            notes.length ? (
              notes.map((note) => (
                <HomeNoteCard
                  key={note.id}
                  title={note.title}
                  text={note.text}
                />
              ))
            ) : (
              <EmptyState
                title="No hay notas"
                actionContent={
                  <Button
                    as={BranchLink}
                    href="/dashboard/notas/crear"
                    size="sm"
                    variant="flat"
                    color="secondary"
                  >
                    <IconNote />
                    Crear
                  </Button>
                }
              />
            )
          ) : null}
        </div>
      </section>

      {/* SEASON SECTION */}
      <section className="row-span-2 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle
          Icon={IconConfetti}
          title="Siguiente temporada"
          backButton={false}
        />
        <HomeNextSeasonCard />
      </section>
    </main>
  );
}
