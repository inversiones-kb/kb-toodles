"use client";

import CardTitle from "@/components/home/CardTitle";
import { IconUserDollar } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProviderOutput } from "@/validations/provider.validations";
import { createProvider } from "@/services/provider.service";
import ProviderForm from "@/components/provider/ProviderForm";
import NoteForm from "@/components/note/NoteForm";
import { Note, NoteOutput } from "@/validations/note.validations";
import { createNote, updateNote } from "@/services/note.service";
import { useDoc } from "@/hooks/useDoc";
import { Spinner } from "@heroui/react";

export default function UpdateNotePage() {
  const router = useRouter();
  const { id } = useParams();

  const { data, isLoading } = useDoc<Note>("notes", id?.toString());

  const onSubmit = async (data: NoteOutput) => {
    if (!id) return toast.warning("Nota no encontrado");

    const res = await updateNote(id.toString(), data);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    return router.push("/dashboard/notas");
  };

  return (
    <main className="flex gap-5 h-full">
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <CardTitle Icon={IconUserDollar} title="Actualizar nota" />

        {isLoading ? <Spinner /> : null}
        {!isLoading && data ? (
          <NoteForm initialData={data} onSubmit={onSubmit} />
        ) : null}
      </section>
    </main>
  );
}
