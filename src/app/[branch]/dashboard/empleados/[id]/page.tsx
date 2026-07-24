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
import { FileMetadata } from "@/types/file.types";
import { uploadFileToStorage } from "@/services/storage.service";

export default function UpdateEmployeePage() {
  const router = useBranchRouter();
  const { id } = useParams();

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: initialData, isLoading } = useDoc<Employee>(
    "employees",
    id?.toString(),
  );

  const onSubmit = async (data: EmployeeInput) => {
    if (!id) return toast.warning("Empleado no encontrado");
    setFormLoading(true);

    const progressMap = { cv: 0, rif: 0 };
    let amountOfFiles = [data.cv_attachment, data.rif_attachment].filter(
      (e) => e !== undefined,
    ).length;

    const updateGlobalProgress = () => {
      // Promediamos los valores (suma de ambos / 2)
      const totalProgress = (progressMap.cv + progressMap.rif) / amountOfFiles;
      setUploadProgress(totalProgress);
    };
    let cvMetadata: FileMetadata | null = null;
    let rifMetadata: FileMetadata | null = null;

    if (data.cv_attachment) {
      cvMetadata = await uploadFileToStorage(
        data.cv_attachment,
        "employees/cvs",
        (progress) => {
          progressMap.cv = progress;
          updateGlobalProgress();
        },
      );
    }

    if (data.rif_attachment) {
      rifMetadata = await uploadFileToStorage(
        data.rif_attachment,
        "employees/rifs",
        (progress) => {
          progressMap.rif = progress;
          updateGlobalProgress();
        },
      );
    }

    let updateData = {
      ...data,
      cv_attachment: initialData?.cv_attachment,
      rif_attachment: initialData?.rif_attachment,
    };

    if (cvMetadata) updateData["cv_attachment"] = cvMetadata;
    if (rifMetadata) updateData["rif_attachment"] = rifMetadata;

    const res = await updateEmployee(id.toString(), updateData);

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
        {!isLoading && initialData ? (
          <EmployeeForm initialData={initialData} onSubmit={onSubmit} />
        ) : null}
      </section>
    </main>
  );
}
