import { db } from "@/firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";
import { UserInput } from "@/validations/user.validations";

export const createUser = async (
  data: UserInput,
): Promise<CustomApiResponse> => {
  console.log(data);

  const coll = collection(db, "users");
  try {
    const newDoc = await addDoc(coll, {
      ...data,
      created_at: new Date(),
      is_deleted: false,
    });
    return {
      success: true,
      message: API_MESSAGES.users.created,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: API_MESSAGES.users.error,
    };
  }
};

export const updateUser = async (
  id: string,
  data: Partial<UserInput>,
): Promise<CustomApiResponse> => {
  console.log(`Actualizando usuario ${id}:`, data);

  // 1. Obtenemos la referencia directa al documento único
  const ref = doc(db, "users", id);

  try {
    // 2. Ejecutamos la actualización parcial en Firestore
    await updateDoc(ref, {
      ...data,
      updated_at: new Date(), // Rastro de auditoría indispensable para la edición
    });

    return {
      success: true,
      message: API_MESSAGES.users.updated,
    };
  } catch (error) {
    console.error(`Error crítico al actualizar el uusario ${id}:`, error);
    return {
      success: false,
      message:
        API_MESSAGES.users.error ||
        "Ocurrió un error al procesar la solicitud.",
    };
  }
};

export const softDeleteUser = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento en la colección
    const shiftRef = doc(db, "users", id);

    // 2. Ejecutamos un updateDoc para cambiar su estado de visibilidad
    await updateDoc(shiftRef, {
      is_deleted: true, // Flag central para filtrar en las consultas del frontend
      deleted_at: new Date(), // Rastro de auditoría indispensable
    });

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.users.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    return {
      success: false,
      message: API_MESSAGES.users.error,
    };
  }
};
