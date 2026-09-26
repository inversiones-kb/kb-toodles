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
 * Edita el monto/referencia de un pago móvil ya registrado, ajustando
 * `total_mobile_payments` por la diferencia (delta) en la misma transacción.
 * También ajusta `money.bs.mobile` por el mismo delta: ese campo es la copia
 * del total de pagos móvil que el cajero congela al cerrar el turno, así que
 * una vez cerrado ya no se recalcula solo — sin este ajuste quedaría
 * desincronizado del detalle real tras una edición post-cierre. Mientras el
 * turno sigue OPEN, `money.bs.mobile` todavía no existe en el documento y el
 * cierre lo sobreescribe por completo con el total en vivo, así que este
 * ajuste no tiene efecto (inofensivo) en ese caso.
 * `allowClosed` decide si se permite sobre un turno que ya no está OPEN.
 */
async function performUpdateMobilePayment(
  id: string,
  data: { amount: number; ref: string },
  allowClosed: boolean,
): Promise<CustomApiResponse> {
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
      if (!allowClosed && shiftSnap.data().status !== "OPEN") {
        throw new Error("SHIFT_CLOSED");
      }

      const delta = data.amount - payment.amount;

      tx.update(paymentRef, {
        amount: data.amount,
        ref: data.ref,
        updated_at: new Date(),
      });

      tx.update(shiftRef, {
        total_mobile_payments: increment(delta),
        "money.bs.mobile": increment(delta),
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
}

/** Uso del cajero: solo permitido mientras el turno sigue OPEN. */
export const updateMobilePayment = (
  id: string,
  data: { amount: number; ref: string },
) => performUpdateMobilePayment(id, data, false);

/** Uso del admin: permitido sin importar el estado del turno (PENDING/CHECKED). */
export const adminUpdateMobilePayment = (
  id: string,
  data: { amount: number; ref: string },
) => performUpdateMobilePayment(id, data, true);

/**
 * Elimina (soft delete) un pago móvil, descuenta su monto de
 * `total_mobile_payments` y de `money.bs.mobile` (ver nota en
 * `performUpdateMobilePayment`) en la misma transacción.
 */
async function performDeleteMobilePayment(
  id: string,
  allowClosed: boolean,
): Promise<CustomApiResponse> {
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
      if (!allowClosed && shiftSnap.data().status !== "OPEN") {
        throw new Error("SHIFT_CLOSED");
      }

      tx.update(paymentRef, {
        is_deleted: true,
        deleted_at: new Date(),
      });

      tx.update(shiftRef, {
        total_mobile_payments: increment(-payment.amount),
        "money.bs.mobile": increment(-payment.amount),
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
}

/** Uso del cajero: solo permitido mientras el turno sigue OPEN. */
export const softDeleteMobilePayment = (id: string) =>
  performDeleteMobilePayment(id, false);

/** Uso del admin: permitido sin importar el estado del turno (PENDING/CHECKED). */
export const adminDeleteMobilePayment = (id: string) =>
  performDeleteMobilePayment(id, true);
