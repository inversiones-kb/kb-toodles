"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Expense } from "@/validations/expense.validations";
import { updateExpense, softDeleteExpense } from "@/services/expense.service";
import { dateToString, formatOnlyTime } from "@/utils/dateUtils";
import { moneyFormatter } from "@/utils/formatters";
import { FormattedNumberInput } from "@/components/forms/FormattedNumberInput";

interface ExpenseRowProps {
  expense: Expense;
  editable: boolean;
  onChanged: () => void;
}

export default function ExpenseRow({
  expense,
  editable,
  onChanged,
}: ExpenseRowProps) {
  const editDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      amount: expense.amount,
      description: expense.description,
    },
  });

  const openEdit = () => {
    reset({ amount: expense.amount, description: expense.description });
    editDisclosure.onOpen();
  };

  const onSave = handleSubmit(async (data) => {
    if (!data.amount || Number(data.amount) < 1) {
      return toast.error("El valor mínimo es 1");
    }

    setIsSaving(true);
    const res = await updateExpense(expense.id, {
      amount: Number(data.amount),
      description: data.description,
    });
    setIsSaving(false);

    if (!res.success) return toast.error(res.message);

    toast.success(res.message);
    editDisclosure.onClose();
    onChanged();
  });

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    const res = await softDeleteExpense(expense.id);
    setIsDeleting(false);

    if (!res.success) return toast.error(res.message);

    toast.success(res.message);
    deleteDisclosure.onClose();
    onChanged();
  };

  return (
    <div className="rounded-lg border border-stone-700 bg-layer-3 w-full items-center flex px-2 py-2 gap-2">
      <div className="flex flex-col flex-1">
        <p className="text-sm first-letter:uppercase">
          {expense.description || "(Sin motivo)"}
        </p>
        <p className="text-small text-soft-light">
          {dateToString(expense.created_at, "DD/MM/YYYY")}{" "}
          {formatOnlyTime(expense.created_at)}
        </p>
      </div>

      <p className="text-sm">
        {expense.currency} {moneyFormatter.format(expense.amount)}
      </p>

      {editable ? (
        <div className="flex gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Editar gasto"
            onPress={openEdit}
          >
            <IconPencil size={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            aria-label="Eliminar gasto"
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
              <ModalHeader>Editar gasto</ModalHeader>
              <ModalBody className="gap-3">
                <FormattedNumberInput
                  control={control}
                  name="amount"
                  placeholder="Cantidad"
                />
                <Textarea
                  aria-label="Motivo del gasto"
                  placeholder="Motivo del gasto"
                  variant="bordered"
                  rows={3}
                  {...register("description")}
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
              <ModalHeader>¿Eliminar este gasto?</ModalHeader>
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
