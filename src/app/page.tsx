"use client";

import CardTitle from "@/components/home/CardTitle";
import HomeOrderCard from "@/components/home/HomeOrderCard";
import LightningIcon from "@public/home/lightning.svg";
import {
  IconBabyCarriage,
  IconCashRegister,
  IconConfetti,
  IconInvoice,
  IconNote,
  IconUserDollar,
} from "@tabler/icons-react";
import Image from "next/image";
import MOCK_ORDERS from "@/data/mock/orders_mock";
import HomeDebtCard from "@/components/home/HomeDebtCard";
import MOCK_DEBTS from "@/data/mock/debts_mock";
import { Currency } from "@/types/unionTypes";
import HomeNoteCard from "@/components/home/HomeNoteCard";
import MOCK_NOTES from "@/data/mock/notes_mock";
import HomeClockCard from "@/components/home/HomeClockCard";

export default function HomePage() {
  return (
    <main className="grid grid-cols-3 grid-rows-7 gap-5 h-full">
      {/* CHART SECTION */}
      <section className="col-span-2 row-span-3 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconCashRegister} title="Ventas" />
      </section>

      {/* ORDERS SECTION */}
      <section className="row-span-4 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconInvoice} title="Pedidos" />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          {MOCK_ORDERS.map((order) => (
            <HomeOrderCard
              key={order.id}
              created_at={order.created_at}
              title={order.name}
              provider={order.provider_id.toString()}
            />
          ))}
        </div>
      </section>

      {/* DEBTS SECTION */}
      <section className="row-span-4 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Deudas" />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1.5">
          {MOCK_DEBTS.map((debt) => (
            <HomeDebtCard
              key={debt.id}
              created_at={debt.created_at}
              title={debt.name}
              amount={debt.amount}
              currency={debt.currency as Currency}
            />
          ))}
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
          {MOCK_NOTES.map((note) => (
            <HomeNoteCard key={note.id} title={note.title} text={note.text} />
          ))}
        </div>
      </section>

      {/* SEASON SECTION */}
      <section className="row-span-2 bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconConfetti} title="Siguiente temporada" />
        <div className="flex gap-2.5 h-full w-full">
          <div className="h-full aspect-auto bg-layer-3 rounded-2xl p-3 flex justify-center items-center">
            <IconBabyCarriage size={40} className="text-brand-primary" />
          </div>
          <div className="flex-1 bg-layer-3 rounded-2xl flex flex-col items-start gap-2 p-3 justify-center">
            <div className="flex flex-col items-start">
              <h4 className="text-lg font-bold text-brand-primary">
                Día de las Madres
              </h4>
              <p className="text-soft-light font-semibold text-xs">
                Mayo del 2025
              </p>
            </div>
            <p className="text-light text-sm">Faltan 4 meses y 15 días</p>
          </div>
        </div>
      </section>
    </main>
  );
}
