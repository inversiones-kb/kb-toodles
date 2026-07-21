import { db } from "@/firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";
import {
  RegisterBalance,
  RegisterBalanceInput,
} from "@/validations/registerBalance.validations";
import { Employee } from "@/types/employee.types";
import { DeepPartial } from "react-hook-form";

export const openRegisterBalance = async (
  data: Pick<
    RegisterBalanceInput,
    "status" | "checkout_number" | "total_expenses" | "branch"
  > &
    Pick<RegisterBalance, "user_snapshot" | "user_id">,
): Promise<CustomApiResponse> => {
  const coll = collection(db, "register_balances");
  try {
    const newDoc = await addDoc(coll, {
      ...data,
      created_at: new Date(),
      open_at: new Date(),
      closed_at: null,
      total_expenses: 0,
      is_deleted: false,
    });
    return {
      success: true,
      message: API_MESSAGES.registerBalances.created,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: API_MESSAGES.registerBalances.error,
    };
  }
};

export const createRegisterBalance = async (
  data: RegisterBalanceInput & Pick<RegisterBalance, "user_snapshot">,
): Promise<CustomApiResponse> => {
  const coll = collection(db, "register_balances");
  try {
    const newDoc = await addDoc(coll, {
      ...data,
      created_at: new Date(),
      is_deleted: false,
    });
    return {
      success: true,
      message: API_MESSAGES.registerBalances.created,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: API_MESSAGES.registerBalances.error,
    };
  }
};

export const updateRegisterBalance = async (
  id: string,
  data: DeepPartial<RegisterBalance>,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento mediante su ID (Operación O(1))
    const shiftRef = doc(db, "register_balances", id);

    // 2. Ejecutamos la actualización inyectando automáticamente la fecha de modificación
    await updateDoc(shiftRef, {
      ...data,
      updated_at: new Date(), // Rastro de auditoría indispensable
    });

    return {
      success: true,
      message: API_MESSAGES.registerBalances.updated,
      data: { id: id },
    };
  } catch (error: any) {
    console.error(`Error en updateRegisterBalance para el ID ${id}:`, error);

    return {
      success: false,
      message: API_MESSAGES.registerBalances.error,
    };
  }
};

export const softDeleteRegisterBalance = async (
  shiftId: string,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento en la colección
    const shiftRef = doc(db, "register_balances", shiftId);

    // 2. Ejecutamos un updateDoc para cambiar su estado de visibilidad
    await updateDoc(shiftRef, {
      is_deleted: true, // Flag central para filtrar en las consultas del frontend
      deleted_at: new Date(), // Rastro de auditoría indispensable
    });

    return {
      success: true,
      data: { id: shiftId },
      message: API_MESSAGES.registerBalances.deleted,
    };
  } catch (error: any) {
    console.error(
      `Error en softDeleteRegisterBalance para el ID ${shiftId}:`,
      error,
    );

    return {
      success: false,
      message: API_MESSAGES.registerBalances.error,
    };
  }
};
