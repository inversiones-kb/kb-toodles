import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ExpenseInput } from "@/validations/expense.validations";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";
import { MobilePaymentInput } from "@/validations/mobile_payment.validations";

/**
 * Registra una nueva salida de dinero (gasto) vinculada al turno actual.
 * @param data Objeto con los datos validados del gasto (shift_id, user_id, amount, etc.)
 * @returns Promesa con una respuesta de API personalizada.
 */
export const createMobilePayment = async (
  data: MobilePaymentInput & {
    user_id: string;
  },
): Promise<CustomApiResponse> => {
  try {
    const expensesRef = collection(db, "mobile_payments");

    // Guardamos el documento inyectando la fecha exacta de creación
    const docRef = await addDoc(expensesRef, {
      ...data,
      created_at: new Date(), // Mantenemos la consistencia del formato ISO
      is_deleted: false,
    });

    // Aumentar total expenses en el cuadre de caja
    const shiftRef = doc(db, "register_balances", data.shift_id);

    await updateDoc(shiftRef, {
      // Incrementa el acumulador global de gastos para esa moneda específica
      [`total_mobile_payments`]: increment(data.amount),

      // Registro de auditoría del último movimiento en el turno
      updated_at: new Date(),
    });

    return {
      success: true,
      data: { id: docRef.id },
      message: API_MESSAGES.mobilePayments.created,
    };
  } catch (error: any) {
    console.error("Error en createMobilePayment:", error);

    return {
      success: false,
      message: API_MESSAGES.mobilePayments.error,
    };
  }
};

export const softDeleteMobilePayment = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    // 1. Obtenemos la referencia directa al documento en la colección
    const shiftRef = doc(db, "mobile_payments", id);

    // 2. Ejecutamos un updateDoc para cambiar su estado de visibilidad
    await updateDoc(shiftRef, {
      is_deleted: true, // Flag central para filtrar en las consultas del frontend
      deleted_at: new Date(), // Rastro de auditoría indispensable
    });

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.mobilePayments.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    return {
      success: false,
      message: API_MESSAGES.mobilePayments.error,
    };
  }
};
