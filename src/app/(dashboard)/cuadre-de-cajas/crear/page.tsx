"use client";

import CardTitle from "@/components/home/CardTitle";
import MOCK_REGISTER_BALANCES from "@/data/mock/register_balances_mock";
import { IconCashRegister } from "@tabler/icons-react";

export default function CreateCashRegisterPage() {
  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconCashRegister} title="Crear un cuadre de caja" />

        
      </section>
    </main>
  );
}
