"use client";

import InputGroupSection from "@/components/forms/InputGroupSection";
import CardTitle from "@/components/home/CardTitle";
import {
  Button,
  Input,
  Form,
  Switch,
  useDisclosure,
  Spinner,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Modal,
} from "@heroui/react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowNarrowLeft, IconCashRegister } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { moneyFormatter } from "@/utils/formatters";
import {
  createRegisterBalanceSchema,
  RegisterBalance,
  RegisterBalanceInput,
} from "@/validations/registerBalance.validations";
import { updateRegisterBalance } from "@/services/register-balance.service";
import { useDoc } from "@/hooks/useDoc";
import EmptyState from "@/components/general/EmptyState";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { where } from "firebase/firestore";
import { Expense } from "@/validations/expense.validations";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { dateToString, formatOnlyTime } from "@/utils/dateUtils";
import { transformExpense } from "@/utils/normalizers/normalizeExpenses";
import { FormattedNumberInput } from "@/components/forms/FormattedNumberInput";

export default function CheckRegisterBalancePage() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { id } = useParams();
  const [pendingData, setPendingData] = useState<RegisterBalanceInput | null>(
    null,
  );

  const {
    data,
    isLoading: docIsLoading,
    error,
  } = useDoc<RegisterBalance>("register_balances", id?.toString());

  const { data: expenses, isLoading: expensesLoading } =
    useCollectionQuery<Expense>(
      "expenses",
      [where("shift_id", "==", data?.id || "")],
      [data?.id],
      transformExpense,
    );

  const {
    register,
    control,
    setValue,
    watch,
    reset,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBalanceInput>({
    resolver: zodResolver(createRegisterBalanceSchema),
    defaultValues: {
      is_fiscal: false,
      checkout_number: 1,
      money: {
        bs: {
          pos_batches: [],
        },
      },
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useBranchRouter();

  const handlePreSubmit: SubmitHandler<RegisterBalanceInput> = async (data) => {
    setPendingData(data);
    onOpen();
    return;
  };

  const onSubmit = async () => {
    if (!pendingData || !data) return;

    console.log(pendingData);

    onClose();
    setIsLoading(true);

    const res = await updateRegisterBalance(data.id, {
      ...pendingData,
      status: "CHECKED",
    });

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/dashboard/cuadre-de-cajas");
  };

  useEffect(() => {
    if (!docIsLoading && data) {
      reset(data);
      // populate form values on start
    }
  }, [docIsLoading]);

  const isFiscal = watch("is_fiscal");

  const usd1 =
    Number(watch("money.usd.rate1")) * Number(watch("money.usd.cash1"));
  const usd2 =
    Number(watch("money.usd.rate2")) * Number(watch("money.usd.cash2"));

  const posBatches = watch("money.bs.pos_batches") || [];

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconCashRegister} title="Revisar un cuadre de caja" />

        <div className="w-full overflow-y-auto h-full flex justify-center">
          <Form
            onSubmit={handleSubmit(handlePreSubmit)}
            className="max-w-xl w-full h-fit"
          >
            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      ¿Confirmar el cierre de caja?
                    </ModalHeader>
                    <ModalBody>
                      <p className="text-sm text-soft-light font-light">
                        Esta acción no se puede deshacer
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cerrar
                      </Button>
                      <Button color="primary" onPress={onSubmit}>
                        Confirmar cierre
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>

            <h2 className="text-2xl text-center w-full font-semibold mb-4">
              Completa el formulario
            </h2>

            {!docIsLoading ? (
              !data ? (
                <div className="w-full flex justify-center py-20 items-center">
                  <EmptyState
                    title="Este registro no existe"
                    actionContent={
                      <Button
                        variant="light"
                        startContent={<IconArrowNarrowLeft />}
                      >
                        Volver a los cuadres de caja
                      </Button>
                    }
                  />
                </div>
              ) : (
                <>
                  <InputGroupSection title="Datos de la caja">
                    <div className="flex items-center gap-2 h-12 w-full">
                      <Input
                        label="Cajero"
                        variant="bordered"
                        size="sm"
                        classNames={{
                          base: "h-full w-full",
                          inputWrapper: "h-full",
                        }}
                        isDisabled
                        radius="lg"
                        value={`${data.user_snapshot.name} ${data.user_snapshot.last_name}`}
                      />

                      <Input
                        aria-label="Número de caja"
                        isDisabled
                        label="Caja"
                        classNames={{
                          base: "h-full w-full",
                          inputWrapper: "h-full",
                        }}
                        value={watch("checkout_number").toString()}
                        startContent={
                          <p className="font-medium text-sm text-stone-300 min-w-max">
                            Número
                          </p>
                        }
                        disabled
                        variant="bordered"
                        size="sm"
                        radius="lg"
                        isInvalid={Boolean(errors.checkout_number?.message)}
                        errorMessage={errors.checkout_number?.message}
                        {...register("checkout_number")}
                      />
                      {/* <div className="flex-1 flex h-full gap-1">
                        <Button
                          variant="faded"
                          type="button"
                          onPress={(_) => setValue("checkout_number", 1)}
                          className="bg-light/10 h-full flex-1"
                          isIconOnly
                        >
                          #1
                        </Button>
                        <Button
                          variant="faded"
                          type="button"
                          onPress={(_) => setValue("checkout_number", 2)}
                          className="bg-light/10 h-full flex-1"
                          isIconOnly
                        >
                          #2
                        </Button>
                        <Button
                          variant="faded"
                          type="button"
                          onPress={(_) => setValue("checkout_number", 3)}
                          className="bg-light/10 h-full flex-1"
                          isIconOnly
                        >
                          #3
                        </Button>
                        <Button
                          variant="faded"
                          type="button"
                          onPress={(_) => setValue("checkout_number", 4)}
                          className="bg-light/10 h-full flex-1"
                          isIconOnly
                        >
                          #4
                        </Button>
                        <Button
                          variant="faded"
                          type="button"
                          onPress={(_) => setValue("checkout_number", 5)}
                          className="bg-light/10 h-full flex-1"
                          isIconOnly
                        >
                          #5
                        </Button>
                      </div> */}
                    </div>

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
                        <FormattedNumberInput
                          control={control}
                          name={"money.usd.rate1"}
                          placeholder={"Tasa 1"}
                        />
                        <FormattedNumberInput
                          control={control}
                          name={"money.usd.cash1"}
                          placeholder={"Efectivo 1"}
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
                        <FormattedNumberInput
                          control={control}
                          name={"money.usd.rate2"}
                          placeholder={"Tasa 2"}
                        />
                        <FormattedNumberInput
                          control={control}
                          name={"money.usd.cash2"}
                          placeholder={"Efectivo 2"}
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
                          <p className="font-medium text-stone-300">COP</p>
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
                        <FormattedNumberInput
                          control={control}
                          name={"money.cop.cash"}
                          placeholder={"Efectivo"}
                        />

                        <FormattedNumberInput
                          control={control}
                          name={"money.cop.system"}
                          placeholder={"Sistema"}
                        />
                      </div>
                    </InputGroupSection>

                    <InputGroupSection
                      title={`Punto${!posBatches.length ? " (Sin lotes)" : ""}`}
                    >
                      <div className="flex gap-2">
                        <FormattedNumberInput
                          isDisabled
                          control={control}
                          name={"money.bs.pos"}
                          placeholder={"Monto bs"}
                        />

                        <FormattedNumberInput
                          control={control}
                          name={"money.bs.pos_system"}
                          placeholder={"Sistema"}
                        />
                      </div>

                      {/* <p className="text-sm text-soft-light">Lotes:</p> */}

                      <div className="flex flex-col gap-1">
                        {posBatches.length
                          ? posBatches.map((batch, i) => (
                              <div
                                key={i}
                                className="w-full bg-light/5 p-2 rounded-xl flex justify-between items-center"
                              >
                                <p className="text-soft-light text-sm">
                                  Lote{" "}
                                  <span className="text-light">
                                    #{batch.batch_number}
                                  </span>
                                </p>
                                <p className="text-sm font-normal text-soft-light">
                                  {moneyFormatter.format(batch.amount)} bs
                                </p>
                              </div>
                            ))
                          : null}
                      </div>
                    </InputGroupSection>

                    <InputGroupSection title="Pago móvil">
                      <div className="flex gap-2">
                        <FormattedNumberInput
                          control={control}
                          name={"money.bs.mobile"}
                          placeholder={"Monto bs"}
                        />

                        <FormattedNumberInput
                          control={control}
                          name={"money.bs.mobile_system"}
                          placeholder={"Sistema"}
                        />
                      </div>
                    </InputGroupSection>
                  </div>

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
                              <div className="gap-2 flex items-center">
                                <p className="text-sm">
                                  {expense.currency}{" "}
                                  {moneyFormatter.format(expense.amount)}
                                </p>
                              </div>
                              <p></p>
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
                          ${moneyFormatter.format(Number(data.total_expenses))}
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
                              data.total_expenses,
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
                    Confirmar cierre de caja
                  </Button>
                </>
              )
            ) : null}

            {docIsLoading ? (
              <div className="w-full flex justify-center">
                <Spinner label="Cargando datos..." />
              </div>
            ) : null}
          </Form>
        </div>
      </section>
    </main>
  );
}
