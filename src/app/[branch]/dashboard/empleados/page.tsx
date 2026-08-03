"use client";

import CardTitle from "@/components/home/CardTitle";
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconUserDollar,
  IconUserOff,
} from "@tabler/icons-react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useMemo, useState } from "react";
import { DynamicTable } from "@/components/ui/table/DynamicTable";

import { Employee } from "@/validations/employee.validations";
import { dateToString } from "@/utils/dateUtils";
import { defaultCellValue } from "@/utils/table.utils";
import { moneyFormatter, numberFormatter } from "@/utils/formatters";
import EmployeeTableToolbar, {
  EmployeeFilters,
} from "@/components/employee/EmployeeTableToolbar";
import FloatingActionButton from "@/components/general/FloatingActionButton";

import { USER_ROLE_MAP } from "@/types/user.types";
import {
  Button,
  Chip,
  Link as HeroUILink,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";

import { toast } from "sonner";
import { BaseTableProps } from "@/components/ui/table/BaseTable";
import { QueryConstraint, where } from "firebase/firestore";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { transformEmployee } from "@/utils/normalizers/normalizeEmployees";
import {
  hardDeleteEmployee,
  softDeleteEmployee,
  terminateEmployee,
} from "@/services/employee.service";
import BranchLink from "@/components/general/BranchLink";
import { useParams } from "next/navigation";
import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";

export default function EmployeesPage() {
  const branch = useParams().branch as keyof typeof BUSINESS_BRANCH_MAP;

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [isTerminating, setIsTerminating] = useState<boolean>(false);
  const [terminationReason, setTerminationReason] = useState<string>("");
  const [terminationError, setTerminationError] = useState<string | null>(null);

  const terminationDisclosure = useDisclosure();

  const [filters, setFilters] = useState<EmployeeFilters>({
    search: "",
    role: undefined,
    dateRange: {
      start: today(getLocalTimeZone()) as any,
      end: today(getLocalTimeZone()) as any,
    },
  });

  const queryConstraints = useMemo(() => {
    const constraints: QueryConstraint[] = [
      where("is_deleted", "==", false),
      where("branch", "==", branch),
    ];

    if (filters.search) {
      constraints.push(where("name", "==", filters.search));
    }
    if (filters.role) constraints.push(where("role", "==", filters.role));

    if (filters.shift) constraints.push(where("shift", "==", filters.shift));

    /* if (!filters.showFired) constraints.push(where("is_fired", "==", false)); */

    return constraints;
  }, [filters]);

  const { data, isLoading, refetch } = useCollectionQuery<Employee>(
    "employees",
    queryConstraints,
    [filters],
    transformEmployee,
  );

  const tableColumns = [
    { key: "role", label: "Rol" },
    { key: "name", label: "Nombre" },
    { key: "shift", label: "Turno" },
    { key: "doc_number", label: "Cédula" },
    { key: "salary", label: "Salario" },
    { key: "status", label: "Estado" },
    { key: "hired_at", label: "Contratación" },
    { key: "cv", label: "CV" },
    { key: "rif", label: "RIF" },
    { key: "actions", label: "Acciones" },
  ];

  const renderCell: BaseTableProps<Employee>["renderCell"] = (
    item,
    columnKey,
    handleDelete,
  ) => {
    switch (columnKey) {
      case "role":
        return USER_ROLE_MAP[item.role].title;
      case "name":
        return `${item.name.split(" ")[0]} ${item.last_name.split(" ")[0]}`;

      case "shift":
        return `${item.shift_data.title}`;
      case "hired_at":
        return dateToString(item.hired_at, "DD/MM/YYYY");
      case "doc_number":
        return `${item.doc_type}${numberFormatter.format(item.doc_number)}`;
      case "salary":
        return `$${moneyFormatter.format(item.salary)}`;

      case "status":
        return (
          <Tooltip
            content={
              <div className="flex flex-col p-2">
                <p className="text-soft-light text-sm">Motivo</p>
                <p className="first-letter:uppercase">
                  {item.termination_reason}
                </p>

                {item.terminated_at && (
                  <p className="mt-2 text-xs text-right w-full text-soft-light">
                    {dateToString(item.terminated_at, "DD/MM/YYYY")}
                  </p>
                )}
              </div>
            }
            isDisabled={item.status !== "TERMINATED"}
          >
            <Chip
              variant="dot"
              color={
                item.status === "ACTIVE"
                  ? "success"
                  : item.status === "SUSPENDED"
                    ? "warning"
                    : "danger"
              }
            >
              {item.status_data.title}
            </Chip>
          </Tooltip>
        );

      case "cv":
        if (!item.cv_attachment)
          return <p className="text-sm text-soft-light">Sin asignar</p>;

        return (
          <HeroUILink
            href={item.cv_attachment.url}
            target="_blank"
            className="underline"
            isExternal
            showAnchorIcon
          >
            cv.
            {item.cv_attachment.mimeType.split("/").pop()}
          </HeroUILink>
        );
      case "rif":
        if (!item.rif_attachment)
          return <p className="text-sm text-soft-light">Sin asignar</p>;

        return (
          <HeroUILink
            href={item.rif_attachment.url}
            target="_blank"
            className="underline"
            isExternal
            showAnchorIcon
          >
            rif.
            {item.rif_attachment.mimeType.split("/").pop()}
          </HeroUILink>
        );
      case "actions":
        return (
          <div className="flex gap-2 justify-center">
            <Button
              as={BranchLink}
              href={`/dashboard/empleados/${item.id}`}
              isIconOnly
              size="sm"
              variant="flat"
            >
              <IconEdit />
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="warning"
              variant="flat"
              onPress={(e) => {
                setSelectedEmployee(item);
                terminationDisclosure.onOpen();
              }}
            >
              <IconUserOff />
            </Button>

            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="flat"
              onPress={(e) => handleDelete(item, e)}
            >
              <IconTrash />
            </Button>
          </div>
        );
      default:
        return defaultCellValue(item, columnKey);
    }
  };

  const handleTermination = async () => {
    if (!selectedEmployee) return;
    if (!terminationReason) {
      setTerminationError("Debes especificar la terminación del contrato");
      return;
    }
    setTerminationError(null);
    setTerminationReason("");

    setIsTerminating(true);

    const res = await terminateEmployee(selectedEmployee.id, terminationReason);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);

    setIsTerminating(false);
    refetch();
    terminationDisclosure.onClose();
  };

  const handleDelete = async (id: string, hardDelete: boolean = false) => {
    const res = await (hardDelete
      ? hardDeleteEmployee(id)
      : softDeleteEmployee(id));

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    refetch();
    toast.success("Proveedor eliminado");
  };

  return (
    <main className="flex gap-5 h-full">
      <FloatingActionButton
        label="Nuevo"
        startContent={<IconPlus />}
        as={BranchLink}
        href="/dashboard/empleados/crear"
      />
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4 items-stretch">
        <CardTitle Icon={IconUserDollar} title="Empleados" />
        <div className="w-full overflow-x-auto h-full flex">
          <Modal
            isOpen={terminationDisclosure.isOpen}
            onClose={terminationDisclosure.onClose}
            backdrop={"blur"}
            classNames={{
              backdrop: "bg-danger/10",
              base: "border-danger/20 border text-soft-light",

              header: "bg-danger/30 text-light",

              /* closeButton: "hover:bg-white/5 active:bg-white/10", */
            }}
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-0">
                Confirma la terminación del contrato
                <p className="text-soft-light text-sm font-normal">
                  Terminar contrato de {selectedEmployee?.name}{" "}
                  {selectedEmployee?.last_name}
                </p>
              </ModalHeader>

              <ModalBody className="pt-6">
                <Textarea
                  label="Motivo/Razón"
                  variant="bordered"
                  size="sm"
                  radius="lg"
                  isInvalid={Boolean(terminationError)}
                  errorMessage={terminationError}
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={terminationDisclosure.onClose}
                  isDisabled={isTerminating}
                >
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={handleTermination}
                  isLoading={isTerminating}
                >
                  Sí, terminar contrato de{" "}
                  {selectedEmployee?.name.split(" ")[0]}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <DynamicTable<Employee>
            columns={tableColumns}
            data={data}
            topContent={
              <EmployeeTableToolbar setFilters={setFilters} filters={filters} />
            }
            isLoading={isLoading}
            renderCell={renderCell}
            onDeleteAction={handleDelete}
          />
        </div>
      </section>
    </main>
  );
}
