import { RegisterExpense } from "@/types/registerBalance.types";
import { ExpenseProxy } from "@/validations/expense.validations";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  NumberInput,
  Textarea,
} from "@heroui/react";
import clsx from "clsx";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  handleNewExpense: (data: Omit<ExpenseProxy, "id">) => void;
}

const RegisterNewExpense = ({
  isOpen,
  onOpenChange,
  handleNewExpense,
}: Props) => {
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<"COP" | "USD" | "BS">("COP");

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Nuevo gasto
            </ModalHeader>
            <ModalBody>
              {/* <div className="flex w-full gap-2">
                <Button
                  variant="bordered"
                  className={clsx([
                    currency === "COP" && "bg-light/20",
                    "w-full",
                  ])}
                  onPress={(_) => setCurrency("COP")}
                >
                  COP
                </Button>
                <Button
                  variant="bordered"
                  className={clsx([
                    currency === "USD" && "bg-light/20",
                    "w-full",
                  ])}
                  onPress={(_) => setCurrency("USD")}
                >
                  USD
                </Button>
                <Button
                  variant="bordered"
                  className={clsx([
                    currency === "BS" && "bg-light/20",
                    "w-full",
                  ])}
                  onPress={(_) => setCurrency("BS")}
                >
                  BS
                </Button>
              </div> */}
              <NumberInput
                aria-label="Cantidad del gasto"
                startContent={<p className="font-medium text-stone-300">$</p>}
                placeholder="Cantidad del gasto"
                variant="bordered"
                value={amount}
                classNames={{
                  inputWrapper: "h-12",
                }}
                onValueChange={(value) =>
                  setAmount(
                    value.toString().startsWith("0")
                      ? Number(value.toString().replace("0", "1"))
                      : Number(value),
                  )
                }
              />
              <Textarea
                aria-label="Motivo del gasto"
                rows={4}
                placeholder="Motivo del gasto"
                variant="bordered"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" variant="flat" onPress={onClose}>
                Cerrar
              </Button>
              <Button
                color="primary"
                onPress={(_) => {
                  if (amount === 0)
                    return toast.warning("El valor del gasto no puede ser 0");

                  handleNewExpense({
                    amount,
                    description,
                  });

                  setCurrency("COP");
                  setAmount(0);
                  setDescription("");

                  onClose();
                }}
              >
                Guardar gasto
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RegisterNewExpense;
