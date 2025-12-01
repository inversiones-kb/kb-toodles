"use client";

import InputGroupSection from "@/components/forms/InputGroupSection";
import CardTitle from "@/components/home/CardTitle";
import {
  Button,
  DatePicker,
  Form,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { IconPlus, IconUserDollar } from "@tabler/icons-react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NewInventoryAuditFields } from "@/types/inventoryAuditsTypes";
import { handleNewInventoryAudit } from "@/handlers/inventoryAudits/handeleNewInventoryAudit";
import { CalendarDate, parseDate } from "@internationalized/date";
import { dateToString } from "@/utils/dateUtils";

const validationSchema = z.object({
  date: z.custom<CalendarDate>(),
});

export default function NewInventoryAuditPage() {
  const {
    isOpen: newProductIsOpen,
    onOpen: newProductOnOpen,
    onOpenChange: newProductOnOpenChange,
  } = useDisclosure();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewInventoryAuditFields>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      date: parseDate(dateToString(new Date(), "YYYY-MM-DD")),
      items: [],
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<NewInventoryAuditFields> = async (data) => {
    console.log(data);
    return;
    setIsLoading(true);
    const res = await handleNewInventoryAudit(data);

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/auditorias-inventario");
  };

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Proveedores" />
        <div className="w-full overflow-y-auto h-full flex justify-center">
          <Form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full">
            <h2 className="text-2xl text-center w-full font-semibold mb-4">
              Completa el formulario
            </h2>
            <InputGroupSection title="Datos de la auditoría">
              <Controller
                control={control}
                name="date"
                render={({ field, fieldState }) => (
                  <DatePicker
                    {...field}
                    label="Fecha"
                    variant="bordered"
                    size="sm"
                    radius="lg"
                    isInvalid={fieldState.invalid}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </InputGroupSection>

            <InputGroupSection title="Productos">
              <Button startContent={<IconPlus />} onPress={newProductOnOpen}>
                Añadir un nuevo producto
              </Button>

              <Modal
                isOpen={newProductIsOpen}
                onOpenChange={newProductOnOpenChange}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader>Añadir un nuevo producto</ModalHeader>
                      <ModalBody></ModalBody>
                      <ModalFooter></ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </InputGroupSection>

            <Button
              type="submit"
              color="primary"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              Guardar nuevo proveedor
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}
