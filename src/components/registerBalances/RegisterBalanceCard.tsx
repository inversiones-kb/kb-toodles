import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { updateRegisterBalance } from "@/services/register-balance.service";
import { transformExpense } from "@/utils/normalizers/normalizeExpenses";
import { transformMobilePayment } from "@/utils/normalizers/normalizeMobilePayments";
import { Expense } from "@/validations/expense.validations";
import { MobilePayment } from "@/validations/mobile_payment.validations";
import {
  createRegisterBalanceSchema,
  RegisterBalance,
  RegisterBalanceInput,
} from "@/validations/registerBalance.validations";
import { Button, Chip, Input, Spinner } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import InputGroupSection from "../forms/InputGroupSection";
import { moneyFormatter } from "@/utils/formatters";
import { dateToString, formatOnlyTime } from "@/utils/dateUtils";
import { FormattedNumberInput } from "../forms/FormattedNumberInput";
import { REGISTER_BALANCE_STATUS_MAP } from "@/types/registerBalance.types";

interface Props {
  data: RegisterBalance;
}

const RegisterBalanceCard = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: expenses, isLoading: expensesLoading } =
    useCollectionQuery<Expense>(
      "expenses",
      [where("shift_id", "==", data?.id || "")],
      [data?.id],
      transformExpense,
    );

  const { data: mobilePayments, isLoading: mobilePaymentsLoading } =
    useCollectionQuery<MobilePayment>(
      "mobile_payments",
      [where("shift_id", "==", data?.id || "")],
      [data?.id],
      transformMobilePayment,
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
      total_mobile_payments: 0,
      money: {
        bs: {
          pos_batches: [],
        },
      },
    },
  });

  const onSubmit: SubmitHandler<RegisterBalanceInput> = async (formData) => {
    console.log(formData);

    setIsLoading(true);

    const res = await updateRegisterBalance(data.id, {
      ...formData,
      status: "CHECKED",
    });

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
  };

  const totalMobilePayments = mobilePayments.reduce(
    (acc, item) => acc + item.amount,
    0,
  );

  useEffect(() => {
    if (data && !mobilePaymentsLoading) {
      let newData = { ...data };

      if (newData.money) {
        newData.money.bs.pos_system =
          newData.money.bs.pos_system || newData.money.bs.pos;

        if (newData.money.bs.mobile != totalMobilePayments) {
          newData.money.bs.mobile = totalMobilePayments;
          newData.money.bs.mobile_system = totalMobilePayments;
        }
      }

      reset(newData);
      // populate form values on start
    }
  }, [mobilePaymentsLoading, totalMobilePayments, data]);

  const usd1 =
    Number(watch("money.usd.rate1")) * Number(watch("money.usd.cash1"));
  const usd2 =
    Number(watch("money.usd.rate2")) * Number(watch("money.usd.cash2"));
  const usd3 =
    Number(watch("money.usd.rate3")) * Number(watch("money.usd.cash3"));

  const posBatches = watch("money.bs.pos_batches") || [];

  const isCompoundLoading = mobilePaymentsLoading || expensesLoading;

  return (
    <div
      key={data.id}
      className="w-full border border-divider rounded-2xl p-3 flex flex-col gap-2"
    >
      <header className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <p className="text-sm text-soft-light">
            #{data.checkout_number}
            {" - "}
            <span className="text-sm text-light">
              {data.user_snapshot.name.split(" ")[0]}{" "}
              {data.user_snapshot.name.split(" ")[1]}
            </span>
          </p>

          <Chip
            variant="dot"
            size="sm"
            color={
              data.status === "OPEN"
                ? "default"
                : data.status === "PENDING"
                  ? "warning"
                  : "success"
            }
            className="text-xs text-soft-light"
          >
            {REGISTER_BALANCE_STATUS_MAP[data.status].title}
          </Chip>
        </div>

        {data.z_report_number ? (
          <p className="text-sm text-soft-light">Z# {data.z_report_number}</p>
        ) : null}
      </header>

      <div className="flex flex-col gap-2">
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
                startContent={<p className="font-medium text-stone-300">COP</p>}
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
                startContent={<p className="font-medium text-stone-300">COP</p>}
                value={moneyFormatter.format(usd2)}
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
                name={"money.usd.rate3"}
                placeholder={"Tasa 3"}
              />
              <FormattedNumberInput
                control={control}
                name={"money.usd.cash3"}
                placeholder={"Efectivo 3"}
              />

              <Input
                aria-label="Dólares 3"
                type="text"
                classNames={{
                  base: "w-full",
                  inputWrapper: "h-12",
                }}
                startContent={<p className="font-medium text-stone-300">COP</p>}
                value={moneyFormatter.format(usd3)}
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
              startContent={<p className="font-medium text-stone-300">COP</p>}
              value={moneyFormatter.format(usd1 + usd2 + usd3)}
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
                isDisabled
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
          {expensesLoading ? <Spinner label="Cargando gastos..." /> : null}

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
                        {dateToString(expense.created_at, "DD/MM/YYYY")}{" "}
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

        <InputGroupSection title="Datos de los pago móvil">
          {mobilePaymentsLoading ? (
            <Spinner label="Cargando pagos móvil..." />
          ) : null}

          {!mobilePaymentsLoading && mobilePayments ? (
            mobilePayments.length ? (
              <div className="flex flex-col gap-1.5">
                {mobilePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-lg border border-stone-700 bg-layer-3 w-full items-center flex px-2 py-2"
                  >
                    <div className="flex flex-col flex-1">
                      <p className="text-small text-soft-light">
                        {dateToString(payment.created_at, "DD/MM/YYYY")}{" "}
                        {formatOnlyTime(payment.created_at)}
                      </p>
                    </div>

                    <p className="text-sm">
                      {moneyFormatter.format(payment.amount)} bs
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-soft-light">
                No hay pagos móvil registrados
              </p>
            )
          ) : null}
        </InputGroupSection>

        {data.money ? (
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
                  ${moneyFormatter.format(Number(usd1 + usd2 + usd3))}
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
                      (usd1 + usd2 + usd3) +
                      Number(data.total_expenses),
                  )}
                </p>
              </div>
            </div>
          </InputGroupSection>
        ) : null}

        {data.status !== "OPEN" ? (
          <Button
            type="submit"
            color="primary"
            className="w-full mt-4"
            isLoading={isLoading}
          >
            Confirmar cierre de caja
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default RegisterBalanceCard;
