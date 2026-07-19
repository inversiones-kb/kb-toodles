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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserInput, createUserSchema } from "@/validations/user.validations";
import useEmployees from "@/hooks/employee/useEmployees";
import { createUserAction } from "@/actions/user.actions";
import UserForm from "@/components/user/UserForm";

export default function CreateUserPage() {
  const {
    watch,
    setValue,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      employee_id: undefined,
    },
  });
  const router = useRouter();

  const { employees, isLoading: employeesLoading } = useEmployees({});

  const onSubmit = async (data: UserInput) => {
    const res = await createUserAction(data);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/dashboard/usuarios");
  };

  useEffect(() => {
    if (!employeesLoading && employees.length) {
      const first = employees[0];
      setValue("employee_id", first.id);
      setValue("name", first.name);
      setValue("last_name", first.last_name);
    }
  }, [employeesLoading]);

  /* console.log(watch("employee_id")); */
  console.log(errors);

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Crear usuario" />
        <UserForm onSubmit={onSubmit} />
      </section>
    </main>
  );
}
