import {
  createEmployeeSchema,
  Employee,
  EmployeeInput,
} from "@/validations/employee.validations";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Progress,
  Select,
  SelectItem,
} from "@heroui/react";
import InputGroupSection from "../forms/InputGroupSection";
import { USER_ROLE_OPTIONS, USER_ROLES } from "@/types/user.types";
import { dateToString } from "@/utils/dateUtils";
import DragDropUploader from "../forms/DragDropUploader";
import { SHIFT_OPTIONS, SHIFTS } from "@/types/employee.types";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";

interface Props {
  onSubmit: SubmitHandler<EmployeeInput>;
  initialData?: Employee;
  showButton?: boolean;
}

const EmployeeForm = ({
  onSubmit,
  initialData,

  showButton = false,
}: Props) => {
  const branch = useParams().branch as keyof typeof BUSINESS_BRANCH_MAP;

  const {
    watch,
    setValue,
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(
      initialData
        ? createEmployeeSchema.omit({
            cv_attachment: true,
            rif_attachment: true,
          })
        : createEmployeeSchema,
    ),
    defaultValues: initialData
      ? {
          shift: initialData.shift,
          birthdate: parseDate(
            dateToString(initialData.birthdate, "YYYY-MM-DD"),
          ),
          hired_at: parseDate(dateToString(initialData.hired_at, "YYYY-MM-DD")),
          doc_number: initialData.doc_number,
          doc_type: initialData.doc_type,
          last_name: initialData.last_name,
          name: initialData.name,
          role: initialData.role,
          salary: initialData.salary,
          email: initialData.email,
          address: initialData.address,
          branch: initialData.branch,
        }
      : {
          doc_type: "V",

          hired_at: today(getLocalTimeZone()) as any,
          birthdate: today(getLocalTimeZone()) as any,
          branch: branch,
        },
  });
  const router = useBranchRouter();

  console.log(errors);

  return (
    <div className="w-full overflow-y-auto flex justify-center pb-10">
      <Form
        id={"employeeForm"}
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md w-full h-fit"
      >
        <h2 className="text-2xl text-center w-full font-semibold mb-4">
          Completa el formulario
        </h2>

        {!initialData ? (
          <>
            <Controller
              name="cv_attachment"
              control={control}
              render={({ field }) => (
                <DragDropUploader
                  label="Hoja de Vida (CV)"
                  maxSizeMB={5}
                  acceptedTypes={["application/pdf"]}
                  currentFile={field.value}
                  onFileSelect={field.onChange} // Actualiza el estado del form directamente
                  errorMessage={errors.cv_attachment?.message as string}
                />
              )}
            />
            <Controller
              name="rif_attachment"
              control={control}
              render={({ field }) => (
                <DragDropUploader
                  label="Registro de Información Fiscal (RIF)"
                  maxSizeMB={5}
                  acceptedTypes={["application/pdf"]}
                  currentFile={field.value}
                  onFileSelect={field.onChange} // Actualiza el estado del form directamente
                  errorMessage={errors.rif_attachment?.message as string}
                />
              )}
            />
          </>
        ) : null}

        <InputGroupSection title="Datos de identidad">
          <div className="flex gap-2">
            <Input
              label="Nombre"
              variant="bordered"
              size="sm"
              radius="lg"
              isInvalid={Boolean(errors.name?.message)}
              errorMessage={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Apellido"
              variant="bordered"
              size="sm"
              radius="lg"
              isInvalid={Boolean(errors.last_name?.message)}
              errorMessage={errors.last_name?.message}
              {...register("last_name")}
            />
          </div>

          <div className="flex gap-2">
            <Input
              label="Correo"
              variant="bordered"
              size="sm"
              radius="lg"
              isInvalid={Boolean(errors.email?.message)}
              errorMessage={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Dirección"
              variant="bordered"
              size="sm"
              radius="lg"
              isInvalid={Boolean(errors.address?.message)}
              errorMessage={errors.address?.message}
              {...register("address")}
            />
          </div>

          <div className="flex gap-2">
            <Select
              className="w-32"
              defaultSelectedKeys={["V"]}
              label="Tipo"
              variant="bordered"
              size="sm"
              radius="lg"
              disallowEmptySelection={true}
              {...register("doc_type")}
              isInvalid={Boolean(errors.doc_type?.message)}
              errorMessage={errors.doc_type?.message}
            >
              <SelectItem key={"V"}>V</SelectItem>
              <SelectItem key={"J"}>J</SelectItem>
              <SelectItem key={"E"}>E</SelectItem>
            </Select>
            <Input
              type="number"
              label="Documento de identidad"
              variant="bordered"
              size="sm"
              radius="lg"
              isInvalid={Boolean(errors.doc_number?.message)}
              errorMessage={errors.doc_number?.message}
              {...register("doc_number")}
            />
          </div>

          <Controller
            control={control}
            name="birthdate"
            render={({ field, fieldState }) => (
              <DatePicker
                label="Fecha de nacimiento"
                value={field.value as any}
                onChange={field.onChange}
                isInvalid={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
                maxValue={today(getLocalTimeZone()) as any}
              />
            )}
          />
        </InputGroupSection>

        <InputGroupSection title="Datos de contratación">
          <Select
            defaultSelectedKeys={
              initialData ? [initialData.shift] : [SHIFTS[0]]
            }
            label="Turno"
            variant="bordered"
            size="sm"
            radius="lg"
            disallowEmptySelection={true}
            {...register("shift")}
            isInvalid={Boolean(errors.shift?.message)}
            errorMessage={errors.shift?.message}
            items={SHIFT_OPTIONS}
          >
            {(role) => <SelectItem key={role.key}>{role.title}</SelectItem>}
          </Select>

          <Controller
            control={control}
            name="hired_at"
            render={({ field, fieldState }) => (
              <DatePicker
                label="Fecha de contratación"
                value={field.value as any}
                onChange={field.onChange}
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                maxValue={today(getLocalTimeZone()) as any}
              />
            )}
          />

          <Select
            defaultSelectedKeys={
              initialData ? [initialData.role] : [USER_ROLES[0]]
            }
            label="Rol"
            variant="bordered"
            size="sm"
            radius="lg"
            disallowEmptySelection={true}
            {...register("role")}
            isInvalid={Boolean(errors.role?.message)}
            errorMessage={errors.role?.message}
            items={USER_ROLE_OPTIONS}
          >
            {(role) => <SelectItem key={role.key}>{role.title}</SelectItem>}
          </Select>
          <Input
            type="number"
            label="Sueldo quincenal"
            variant="bordered"
            size="sm"
            radius="lg"
            isInvalid={Boolean(errors.salary?.message)}
            errorMessage={errors.salary?.message}
            {...register("salary")}
          />
        </InputGroupSection>

        {showButton && (
          <Button
            type="submit"
            color="primary"
            className="w-full mt-4"
            isLoading={isSubmitting}
          >
            Guardar nuevo empleado
          </Button>
        )}
      </Form>
    </div>
  );
};

export default EmployeeForm;
