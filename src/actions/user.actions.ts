"use server";

import { adminAuth, adminDb } from "@/config/firebase-admin";
import { CustomApiResponse } from "@/types/coreTypes";
import { USER_ROLE_MAP } from "@/types/user.types";
import { API_MESSAGES } from "@/utils/apiUtils";
import {
  createUserSchema,
  User,
  type UserInput,
} from "@/validations/user.validations";

export async function createUserAction(
  formData: UserInput,
): Promise<CustomApiResponse> {
  try {
    if (!adminAuth || !adminDb)
      return { success: false, message: API_MESSAGES.users.error };
    // 1. Validamos los datos nuevamente en el servidor por seguridad estricta
    const parsedData = createUserSchema.parse(formData);

    // 2. Creamos el usuario en Firebase Auth usando el SDK de Admin
    // Esto NO cierra la sesión del administrador en el navegador
    const userRecord = await adminAuth.createUser({
      email: parsedData.email,
      password: parsedData.password,
      displayName: `${parsedData.name} ${parsedData.last_name}`,
    });

    // 3. Preparamos el documento para Firestore (excluyendo la contraseña)
    const now = new Date();
    const userDocument: Omit<User, "branch_data" | "role_data"> = {
      id: userRecord.uid,
      is_deleted: false,
      deleted_at: null,
      email: parsedData.email,
      employee_id: parsedData.employee_id,
      is_active: parsedData.is_active,
      last_name: parsedData.last_name,
      name: parsedData.name,
      role: parsedData.role,
      branch: parsedData.branch,

      created_at: now,
      uid: userRecord.uid,
    };

    // 4. Guardamos en la colección 'users' usando el mismo UID de Auth
    await adminDb.collection("users").doc(userRecord.uid).set(userDocument);

    return {
      success: true,
      data: { uid: userRecord.uid },
      message: API_MESSAGES.users.created,
    };
  } catch (error: any) {
    console.error("Error en Server Action createUser:", error);

    // Manejo de errores amigable para la UI
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: API_MESSAGES.login.emailAlreadyExists,
      };
    }

    return {
      success: false,
      message: API_MESSAGES.users.error,
    };
  }
}

export async function adminResetPassword(uid: string, newPassword: string) {
  try {
    // Validar que la contraseña tenga al menos 6 caracteres (regla de Firebase)
    if (newPassword.length < 6) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres.",
      };
    }

    // Actualizamos la credencial directamente en Auth sin pedir confirmaciones
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return { success: true };
  } catch (error) {
    console.error("Error al forzar cambio de clave:", error);
    return { success: false, error: "No se pudo actualizar la contraseña." };
  }
}

export type BasicUser = Pick<User, "name" | "last_name" | "email">;

export async function getBasicUsersList(): Promise<BasicUser[]> {
  try {
    const snapshot = await adminDb
      .collection("users")
      .select("name", "last_name", "email") // 🔥 La proyección de Firestore
      .get();

    // Mapeamos a objetos planos obligatorios para Server Actions
    const users: BasicUser[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "Sin nombre",
        last_name: data.last_name || "",
        email: data.email || "Sin correo",
      };
    });

    return users;
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    // Lanzar el error permite que el frontend lo capture
    throw new Error("No se pudo cargar la lista de usuarios.");
  }
}

export async function migrateCashierPasswords() {
  try {
    // 1. Buscamos solo a los cajeros en Firestore
    const snapshot = await adminDb
      .collection("users")
      .where("role", "==", "CASHIER")
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No se encontraron cajeros en la base de datos.",
      };
    }

    const report = { successes: 0, failures: 0, errors: [] as string[] };

    // 2. Iteramos usando un bucle for...of para procesarlos secuencialmente
    // y no saturar los límites de peticiones (rate limits) de Firebase Auth
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const employee = await adminDb
        .doc(`employees/${userData.employee_id}`)
        .get();

      const uid = doc.id;
      const docNumber = employee.data()?.doc_number;

      // Validación de existencia
      if (!docNumber) {
        report.failures++;
        report.errors.push(
          `El cajero ${userData.name} (UID: ${uid}) no tiene cédula registrada.`,
        );
        continue;
      }

      // 🔥 REGLA DE FIREBASE: Las contraseñas deben ser strings de mínimo 6 caracteres.
      // Si guardas la cédula como número, hay que convertirla a string.
      const newPassword = String(docNumber).trim();

      if (newPassword.length < 6) {
        report.failures++;
        report.errors.push(
          `La cédula de ${userData.name} es muy corta (${newPassword}). Firebase exige 6 caracteres mínimo.`,
        );
        continue;
      }

      try {
        // 3. Sobreescribimos la contraseña en Auth
        await adminAuth.updateUser(uid, {
          password: newPassword,
        });
        report.successes++;
      } catch (authError: any) {
        report.failures++;
        report.errors.push(
          `Error en Auth para ${userData.name}: ${authError.message}`,
        );
      }
    }

    return {
      success: true,
      message: `Migración completada. Éxitos: ${report.successes}. Fallos: ${report.failures}`,
      report,
    };
  } catch (error) {
    console.error("Error crítico en la migración:", error);
    throw new Error("Fallo la ejecución del script de migración.");
  }
}
