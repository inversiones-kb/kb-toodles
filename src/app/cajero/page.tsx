"use client";

import CardTitle from "@/components/home/CardTitle";

import {
  IconArrowNarrowRight,
  IconCashBanknote,
  IconClock,
  IconPennant,
  IconPrinter,
} from "@tabler/icons-react";

import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import { useAuthStore } from "../context/AuthProvider";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { where } from "firebase/firestore";
import { useState } from "react";
import { toast } from "sonner";
import {
  createRegisterBalance,
  openRegisterBalance,
} from "@/services/register-balance.service";
import { formatShiftDateTime } from "@/utils/dateUtils";
import clsx from "clsx";
import { Expense } from "@/validations/expense.validations";
import InputGroupSection from "@/components/forms/InputGroupSection";
import { moneyFormatter } from "@/utils/formatters";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/auth.service";

export default function CashierPage() {
  const user = useAuthStore((store) => store.user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkoutNumber, setCheckoutNumber] = useState<number>(1);
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const {
    data: activeShifts,
    isLoading: shiftLoading,
    error,
    refetch,
  } = useCollectionQuery<RegisterBalance>(
    "register_balances",
    [where("user_id", "==", user?.uid || ""), where("status", "==", "OPEN")],
    [user?.uid], // 🔥 CRUCIAL: Solo se vuelve a ejecutar si el usuario cambia
  );

  const shift = activeShifts[0];

  const { data: expenses, isLoading: expensesLoading } =
    useCollectionQuery<Expense>(
      "expenses",
      [where("shift_id", "==", shift ? shift.id : "")],
      [shift], // 🔥 CRUCIAL: Solo se vuelve a ejecutar si el usuario cambia
    );

  const handleOpenShift = async () => {
    if (!user) return;

    setIsLoading(true);
    const res = await openRegisterBalance({
      checkout_number: checkoutNumber,
      employee_snapshot: {
        id: user.uid,
        name: user.name,
        last_name: user.last_name,
        role: user.role,
      },
      status: "OPEN",
      user_id: user.uid,
      total_expenses: 0,
    });
    /* const res = await createUser(data); */

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success("Turno abierto con éxito");

    refetch();
  };

  const handleLogout = async () => {
    setDeleteLoading(true);
    // 1. Matamos la sesión en el backend (Firebase)
    const result = await logoutUser();

    if (result.success) {
      // 2. Limpiamos la memoria del cliente (Zustand)
      clearAuth();

      // 3. Expulsamos al usuario a la pantalla de login
      router.push("/");
    } else {
      // Aquí podrías disparar un toast de error si falla la red
      return toast.error("No se pudo cerrar sesión");
    }
    setDeleteLoading(false);
  };

  return (
    <main className="h-dvh max-h-full bg-background flex justify-center items-center">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>¿Cerrar sesión?</ModalHeader>
          <ModalBody>
            <p>Volverás a la pantalla de iniciar sesión</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onClose}
              isDisabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button color="danger" onPress={handleLogout} isLoading={isLoading}>
              Sí, salir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <section className="w-full max-w-lg p-3 gap-6 rounded-3xl overflow-y-hidden h-fit bg-layer-2 flex flex-col justify-center max-h-[90%]">
        <CardTitle title="Herramientas para cajeros" backButton={false} />

        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              showFallback
              fallback={`${user?.name[0]}${user?.last_name[0]}`}
            />

            <p>
              {user?.name} {user?.last_name}
            </p>
          </div>

          <Button color="danger" variant="flat" onPress={onOpen}>
            Salir
          </Button>
        </div>

        {shiftLoading ? <Spinner label="Cargando turno" /> : null}

        {!shiftLoading ? (
          shift ? (
            <>
              <div className="flex justify-between">
                <div className="flex gap-1 items-center">
                  <IconClock size={20} />
                  <p className="text-sm">
                    {formatShiftDateTime(shift.open_at)}
                  </p>
                  <IconArrowNarrowRight size={20} />
                  <p className="text-sm">
                    {formatShiftDateTime(shift.closed_at)}
                  </p>
                </div>

                <p>Caja #{shift.checkout_number}</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                <Button
                  as={Link}
                  href="/cajero/nuevo-gasto"
                  className="flex flex-col p-3 items-start rounded-xl bg-layer-3 h-fit"
                >
                  <IconCashBanknote className="min-w-12 min-h-12" />
                  <p className="text-light">Registrar nuevo gasto</p>
                </Button>

                <Button
                  as={Link}
                  href="/cajero/cierre-de-caja"
                  className="flex flex-col p-3 items-start rounded-xl bg-layer-3 h-fit"
                >
                  <IconPrinter className="min-w-12 min-h-12" />
                  <p className="text-light">Cerrar caja</p>
                </Button>
              </div>

              <div className="flex flex-col flex-1 gap-2 max-h-full overflow-y-auto">
                <header className="w-full sticky top-0 bg-layer-2 pb-2">
                  <h6 className="text-sm text-soft-light">
                    Datos de los gastos
                  </h6>
                </header>
                {expensesLoading ? (
                  <Spinner label="Cargando gastos..." />
                ) : null}

                {!expensesLoading && expenses ? (
                  expenses.length ? (
                    <div className="flex flex-col gap-1.5">
                      {expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="rounded-lg border border-stone-700 bg-layer-3 w-full items-center flex px-2 py-2"
                        >
                          <p className="text-sm flex-1 first-letter:uppercase">
                            {expense.description || "(Sin motivo)"}
                          </p>
                          <p className="text-sm">
                            {expense.currency}{" "}
                            {moneyFormatter.format(expense.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-soft-light">
                      No hay gastos registrados
                    </p>
                  )
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p>Caja número</p>
              <div className="flex-1 flex h-full gap-2">
                {new Array(5).fill("").map((_, i) => (
                  <Button
                    key={i}
                    variant="faded"
                    type="button"
                    onPress={() => setCheckoutNumber(i + 1)}
                    className={clsx([
                      "bg-light/10 py-7 flex-1",
                      {
                        "outline-primary outline-1 bg-primary/20":
                          checkoutNumber === i + 1,
                      },
                    ])}
                    isIconOnly
                  >
                    #{i + 1}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                className="flex flex-col p-3 items-center rounded-xl bg-layer-3 h-fit"
                onPress={handleOpenShift}
              >
                <IconPennant className="min-w-12 min-h-12" />
                <p className="text-light">Abrir turno</p>
              </Button>
            </div>
          )
        ) : null}
      </section>
    </main>
  );
}
