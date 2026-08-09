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
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useDoc } from "@/hooks/useDoc";

export default function CashierNewExpensePage() {
  const branch = useParams().branch as BusinessBranch;

  const user = useAuthStore((store) => store.user);

  const { currentShift } = useCheckoutStore();

  const { data: shift, isLoading: shiftLoading } = useDoc<RegisterBalance>(
    "register_balances",
    currentShift?.shift_id,
  );

  /* const {
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
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      currency: "COP",
      branch,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useBranchRouter();

  const onSubmit: SubmitHandler<ExpenseInput> = async (data) => {
    console.log(data);
    if (!user) {
      return toast.error("No estás autenticado");
    }

    setIsLoading(true);
    const res = await createExpense({
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
        currency: "COP",
        branch,
      });
    }
  }, [shiftLoading]);

  console.log(errors);

  return (
    <main className="h-dvh max-h-full bg-background flex justify-center items-center">
      <section className="w-full max-w-lg p-3 gap-4 rounded-3xl overflow-y-auto h-fit bg-layer-2 flex flex-col justify-center">
        <CardTitle
          title={`Nuevo gasto en la caja ${shift ? shift.checkout_number : "..."}`}
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
                  {/* <div className="flex items-center gap-2 h-12 w-full">
                    <Input
                      aria-label="Número de caja"
                      classNames={{
                        base: "flex-1 h-full w-1/2",
                        inputWrapper: "h-full",
                        input: "w-min",
                      }}
                      value={watch("checkout_number").toString()}
                      startContent={
                        <p className="font-medium text-sm text-stone-300 min-w-max">
                          Caja número
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
                    <div className="flex-1 flex h-full gap-1">
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
                    </div>
                  </div> */}

                  <FormattedNumberInput
                    control={control}
                    name="amount"
                    placeholder="Cantidad"
                  />

                  <Textarea
                    aria-label="Motivo del gasto"
                    rows={4}
                    placeholder="Motivo del gasto"
                    variant="bordered"
                    {...register("description")}
                    isInvalid={Boolean(errors.description)}
                    errorMessage={errors.description?.message}
                  />

                  <Button
                    type="submit"
                    color="primary"
                    className="w-full mt-4"
                    isLoading={isLoading}
                  >
                    Guardar nuevo gasto
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
