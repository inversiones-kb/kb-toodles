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
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  UserInput,
  createUserSchema,
} from "@/validations/user.validations";
import useEmployees from "@/hooks/employee/useEmployees";
import { createUser, updateUser } from "@/services/user.service";
import { USER_ROLE_OPTIONS, USER_ROLES } from "@/types/user.types";
import { createUserAction } from "@/actions/user.actions";
import UserForm from "@/components/user/UserForm";
import { useDoc } from "@/hooks/useDoc";
import { Provider } from "@/validations/provider.validations";
import { useBranchRouter } from "@/hooks/useBranchRouter";

export default function UpdateUserPage() {
  const router = useBranchRouter();
  const { id } = useParams();

  const { data, isLoading } = useDoc<User>("users", id?.toString());

  const onSubmit = async (data: UserInput) => {
    if (!id) return toast.warning("Usuario no encontrado");

    const res = await updateUser(id.toString(), data);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/dashboard/usuarios");
  };

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Actualizar usuario" />

        {isLoading ? <Spinner /> : null}
        {!isLoading && data ? (
          <UserForm initialData={data} onSubmit={onSubmit} />
        ) : null}
      </section>
    </main>
  );
}
