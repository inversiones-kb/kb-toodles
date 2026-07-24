"use client";

import CardTitle from "@/components/home/CardTitle";
import { IconUserDollar } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { today, getLocalTimeZone } from "@internationalized/date";
import {
  EmployeeInput,
  createEmployeeSchema,
} from "@/validations/employee.validations";
import { createEmployee } from "@/services/employee.service";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { uploadFileToStorage } from "@/services/storage.service";
import { Button, Progress } from "@heroui/react";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { FileMetadata } from "@/types/file.types";

export default function CreateEmployeePage() {
  const router = useBranchRouter();
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onSubmit = async (data: EmployeeInput) => {
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

    const res = await createEmployee({
      ...data,
      cv_attachment: cvMetadata,
      rif_attachment: rifMetadata,
    });

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
          title="Crear empleado"
          loadingProgress={uploadProgress}
          endContent={
            <Button
              form="employeeForm"
              type="submit"
              variant="solid"
              color="primary"
              isLoading={formLoading}
            >
              Crear empleado
            </Button>
          }
        />

        <EmployeeForm onSubmit={onSubmit} />
      </section>
    </main>
  );
}
