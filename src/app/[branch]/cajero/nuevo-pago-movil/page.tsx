"use client";

import CardTitle from "@/components/home/CardTitle";

import { Button, Form, Input, Spinner, Textarea } from "@heroui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createExpenseSchema,
  ExpenseInput,
} from "@/validations/expense.validations";
import { createExpense } from "@/services/expense.service";
import { useAuthStore } from "@/app/context/AuthProvider";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { where } from "firebase/firestore";
import EmptyState from "@/components/general/EmptyState";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import BranchLink from "@/components/general/BranchLink";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { BusinessBranch } from "@/types/businessBranch.types";
import { FormattedNumberInput } from "@/components/forms/FormattedNumberInput";
import {
  createMobilePaymentSchema,
  MobilePaymentInput,
} from "@/validations/mobile_payment.validations";
import { createMobilePayment } from "@/services/mobile-payment.service";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useDoc } from "@/hooks/useDoc";

export default function CashierNewMobilePayment() {
  const branch = useParams().branch as BusinessBranch;

  const user = useAuthStore((store) => store.user);

  const { currentShift } = useCheckoutStore();

  const { data: shift, isLoading: shiftLoading } = useDoc<RegisterBalance>(
    "register_balances",
    currentShift?.shift_id,
  );

  /*  const {
    data: activeShifts,
    isLoading: shiftLoading,

    error,
    refetch,
  } = useCollectionQuery<RegisterBalance>(
    "register_balances",
    [where("user_id", "==", user?.uid || ""), where("status", "==", "OPEN")],
    [user?.uid], // 🔥 CRUCIAL: Solo se vuelve a ejecutar si el usuario cambia
  );

  const shift = activeShifts[0]; */

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<MobilePaymentInput>({
    resolver: zodResolver(createMobilePaymentSchema),
    defaultValues: {
      branch,
      amount: 0,
      ref: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useBranchRouter();

  const onSubmit: SubmitHandler<MobilePaymentInput> = async (data) => {
    console.log(data);
    if (!user) {
      return toast.error("No estás autenticado");
    }

    setIsLoading(true);
    const res = await createMobilePayment({
      ...data,
      user_id: user.uid,
    });

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/cajero");
  };

  useEffect(() => {
    if (!shiftLoading && shift) {
      reset({
        checkout_number: shift.checkout_number,
        shift_id: shift.id,
        branch,
        amount: 0,
        ref: "",
      });
    }
  }, [shiftLoading]);

  console.log(errors);

  return (
    <main className="h-dvh max-h-full bg-background flex justify-center items-center">
      <section className="w-full max-w-lg p-3 gap-4 rounded-3xl overflow-y-auto h-fit bg-layer-2 flex flex-col justify-center">
        <CardTitle
          title={`Nuevo pago móvil en la caja ${shift ? shift.checkout_number : "..."}`}
          backButton={true}
        />

        <div className="w-full overflow-y-auto h-full flex justify-center p-4">
          <Form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
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

                  <Input
                    placeholder="Referencia"
                    aria-label="Referencia"
                    variant="bordered"
                    size="sm"
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-12",
                    }}
                    radius="lg"
                    isInvalid={Boolean(errors.ref?.message)}
                    errorMessage={errors.ref?.message}
                    {...register("ref")}
                  />

                  <FormattedNumberInput
                    control={control}
                    name="amount"
                    placeholder="Cantidad"
                  />

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full mt-4"
                    isLoading={isLoading}
                  >
                    Guardar nuevo pago móvil
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
