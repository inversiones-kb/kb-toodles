"use client";

import {
  createProviderSchema,
  Provider,
  ProviderInput,
  ProviderOutput,
} from "@/validations/provider.validations";
import {
  Button,
  Form,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import InputGroupSection from "../forms/InputGroupSection";
import CountryPicker from "../forms/CountryPicker";
import { PROVIDER_TYPE_MAP, PROVIDER_TYPES } from "@/types/providersTypes";
import {
  createNoteSchema,
  Note,
  NoteInput,
  NoteOutput,
} from "@/validations/note.validations";

interface Props {
  onSubmit: SubmitHandler<NoteOutput>;
  initialData?: Note;
}

const NoteForm = ({ onSubmit, initialData }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NoteInput>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: initialData
      ? {
          text: initialData.text,
          title: initialData.title,
        }
      : {},
  });

  return (
    <div className="w-full overflow-y-auto h-full flex justify-center">
      <Form onSubmit={handleSubmit(onSubmit)} className="max-w-md w-full">
        <h2 className="text-2xl text-center w-full font-semibold mb-4">
          Completa el formulario
        </h2>

        <Input
          label="Título"
          variant="bordered"
          size="sm"
          radius="lg"
          isInvalid={Boolean(errors.title?.message)}
          errorMessage={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          label="Contenido de la nota"
          variant="bordered"
          size="sm"
          radius="lg"
          maxRows={15}
          isInvalid={Boolean(errors.text?.message)}
          errorMessage={errors.text?.message}
          {...register("text")}
        />

        <Button
          type="submit"
          color="primary"
          className="w-full mt-4"
          isLoading={isSubmitting}
        >
          {initialData ? "Actualizar nota" : "Crear nota"}
        </Button>
      </Form>
    </div>
  );
};

export default NoteForm;
