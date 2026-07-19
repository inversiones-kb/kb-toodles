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
    const userDocument: User = {
      role_data: USER_ROLE_MAP[parsedData.role],
      id: userRecord.uid,
      is_deleted: false,
      deleted_at: null,
      email: parsedData.email,
      employee_id: parsedData.employee_id,
      is_active: parsedData.is_active,
      last_name: parsedData.last_name,
      name: parsedData.name,
      role: parsedData.role,

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
