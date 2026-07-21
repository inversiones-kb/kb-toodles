"use client";

import CardTitle from "@/components/home/CardTitle";
import HomeOrderCard from "@/components/home/HomeOrderCard";
import {
  IconBabyCarriage,
  IconCashRegister,
  IconConfetti,
  IconInvoice,
  IconNote,
  IconUserDollar,
} from "@tabler/icons-react";
import MOCK_ORDERS from "@/data/mock/orders_mock";
import HomeDebtCard from "@/components/home/HomeDebtCard";
import MOCK_DEBTS from "@/data/mock/debts_mock";
import { Currency } from "@/types/unionTypes";
import HomeNoteCard from "@/components/home/HomeNoteCard";
import MOCK_NOTES from "@/data/mock/notes_mock";
import HomeClockCard from "@/components/home/HomeClockCard";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { Note } from "@/validations/note.validations";
import { useAuthStore } from "../../context/AuthProvider";
import { Button, Spinner } from "@heroui/react";
import EmptyState from "@/components/general/EmptyState";
import Link from "next/link";
import HomeNextSeasonCard from "@/components/home/HomeNextSeasonCard";
import BranchLink from "@/components/general/BranchLink";
import SalesChart from "@/components/home/SalesChart";

export default function DashboardPage() {
  const user = useAuthStore((store) => store.user);
  const { data: notes, isLoading: notesLoading } = useCollectionQuery<Note>(
    "notes",
    [],
    [user?.uid],
  );

  return (
    <main className="grid grid-cols-3 grid-rows-7 gap-5 h-full">
      {/* CHART SECTION */}
      <section className="col-span-2 row-span-3 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconCashRegister} title="Ventas" />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          <SalesChart />
        </div>
        {/* 
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          <EmptyState />
        </div> */}
      </section>

      {/* ORDERS SECTION */}
      <section className="row-span-4 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconInvoice} title="Pedidos" />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          {/* {MOCK_ORDERS.map((order) => (
            <HomeOrderCard
              key={order.id}
              created_at={order.created_at}
              title={order.name}
              provider={order.provider_id.toString()}
            />
          ))} */}
          <EmptyState />
        </div>
      </section>

      {/* DEBTS SECTION */}
      <section className="row-span-4 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Deudas" />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          {/*  {MOCK_DEBTS.map((debt) => (
            <HomeDebtCard
              key={debt.id}
              created_at={debt.created_at}
              title={debt.name}
              amount={debt.amount}
              currency={debt.currency as Currency}
            />
          ))} */}
          <EmptyState />
        </div>
      </section>

      {/* CLOCK SECTION */}
      <section className="row-span-2 bg-layer-2 rounded-3xl flex items-center justify-between gap-20 p-3 relative">
        <HomeClockCard />
      </section>

      {/* NOTEPAD SECTION */}
      <section className="row-span-3 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconNote} title="Notas" />

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
        <CardTitle Icon={IconConfetti} title="Siguiente temporada" />
        <HomeNextSeasonCard />
      </section>
    </main>
  );
}
