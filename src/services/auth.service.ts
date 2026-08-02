import { auth, db } from "@/firebaseConfig";
import { CustomApiResponse } from "@/types/coreTypes";
import { API_MESSAGES } from "@/utils/apiUtils";
import { LoginInput } from "@/validations/auth.validations";
import { User } from "@/validations/user.validations";
import {
  browserSessionPersistence,
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/**
 * Inicia sesión utilizando las credenciales de correo y contraseña provistas por el formulario.
 * @param data Objeto con el email y password validados por Zod.
 * @returns Promesa con una respuesta de API personalizada.
 */
export const loginWithEmailAndPassword = async (
  data: LoginInput,
): Promise<CustomApiResponse> => {
  try {
    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    const user = await getDoc(doc(db, "users", userCredential.user.uid));

    if (!user)
      return {
        success: false,
        message: "Ocurrió un error inesperado al iniciar sesión.",
      };

    // Retornamos los datos esenciales del usuario autenticado
    return {
      success: true,
      data: { id: user.id, ...user.data() },
      message: API_MESSAGES.login.success,
    };
  } catch (error: any) {
    console.log("Error en loginWithEmailAndPassword:", error);

    // Mapeo de errores comunes de Firebase Auth a mensajes legibles
    let errorMessage = "Ocurrió un error inesperado al iniciar sesión.";

    switch (error.code) {
      case "auth/invalid-credential":
        errorMessage = API_MESSAGES.login.invalidCredential;
        break;
      case "auth/user-disabled":
        errorMessage = API_MESSAGES.login.userDisabled;
        break;
      case "auth/too-many-requests":
        errorMessage = API_MESSAGES.login.tooManyRequests;
        break;
      case "auth/network-request-failed":
        errorMessage = API_MESSAGES.login.networkFailed;
        break;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error crítico al cerrar sesión en Firebase:", error);
    return { success: false, error };
  }
};
