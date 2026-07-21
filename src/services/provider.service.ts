import { db } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";
import { ProviderInput } from "@/validations/provider.validations";

export const createProvider = async (
  data: ProviderInput,
): Promise<CustomApiResponse> => {
  console.log(data);

  const providersCollection = collection(db, "providers");
  try {
    const newProvider = await addDoc(providersCollection, {
      ...data,
      created_at: new Date(),
      is_deleted: false,
    });
    return {
      success: true,
      message: API_MESSAGES.provider.created,
    };
  } catch (error) {
    return {
      success: false,
      message: API_MESSAGES.provider.error,
    };
  }
};

export const updateProvider = async (
  id: string,
  data: Partial<ProviderInput>,
): Promise<CustomApiResponse> => {
  console.log(`Actualizando proveedor ${id}:`, data);

  // 1. Obtenemos la referencia directa al documento único
  const providerDocRef = doc(db, "providers", id);

  try {
    // 2. Ejecutamos la actualización parcial en Firestore
    await updateDoc(providerDocRef, {
      ...data,
      updated_at: new Date(), // Rastro de auditoría indispensable para la edición
    });

    return {
      success: true,
      message: API_MESSAGES.provider.updated,
    };
  } catch (error) {
    console.error(`Error crítico al actualizar el proveedor ${id}:`, error);
    return {
      success: false,
      message:
        API_MESSAGES.provider.error ||
        "Ocurrió un error al procesar la solicitud.",
    };
  }
};

export const softDeleteProvider = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento en la colección
    const shiftRef = doc(db, "providers", id);

    // 2. Ejecutamos un updateDoc para cambiar su estado de visibilidad
    await updateDoc(shiftRef, {
      is_deleted: true, // Flag central para filtrar en las consultas del frontend
      deleted_at: new Date(), // Rastro de auditoría indispensable
    });

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.provider.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    return {
      success: false,
      message: API_MESSAGES.provider.error,
    };
  }
};

export const hardDeleteProvider = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento en la colección
    const ref = doc(db, "providers", id);

    // 2. Ejecutamos un deleteDoc para eliminarlo de la base de datos
    await deleteDoc(ref);

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.provider.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    return {
      success: false,
      message: API_MESSAGES.provider.error,
    };
  }
};
