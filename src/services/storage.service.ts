import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "@/firebaseConfig"; // Asegúrate de exportar 'storage' desde tu config
import type { FileMetadata } from "@/types/file.types";

/**
 * Sube un archivo a Firebase Storage reportando el progreso de subida.
 */
export const uploadFileToStorage = (
  file: File,
  directory: string,
  onProgress?: (progress: number) => void, // 🔥 Nuevo parámetro opcional
): Promise<FileMetadata> => {
  return new Promise((resolve, reject) => {
    const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const fullPath = `${directory}/${uniqueName}`;
    const storageRef = ref(storage, fullPath);

    // Usamos la versión "Resumable" de Firebase
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Calculamos el porcentaje de 0 a 100
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error(`Error subiendo archivo ${file.name}:`, error);
        reject(error);
      },
      async () => {
        // La subida terminó con éxito, obtenemos la URL final
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          fullPath,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        });
      },
    );
  });
};

/**
 * Elimina físicamente un archivo del bucket usando su fullPath.
 */
export const deleteFileFromStorage = async (
  fullPath: string,
): Promise<boolean> => {
  try {
    const storageRef = ref(storage, fullPath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error(`Error al borrar archivo en ${fullPath}:`, error);
    return false;
  }
};
