/**
 * Recorre un objeto de forma recursiva y convierte todos los Timestamps de Firestore
 * en objetos Date nativos de JavaScript.
 */
export const normalizeFirestoreData = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  // 1. Si detectamos el método nativo 'toDate' de Firestore, es un Timestamp
  if (typeof obj.toDate === "function") {
    return obj.toDate();
  }

  // 2. Si es un Array (por ejemplo, una lista de gastos dentro de un objeto)
  if (Array.isArray(obj)) {
    return obj.map(normalizeFirestoreData);
  }

  // 3. Si es un objeto regular, procesamos sus propiedades recursivamente
  if (typeof obj === "object") {
    const normalizedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        normalizedObj[key] = normalizeFirestoreData(obj[key]);
      }
    }
    return normalizedObj;
  }

  // 4. Si es un valor primitivo (string, number, boolean), se devuelve intacto
  return obj;
};
