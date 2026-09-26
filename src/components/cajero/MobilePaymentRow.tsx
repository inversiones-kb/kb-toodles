"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { MobilePayment } from "@/validations/mobile_payment.validations";
import {
  updateMobilePayment,
  softDeleteMobilePayment,
} from "@/services/mobile-payment.service";
import { dateToString, formatOnlyTime } from "@/utils/dateUtils";
import { moneyFormatter } from "@/utils/formatters";
import { FormattedNumberInput } from "@/components/forms/FormattedNumberInput";

interface MobilePaymentRowProps {
  payment: MobilePayment;
  editable: boolean;
  onChanged: () => void;
}

export default function MobilePaymentRow({
  payment,
  editable,
  onChanged,
}: MobilePaymentRowProps) {
  const editDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      amount: payment.amount,
      ref: payment.ref,
    },
  });

  const openEdit = () => {
    reset({ amount: payment.amount, ref: payment.ref });
    editDisclosure.onOpen();
  };

  const onSave = handleSubmit(async (data) => {
    if (!data.amount || Number(data.amount) < 1) {
      return toast.error("El valor mínimo es 1");
    }
    if (!data.ref) {
      return toast.error("Ingresa los últimos dígitos del número de referencia");
    }

    setIsSaving(true);
    const res = await updateMobilePayment(payment.id, {
      amount: Number(data.amount),
      ref: data.ref,
    });
    setIsSaving(false);

    if (!res.success) return toast.error(res.message);

    toast.success(res.message);
    editDisclosure.onClose();
    onChanged();
  });

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    const res = await softDeleteMobilePayment(payment.id);
    setIsDeleting(false);

    if (!res.success) return toast.error(res.message);

    toast.success(res.message);
    deleteDisclosure.onClose();
    onChanged();
  };

  return (
    <div className="rounded-lg border border-stone-700 bg-layer-3 w-full items-center flex px-2 py-2 gap-2">
      <div className="flex flex-col flex-1">
        <p className="text-sm">Ref. {payment.ref}</p>
        <p className="text-small text-soft-light">
          {dateToString(payment.created_at, "DD/MM/YYYY")}{" "}
          {formatOnlyTime(payment.created_at)}
        </p>
      </div>

      <p className="text-sm">{moneyFormatter.format(payment.amount)} bs</p>

      {editable ? (
        <div className="flex gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Editar pago móvil"
            onPress={openEdit}
          >
            <IconPencil size={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            aria-label="Eliminar pago móvil"
            onPress={deleteDisclosure.onOpen}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      ) : null}

      <Modal
        isOpen={editDisclosure.isOpen}
        onOpenChange={editDisclosure.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Editar pago móvil</ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  placeholder="Referencia"
                  aria-label="Referencia"
                  variant="bordered"
                  size="sm"
                  {...register("ref")}
                />
                <FormattedNumberInput
                  control={control}
                  name="amount"
                  placeholder="Cantidad"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={isSaving}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => onSave()}
                  isLoading={isSaving}
                >
                  Guardar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteDisclosure.isOpen}
        onOpenChange={deleteDisclosure.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>¿Eliminar este pago móvil?</ModalHeader>
              <ModalBody>
                <p className="text-sm text-soft-light font-light">
                  Esta acción no se puede deshacer
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={onConfirmDelete}
                  isLoading={isDeleting}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
