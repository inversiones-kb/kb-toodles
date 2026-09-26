import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
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

/**
 * Edita el monto/referencia de un pago móvil ya registrado, ajustando el
 * acumulador `total_mobile_payments` del turno por la diferencia (delta) en
 * la misma transacción. Bloqueado si el turno ya no está OPEN.
 */
export const updateMobilePayment = async (
  id: string,
  data: { amount: number; ref: string },
): Promise<CustomApiResponse> => {
  try {
    await runTransaction(db, async (tx) => {
      const paymentRef = doc(db, "mobile_payments", id);
      const paymentSnap = await tx.get(paymentRef);
      if (!paymentSnap.exists()) throw new Error("NOT_FOUND");

      const payment = paymentSnap.data();
      if (payment.is_deleted) throw new Error("ALREADY_DELETED");

      const shiftRef = doc(db, "register_balances", payment.shift_id);
      const shiftSnap = await tx.get(shiftRef);
      if (!shiftSnap.exists()) throw new Error("SHIFT_NOT_FOUND");
      if (shiftSnap.data().status !== "OPEN") throw new Error("SHIFT_CLOSED");

      const delta = data.amount - payment.amount;

      tx.update(paymentRef, {
        amount: data.amount,
        ref: data.ref,
        updated_at: new Date(),
      });

      tx.update(shiftRef, {
        total_mobile_payments: increment(delta),
        updated_at: new Date(),
      });
    });

    return {
      success: true,
      data: { id },
      message: API_MESSAGES.mobilePayments.updated,
    };
  } catch (error: any) {
    console.error(`Error en updateMobilePayment para el ID ${id}:`, error);

    if (error.message === "SHIFT_CLOSED") {
      return {
        success: false,
        message: "No se puede editar un pago móvil de un turno ya cerrado",
      };
    }

    return {
      success: false,
      message: API_MESSAGES.mobilePayments.error,
    };
  }
};

/**
 * Elimina (soft delete) un pago móvil y descuenta su monto del acumulador
 * `total_mobile_payments` del turno en la misma transacción.
 * Bloqueado si el turno ya no está OPEN.
 */
export const softDeleteMobilePayment = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    await runTransaction(db, async (tx) => {
      const paymentRef = doc(db, "mobile_payments", id);
      const paymentSnap = await tx.get(paymentRef);
      if (!paymentSnap.exists()) throw new Error("NOT_FOUND");

      const payment = paymentSnap.data();
      if (payment.is_deleted) throw new Error("ALREADY_DELETED");

      const shiftRef = doc(db, "register_balances", payment.shift_id);
      const shiftSnap = await tx.get(shiftRef);
      if (!shiftSnap.exists()) throw new Error("SHIFT_NOT_FOUND");
      if (shiftSnap.data().status !== "OPEN") throw new Error("SHIFT_CLOSED");

      tx.update(paymentRef, {
        is_deleted: true,
        deleted_at: new Date(),
      });

      tx.update(shiftRef, {
        total_mobile_payments: increment(-payment.amount),
        updated_at: new Date(),
      });
    });

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.mobilePayments.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    if (error.message === "SHIFT_CLOSED") {
      return {
        success: false,
        message: "No se puede eliminar un pago móvil de un turno ya cerrado",
      };
    }

    return {
      success: false,
      message: API_MESSAGES.mobilePayments.error,
    };
  }
};
