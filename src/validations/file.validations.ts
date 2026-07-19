import { z } from "zod";

/**
 * Genera un esquema de validación dinámico para archivos
 * @param maxSizeMB Tamaño máximo permitido en Megabytes
 * @param acceptedTypes Array de MimeTypes permitidos (ej: ["application/pdf", "image/jpeg"])
 */
export const createFileSchema = (
  maxSizeMB: number,
  acceptedTypes: string[],
) => {
  const MAX_FILE_SIZE = maxSizeMB * 1024 * 1024; // Conversión a bytes

  return z
    .any()
    .refine(
      (file) => !!file && file instanceof File,
      "Debes adjuntar un archivo válido.",
    )
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE,
      `El archivo es demasiado grande. El máximo permitido es ${maxSizeMB}MB.`,
    )
    .refine(
      (file) => acceptedTypes.includes(file?.type),
      `Formato no soportado. Tipos permitidos: ${acceptedTypes.map((t) => t.split("/")[1]).join(", ")}`,
    );
};
