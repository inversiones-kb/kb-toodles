"use client";

import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import InputGroupSection from "../forms/InputGroupSection";
import {
  createUserSchema,
  User,
  UserInput,
  userSchema,
} from "@/validations/user.validations";
import { USER_ROLE_OPTIONS, USER_ROLES } from "@/types/user.types";
import { IconInfoCircle, IconUserPlus } from "@tabler/icons-react";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { Employee } from "@/validations/employee.validations";
import { transformEmployee } from "@/utils/normalizers/normalizeEmployees";
import BranchLink from "../general/BranchLink";
import { useParams } from "next/navigation";
import {
  BUSINESS_BRANCH_MAP,
  BusinessBranch,
} from "@/types/businessBranch.types";
import { where } from "firebase/firestore";

interface Props {
  onSubmit: SubmitHandler<UserInput>;
  initialData?: User;
}

const UserForm = ({ onSubmit, initialData }: Props) => {
  const branch = useParams().branch as BusinessBranch;

  const { data: employees, isLoading: employeesLoading } =
    useCollectionQuery<Employee>(
      "employees",
      [where("branch", "==", branch)],
      [branch],
      transformEmployee,
    );

  const {
    watch,
    setValue,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserInput>({
    resolver: zodResolver(initialData ? userSchema : createUserSchema),
    defaultValues: initialData || {
      name: "",
      last_name: "",
      email: "",
      branch: branch,
    },
  });

  useEffect(() => {
    if (!employeesLoading && employees.length && !initialData) {
      const first = employees[0];
      setValue("employee_id", first.id);
      setValue("name", first.name);
      setValue("last_name", first.last_name);
    }
  }, [employeesLoading]);

  /* const selectedEmployee = employees.find((e) => e.id === watch("employee_id")); */

  return (
    <div className="w-full overflow-y-auto h-full flex justify-center">
      <Form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full">
        <h2 className="text-2xl text-center w-full font-semibold mb-4">
          Completa el formulario
        </h2>

        <InputGroupSection title="Datos de identificación">
          {employeesLoading ? (
            <div className="h-12 w-full justify-center flex">
              <Spinner />
            </div>
          ) : employees.length ? (
            <Select
              isDisabled={initialData != undefined}
              label="Empleado"
              variant="bordered"
              size="sm"
              radius="lg"
              selectionMode="single"
              defaultSelectedKeys={[employees.length ? employees[0].id : ""]}
              disallowEmptySelection={true}
              {...register("employee_id")}
              isInvalid={Boolean(errors.employee_id?.message)}
              errorMessage={errors.employee_id?.message}
              items={employees}
              renderValue={(items) =>
                items.map((item) => {
                  return (
                    <p key={item.key}>
                      {item.rendered} - {item.data?.role_data.title}
                    </p>
                  );
                })
              }
              onChange={(e) => {
                const selected = employees.find(
                  (employee) => employee.id === e.target.value,
                );
                if (!selected) return;
                setValue("name", selected.name);
                setValue("last_name", selected?.last_name);
              }}
            >
              {(item) => (
                <SelectItem key={item.id}>
                  {item.name.split(" ")[0]} {item.last_name.split(" ")[0]}
                </SelectItem>
              )}
            </Select>
          ) : (
            <Alert
              color="warning"
              classNames={{
                description: "text-xs",
              }}
              description="Debes vincular este usuario a un empleado"
              className="mb-1 rounded-2xl"
              endContent={
                <Button
                  as={BranchLink}
                  href="/dashboard/empleados/crear"
                  color="warning"
                  size="sm"
                  variant="flat"
                  className="gap-1"
                  endContent={<IconUserPlus size={20} />}
                >
                  Crear
                </Button>
              }
              title="No has creado ningún empleado"
              variant="faded"
            />
          )}

          {/*  <Tooltip content="Este rol no tiene nada que ver con el puesto del empleado en el negocio" delay={200} closeDelay={0} className="max-w-sm py-2 px-3 text-soft-light" color="default" showArrow placement="top">
            
          </Tooltip> */}
          <Select
            defaultSelectedKeys={
              initialData ? [initialData.role] : [USER_ROLES[0]]
            }
            label="Rol en el sistema"
            variant="bordered"
            size="sm"
            radius="lg"
            disallowEmptySelection={true}
            {...register("role")}
            isInvalid={Boolean(errors.role?.message)}
            errorMessage={errors.role?.message}
            items={[USER_ROLE_OPTIONS[0], USER_ROLE_OPTIONS[1]]}
          >
            {(role) => <SelectItem key={role.key}>{role.title}</SelectItem>}
          </Select>
          <div className="text-sm font-normal text-soft-light flex items-center gap-2">
            <IconInfoCircle />
            <p>
              Este rol no tiene nada que ver con el puesto del empleado en el
              negocio
            </p>
          </div>
        </InputGroupSection>

        <InputGroupSection title="Datos de ingreso">
          <div className="flex gap-2">
            <Input
              isDisabled={initialData != undefined}
              label="Correo"
              variant="bordered"
              size="sm"
              radius="lg"
              isInvalid={Boolean(errors.email?.message)}
              errorMessage={errors.email?.message}
              {...register("email")}
              placeholder={`Ej. ${watch("name").toLowerCase().split(" ").join("")}@kb.com`}
            />
            {!initialData && (
              <Input
                label="Contraseña"
                variant="bordered"
                size="sm"
                radius="lg"
                isInvalid={Boolean(errors.password?.message)}
                errorMessage={errors.password?.message}
                {...register("password")}
              />
            )}
          </div>
        </InputGroupSection>

        <Button
          type="submit"
          color="primary"
          className="w-full mt-4"
          isLoading={isSubmitting}
        >
          {initialData ? "Actualizar usuario" : "Crear usuario"}
        </Button>
      </Form>
    </div>
  );
};

export default UserForm;
