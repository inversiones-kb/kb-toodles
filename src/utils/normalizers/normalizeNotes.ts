import { Note } from "@/validations/note.validations";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function transformNote(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): Note {
  const data = doc.data();

  return {
    id: doc.id,
    title: data.title,
    text: data.text,
    created_by: data.created_by,
    created_at: data.created_at.toDate(),
    is_deleted: data.is_deleted,
    deleted_at: data.deleted_at ? data.deleted_at.toDate() : null,
  };
}
