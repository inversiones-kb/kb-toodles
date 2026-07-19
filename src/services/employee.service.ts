import { db } from "@/firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";
import {
  EmployeeInput,
  EmployeeOutput,
} from "@/validations/employee.validations";

export const createEmployee = async (
  data: EmployeeInput,
): Promise<CustomApiResponse> => {
  console.log(data);

  const coll = collection(db, "employees");
  try {
    const newDoc = await addDoc(coll, {
      ...data,
      created_at: new Date(),
      is_deleted: false,
    });
    return {
      success: true,
      message: API_MESSAGES.employee.created,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: API_MESSAGES.employee.error,
    };
  }
};

export const updateEmployee = async (
  id: string,
  data: Partial<EmployeeInput>,
): Promise<CustomApiResponse> => {
  console.log(`Actualizando empleado ${id}:`, data);

  // 1. Obtenemos la referencia directa al documento único
  const ref = doc(db, "employees", id);

  try {
    // 2. Ejecutamos la actualización parcial en Firestore
    await updateDoc(ref, {
      ...data,
      updated_at: new Date(), // Rastro de auditoría indispensable para la edición
    });

    return {
      success: true,
      message: API_MESSAGES.employee.updated,
    };
  } catch (error) {
    console.error(`Error crítico al actualizar el proveedor ${id}:`, error);
    return {
      success: false,
      message:
        API_MESSAGES.employee.error ||
        "Ocurrió un error al procesar la solicitud.",
    };
  }
};

export const softDeleteEmployee = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento en la colección
    const shiftRef = doc(db, "employees", id);

    // 2. Ejecutamos un updateDoc para cambiar su estado de visibilidad
    await updateDoc(shiftRef, {
      is_deleted: true, // Flag central para filtrar en las consultas del frontend
      deleted_at: new Date(), // Rastro de auditoría indispensable
    });

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.employee.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    return {
      success: false,
      message: API_MESSAGES.employee.error,
    };
  }
};
