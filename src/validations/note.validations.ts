import * as z from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(2, { message: "El título debe tener al menos 3 caracteres" })
    .max(100, { message: "El título debe tener menos de 100 caracteres" }),
  text: z.string().min(1, "La nota debe tener al menos un caracter"),
});

export type NoteInput = z.input<typeof createNoteSchema>;
export type NoteOutput = z.output<typeof createNoteSchema>;

export type Note = NoteOutput & {
  id: string;
  created_by: string;

  created_at: Date;
  is_deleted: boolean;
  deleted_at: Date;
};
