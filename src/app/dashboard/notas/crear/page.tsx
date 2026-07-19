"use client";

import CardTitle from "@/components/home/CardTitle";
import { IconUserDollar } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProviderOutput } from "@/validations/provider.validations";
import { createProvider } from "@/services/provider.service";
import ProviderForm from "@/components/provider/ProviderForm";
import NoteForm from "@/components/note/NoteForm";
import { NoteOutput } from "@/validations/note.validations";
import { createNote } from "@/services/note.service";

export default function CreateNotePage() {
  const router = useRouter();

  const onSubmit = async (data: NoteOutput) => {
    const res = await createNote(data);

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
        <CardTitle Icon={IconUserDollar} title="Crear nota" />

        <NoteForm onSubmit={onSubmit} />
      </section>
    </main>
  );
}
