"use client";

import InputGroupSection from "@/components/forms/InputGroupSection";
import CardTitle from "@/components/home/CardTitle";
import {
  Button,
  Form,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { IconUserDollar } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PROVIDER_COUNTRY_OPTIONS,
  PROVIDER_TYPE_MAP,
  PROVIDER_TYPES,
} from "@/types/providersTypes";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import CountryPicker from "@/components/forms/CountryPicker";
import {
  createProviderSchema,
  Provider,
  ProviderInput,
  ProviderOutput,
} from "@/validations/provider.validations";
import { createProvider, updateProvider } from "@/services/provider.service";
import ProviderForm from "@/components/provider/ProviderForm";
import { useDoc } from "@/hooks/useDoc";
import { Employee, EmployeeInput } from "@/validations/employee.validations";
import { updateEmployee } from "@/services/employee.service";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { useBranchRouter } from "@/hooks/useBranchRouter";

export default function UpdateEmployeePage() {
  const router = useBranchRouter();
  const { id } = useParams();

  const [formLoading, setFormLoading] = useState<boolean>(false);

  const { data, isLoading } = useDoc<Employee>("employees", id?.toString());

  const onSubmit = async (data: EmployeeInput) => {
    if (!id) return toast.warning("Empleado no encontrado");
    setFormLoading(true);

    const res = await updateEmployee(id.toString(), data);

    setFormLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/dashboard/empleados");
  };

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle
          Icon={IconUserDollar}
          title="Actualizar empleado"
          endContent={
            <Button
              form="employeeForm"
              type="submit"
              variant="solid"
              color="primary"
              isLoading={formLoading}
            >
              Guardar cambios
            </Button>
          }
        />

        {isLoading ? <Spinner /> : null}
        {!isLoading && data ? (
          <EmployeeForm initialData={data} onSubmit={onSubmit} />
        ) : null}
      </section>
    </main>
  );
}
