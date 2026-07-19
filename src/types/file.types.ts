export interface FileMetadata {
  url: string; // URL pública temporal/permanente para renderizar en un <iframe> o <img>
  fullPath: string; // Ruta interna en el bucket (ej: "employees/cvs/1715421_cv.pdf") - Vital para eliminar
  name: string; // Nombre original del archivo ("cv_juan.pdf")
  size: number; // Tamaño en bytes
  mimeType: string; // Tipo de archivo ("application/pdf")
  uploadedAt: string; // Fecha de subida en formato ISO
}
