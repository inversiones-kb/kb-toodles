import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ExpenseInput } from "@/validations/expense.validations";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";

/**
 * Registra una nueva salida de dinero (gasto) vinculada al turno actual.
 * @param data Objeto con los datos validados del gasto (shift_id, user_id, amount, etc.)
 * @returns Promesa con una respuesta de API personalizada.
 */
export const createExpense = async (
  data: ExpenseInput & {
    user_id: string;
  },
): Promise<CustomApiResponse> => {
  try {
    const expensesRef = collection(db, "expenses");

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
      [`total_expenses`]: increment(data.amount),

      // Registro de auditoría del último movimiento en el turno
      updated_at: new Date(),
    });

    return {
      success: true,
      data: { id: docRef.id },
      message: API_MESSAGES.expenses.created,
    };
  } catch (error: any) {
    console.error("Error en createExpense:", error);

    return {
      success: false,
      message: API_MESSAGES.expenses.error,
    };
  }
};

/**
 * Edita el monto/motivo de un gasto ya registrado, ajustando el acumulador
 * `total_expenses` del turno por la diferencia (delta) en la misma transacción
 * para que nunca quede desincronizado del detalle real de gastos.
 * Bloqueado si el turno ya no está OPEN (evita corromper un cuadre ya cerrado).
 */
export const updateExpense = async (
  id: string,
  data: { amount: number; description: string },
): Promise<CustomApiResponse> => {
  try {
    await runTransaction(db, async (tx) => {
      const expenseRef = doc(db, "expenses", id);
      const expenseSnap = await tx.get(expenseRef);
      if (!expenseSnap.exists()) throw new Error("NOT_FOUND");

      const expense = expenseSnap.data();
      if (expense.is_deleted) throw new Error("ALREADY_DELETED");

      const shiftRef = doc(db, "register_balances", expense.shift_id);
      const shiftSnap = await tx.get(shiftRef);
      if (!shiftSnap.exists()) throw new Error("SHIFT_NOT_FOUND");
      if (shiftSnap.data().status !== "OPEN") throw new Error("SHIFT_CLOSED");

      const delta = data.amount - expense.amount;

      tx.update(expenseRef, {
        amount: data.amount,
        description: data.description,
        updated_at: new Date(),
      });

      tx.update(shiftRef, {
        total_expenses: increment(delta),
        updated_at: new Date(),
      });
    });

    return {
      success: true,
      data: { id },
      message: API_MESSAGES.expenses.updated,
    };
  } catch (error: any) {
    console.error(`Error en updateExpense para el ID ${id}:`, error);

    if (error.message === "SHIFT_CLOSED") {
      return {
        success: false,
        message: "No se puede editar un gasto de un turno ya cerrado",
      };
    }

    return {
      success: false,
      message: API_MESSAGES.expenses.error,
    };
  }
};

/**
 * Elimina (soft delete) un gasto y descuenta su monto del acumulador
 * `total_expenses` del turno en la misma transacción.
 * Bloqueado si el turno ya no está OPEN.
 */
export const softDeleteExpense = async (
  id: string,
): Promise<CustomApiResponse> => {
  try {
    await runTransaction(db, async (tx) => {
      const expenseRef = doc(db, "expenses", id);
      const expenseSnap = await tx.get(expenseRef);
      if (!expenseSnap.exists()) throw new Error("NOT_FOUND");

      const expense = expenseSnap.data();
      if (expense.is_deleted) throw new Error("ALREADY_DELETED");

      const shiftRef = doc(db, "register_balances", expense.shift_id);
      const shiftSnap = await tx.get(shiftRef);
      if (!shiftSnap.exists()) throw new Error("SHIFT_NOT_FOUND");
      if (shiftSnap.data().status !== "OPEN") throw new Error("SHIFT_CLOSED");

      tx.update(expenseRef, {
        is_deleted: true,
        deleted_at: new Date(),
      });

      tx.update(shiftRef, {
        total_expenses: increment(-expense.amount),
        updated_at: new Date(),
      });
    });

    return {
      success: true,
      data: { id: id },
      message: API_MESSAGES.expenses.deleted,
    };
  } catch (error: any) {
    console.error(`Error al eliminar para el ID ${id}:`, error);

    if (error.message === "SHIFT_CLOSED") {
      return {
        success: false,
        message: "No se puede eliminar un gasto de un turno ya cerrado",
      };
    }

    return {
      success: false,
      message: API_MESSAGES.expenses.error,
    };
  }
};
