"use client";

import CardTitle from "@/components/home/CardTitle";
import { IconInvoice } from "@tabler/icons-react";

export default function OrdersPage() {
  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconInvoice} title="Pedidos" />
      </section>
    </main>
  );
}
