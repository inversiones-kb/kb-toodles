"use client";

import CardTitle from "@/components/home/CardTitle";
import MOCK_REGISTER_BALANCES from "@/data/mock/register_balances_mock";
import { IconCashRegister } from "@tabler/icons-react";

export default function CashRegisterPage() {
  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconCashRegister} title="Cuadre de Cajas" />

        <div className="w-full bg-red-500 h-20 flex flex-col">
          {MOCK_REGISTER_BALANCES.map((registerBalance) => (
            <div key={registerBalance.id}>
              {registerBalance.checkout_number}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
