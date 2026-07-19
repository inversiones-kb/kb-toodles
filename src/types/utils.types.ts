// src/types/utils.types.ts

/**
 * Convierte todas las propiedades de un tipo (y de sus objetos anidados) en opcionales.
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
