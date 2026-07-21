"use client";

import CardTitle from "@/components/home/CardTitle";

import { Button, Form, Input, Spinner, Switch } from "@heroui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/app/context/AuthProvider";
import {
  createRegisterBalanceSchema,
  RegisterBalance,
  RegisterBalanceInput,
} from "@/validations/registerBalance.validations";
import {
  createRegisterBalance,
  updateRegisterBalance,
} from "@/services/register-balance.service";
import InputGroupSection from "@/components/forms/InputGroupSection";
import { moneyFormatter } from "@/utils/formatters";
import {
  IconArrowNarrowLeft,
  IconCashRegister,
  IconTrash,
} from "@tabler/icons-react";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { where } from "firebase/firestore";
import EmptyState from "@/components/general/EmptyState";
import Link from "next/link";
import { Expense } from "@/validations/expense.validations";
import BranchLink from "@/components/general/BranchLink";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { BusinessBranch } from "@/types/businessBranch.types";
import { dateToString, formatOnlyTime } from "@/utils/dateUtils";

export default function CashierRegisterBalancePage() {
  const user = useAuthStore((store) => store.user);
  const branch = useParams().branch as BusinessBranch;

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

  const {
    register,
    setValue,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBalanceInput>({
    resolver: zodResolver(createRegisterBalanceSchema),
    defaultValues: {
      is_fiscal: false,
      checkout_number: 1,
      money: {
        bs: { mobile_system: 0, pos_system: 0 },
        cop: { system: 0 },
      },
      status: "PENDING",
      branch,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useBranchRouter();

  const onSubmit: SubmitHandler<RegisterBalanceInput> = async (data) => {
    console.log(data);

    setIsLoading(true);

    if (!user) return toast.error("No estás autenticado");

    const res = await updateRegisterBalance(shift.id, {
      closed_at: new Date(),
      money: data.money,
      z_report_number: data.z_report_number,
      is_fiscal: data.is_fiscal,
      status: data.status,
    });

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/cajero");
  };

  console.log(errors);
  const isFiscal = watch("is_fiscal");

  useEffect(() => {
    if (!shiftLoading && shift) {
      reset({
        checkout_number: shift.checkout_number,
        is_fiscal: false,
        money: {
          bs: { mobile_system: 0, pos_system: 0 },
          cop: { system: 0 },
        },
        status: "PENDING",
        branch,
      });
    }
  }, [shiftLoading]);

  const usd1 =
    Number(watch("money.usd.rate1")) * Number(watch("money.usd.cash1"));
  const usd2 =
    Number(watch("money.usd.rate2")) * Number(watch("money.usd.cash2"));

  const totalExpenses = expenses.reduce((acc, item) => acc + item.amount, 0);

  useEffect(() => {
    if (!expensesLoading && expenses) {
      setValue("total_expenses", totalExpenses);
    }
  }, [expensesLoading]);

  return (
    <main className="flex gap-5 h-full p-8 justify-center items-center">
      {/* CHART SECTION */}
      <section className="w-full h-fit max-h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4 max-w-2xl">
        <CardTitle
          Icon={IconCashRegister}
          title={`Cerrar caja ${shift ? shift.checkout_number : "..."}`}
          backButton={true}
        />

        <div className="w-full overflow-y-auto h-full flex justify-center p-8 pb-8">
          <Form onSubmit={handleSubmit(onSubmit)} className="w-full h-fit">
            {shiftLoading ? (
              <div className="w-full flex justify-center">
                <Spinner label="Cargando turno..." />
              </div>
            ) : null}

            {!shiftLoading ? (
              shift ? (
                <>
                  <h2 className="text-2xl text-center w-full font-semibold mb-4">
                    Completa el formulario
                  </h2>
                  <InputGroupSection title="Datos de la caja">
                    <div className="flex gap-4">
                      <Switch
                        isSelected={watch("is_fiscal")}
                        onValueChange={(value) => setValue("is_fiscal", value)}
                        className="w-full"
                      >
                        ¿Es fiscal?
                      </Switch>

                      <Input
                        isDisabled={!isFiscal}
                        type="number"
                        aria-label="Reporte Z"
                        classNames={{
                          base: "w-full",
                          inputWrapper: "h-12",
                        }}
                        startContent={
                          <p className="font-medium text-stone-300">#</p>
                        }
                        placeholder="Número de reporte Z"
                        variant="bordered"
                        size="md"
                        radius="lg"
                        isInvalid={Boolean(errors.z_report_number?.message)}
                        errorMessage={errors.z_report_number?.message}
                        {...register("z_report_number")}
                      />
                    </div>
                  </InputGroupSection>

                  <div className="bg-layer-3 w-full gap-2 rounded-xl p-3 flex flex-col">
                    <InputGroupSection title="Dólares">
                      <div className="flex gap-2">
                        <Input
                          aria-label="Tasa Dólares 1"
                          type="number"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">$</p>
                          }
                          placeholder="Tasa 1"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.usd?.rate1)}
                          errorMessage={errors.money?.usd?.rate1?.message}
                          {...register("money.usd.rate1")}
                        />

                        <Input
                          aria-label="Dólares en efectivo 1"
                          type="number"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">$</p>
                          }
                          placeholder="Efectivo 1"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.usd?.cash1)}
                          errorMessage={errors.money?.usd?.cash1?.message}
                          {...register("money.usd.cash1")}
                        />

                        <Input
                          aria-label="Dólares 1"
                          type="text"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">COP</p>
                          }
                          value={moneyFormatter.format(usd1)}
                          isDisabled
                          placeholder="Conversión"
                          variant="faded"
                          size="md"
                          radius="lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          aria-label="Tasa Dólares 2"
                          type="number"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">$</p>
                          }
                          placeholder="Tasa 2"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.usd?.rate2)}
                          errorMessage={errors.money?.usd?.rate2?.message}
                          {...register("money.usd.rate2")}
                        />

                        <Input
                          aria-label="Dólares en efectivo 2"
                          type="number"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">$</p>
                          }
                          placeholder="Efectivo 2"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.usd?.cash2)}
                          errorMessage={errors.money?.usd?.cash2?.message}
                          {...register("money.usd.cash2")}
                        />

                        <Input
                          aria-label="Dólares 2"
                          type="text"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">COP</p>
                          }
                          value={moneyFormatter.format(usd2)}
                          isDisabled
                          placeholder="Conversión"
                          variant="faded"
                          size="md"
                          radius="lg"
                        />
                      </div>

                      <Input
                        isDisabled
                        aria-label="Dólares totales en pesos"
                        type="text"
                        classNames={{
                          base: "w-full",
                          inputWrapper: "h-12",
                        }}
                        startContent={
                          <p className="font-medium text-stone-300">$</p>
                        }
                        value={moneyFormatter.format(
                          Number(watch("money.usd.cash1")) *
                            Number(watch("money.usd.rate1")) +
                            Number(watch("money.usd.cash2")) *
                              Number(watch("money.usd.rate2")),
                        )}
                        placeholder="Dólares totales"
                        variant="bordered"
                        size="md"
                        radius="lg"
                      />
                    </InputGroupSection>

                    <InputGroupSection title="Pesos colombianos">
                      <div className="flex gap-2">
                        <Input
                          aria-label="Pesos en efectivo"
                          type="number"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">$</p>
                          }
                          placeholder="Efectivo"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.cop?.cash)}
                          errorMessage={errors.money?.cop?.cash?.message}
                          {...register("money.cop.cash")}
                        />
                      </div>
                    </InputGroupSection>

                    <InputGroupSection title="Punto">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          aria-label="Monto bs"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">$</p>
                          }
                          placeholder="Monto bs"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.bs?.pos)}
                          errorMessage={errors.money?.bs?.pos?.message}
                          {...register("money.bs.pos")}
                        />

                        <Input
                          type="number"
                          aria-label="Número de lote"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">#</p>
                          }
                          placeholder="Lote"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.bs?.batch_number)}
                          errorMessage={errors.money?.bs?.batch_number?.message}
                          {...register("money.bs.batch_number")}
                        />
                      </div>
                    </InputGroupSection>

                    <InputGroupSection title="Pago móvil">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          aria-label="Monto bs"
                          classNames={{
                            base: "w-full",
                            inputWrapper: "h-12",
                          }}
                          startContent={
                            <p className="font-medium text-stone-300">$</p>
                          }
                          placeholder="Monto bs"
                          variant="bordered"
                          size="md"
                          radius="lg"
                          isInvalid={Boolean(errors.money?.bs?.mobile)}
                          errorMessage={errors.money?.bs?.mobile?.message}
                          {...register("money.bs.mobile")}
                        />
                      </div>
                    </InputGroupSection>
                  </div>

                  <div className="py-4 w-full">
                    <InputGroupSection title="Datos de los gastos">
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
                                <div className="flex flex-col flex-1">
                                  <p className="text-sm first-letter:uppercase">
                                    {expense.description || "(Sin motivo)"}
                                  </p>
                                  <p className="text-small text-soft-light">
                                    {dateToString(
                                      expense.created_at,
                                      "DD/MM/YYYY",
                                    )}{" "}
                                    {formatOnlyTime(expense.created_at)}
                                  </p>
                                </div>

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
                    </InputGroupSection>
                  </div>

                  <InputGroupSection title="Resumen de caja">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-light text-sm text-soft-light">
                          Total de bolívares
                        </p>
                        <span className="flex-1 h-px border-b border-soft-light/40 rounded-full border-dashed" />
                        <p className="font-light text-sm text-soft-light">
                          $
                          {moneyFormatter.format(
                            Number(watch("money.bs.mobile")) +
                              Number(watch("money.bs.pos")),
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="font-light text-sm text-soft-light">
                          Total de dólares
                        </p>
                        <span className="flex-1 h-px border-b border-soft-light/40 rounded-full border-dashed" />
                        <p className="font-light text-sm text-soft-light">
                          ${moneyFormatter.format(Number(usd1 + usd2))}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="font-light text-sm text-soft-light">
                          Total de gastos
                        </p>
                        <span className="flex-1 h-px border-b border-soft-light/40 rounded-full border-dashed" />
                        <p className="font-light text-sm text-soft-light">
                          ${moneyFormatter.format(Number(totalExpenses))}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="text-light text-lg">Venta del día</p>
                        <span className="flex-1 h-px border-b border-soft-light/40 rounded-full border-dashed" />
                        <p className="text-light text-lg">
                          $
                          {moneyFormatter.format(
                            Number(watch("money.cop.cash")) +
                              (usd1 + usd2) +
                              totalExpenses,
                          )}
                        </p>
                      </div>
                    </div>
                  </InputGroupSection>

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full mt-4"
                    isLoading={isLoading}
                  >
                    Guardar nuevo cuadre de caja
                  </Button>
                </>
              ) : (
                <EmptyState
                  title="No hay un turno abierto"
                  actionContent={
                    <Button
                      as={BranchLink}
                      href="/cajero"
                      startContent={<IconArrowNarrowLeft />}
                    >
                      Volver
                    </Button>
                  }
                />
              )
            ) : null}
          </Form>
        </div>
      </section>
    </main>
  );
}
