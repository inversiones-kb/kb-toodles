import { db } from "@/firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";
import { ProviderInput } from "@/validations/provider.validations";
import { NoteInput } from "@/validations/note.validations";

export const createNote = async (
  data: NoteInput,
): Promise<CustomApiResponse> => {
  const coll = collection(db, "notes");
  try {
    const newProvider = await addDoc(coll, {
      ...data,
      created_at: new Date(),
      is_deleted: false,
    });
    return {
      success: true,
      message: API_MESSAGES.notes.created,
    };
  } catch (error) {
    return {
      success: false,
      message: API_MESSAGES.notes.error,
    };
  }
};

export const updateNote = async (
  id: string,
  data: Partial<NoteInput>,
): Promise<CustomApiResponse> => {
  console.log(`Actualizando nota ${id}:`, data);

  // 1. Obtenemos la referencia directa al documento único
  const providerDocRef = doc(db, "notes", id);

  try {
    // 2. Ejecutamos la actualización parcial en Firestore
    await updateDoc(providerDocRef, {
      ...data,
      updated_at: new Date(), // Rastro de auditoría indispensable para la edición
    });

    return {
      success: true,
      message: API_MESSAGES.notes.updated,
    };
  } catch (error) {
    console.error(`Error crítico al actualizar la nota ${id}:`, error);
    return {
      success: false,
      message:
        API_MESSAGES.notes.error ||
        "Ocurrió un error al procesar la solicitud.",
    };
  }
};

export const softDeleteNote = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento en la colección
    const shiftRef = doc(db, "notes", id);

    // 2. Ejecutamos un updateDoc para cambiar su estado de visibilidad
    await updateDoc(shiftRef, {
      is_deleted: true, // Flag central para filtrar en las consultas del frontend
      deleted_at: new Date(), // Rastro de auditoría indispensable
    });

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.notes.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    return {
      success: false,
      message: API_MESSAGES.notes.error,
    };
  }
};
