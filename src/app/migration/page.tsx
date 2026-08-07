/* "use client";
import { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { Button } from "@heroui/react"; // O el botón que uses
import { db } from "@/firebaseConfig";

export default function BalancesMigrationTool() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const runMigration = async () => {
    setLoading(true);
    setStatus("Analizando cuadres de caja...");

    try {
      const balancesRef = collection(db, "register_balances");
      const snapshot = await getDocs(balancesRef);

      // Arreglo para guardar múltiples lotes y evitar el límite de 500 de Firestore
      const batches = [];
      let currentBatch = writeBatch(db);

      let operationCount = 0;
      let totalUpdated = 0;

      // Iteramos sobre todos los cuadres
      snapshot.docs.forEach((balanceDoc) => {
        const data = balanceDoc.data();

        // Verificamos si existe el objeto usd (por seguridad, por si hay documentos mal formados)
        const usdData = data.money?.usd || {};

        // Verificamos si los campos están ausentes (undefined)
        const needsRate3 = usdData.rate3 === undefined;
        const needsCash3 = usdData.cash3 === undefined;

        if ((needsRate3 || needsCash3) && data.status !== "OPEN") {
          const docRef = doc(db, "register_balances", balanceDoc.id);
          const updatePayload: Record<string, any> = {};

          // 🔥 MAGIA AQUÍ: Usamos Dot Notation para no sobrescribir el resto del objeto money
          if (needsRate3) updatePayload["money.usd.rate3"] = 0;
          if (needsCash3) updatePayload["money.usd.cash3"] = 0;

          currentBatch.update(docRef, updatePayload);
          operationCount++;
          totalUpdated++;

          // Si llegamos a 500 operaciones, guardamos este lote y abrimos uno nuevo
          if (operationCount === 500) {
            batches.push(currentBatch);
            currentBatch = writeBatch(db);
            operationCount = 0;
          }
        }
      });

      // Si quedó algún lote a medias (ej. 230 operaciones), lo añadimos a la lista
      if (operationCount > 0) {
        batches.push(currentBatch);
      }

      setStatus(`Ejecutando ${batches.length} lotes de actualización...`);

      // Ejecutamos todos los lotes secuencialmente
      for (const batch of batches) {
        await batch.commit();
      }

      setStatus(
        `¡Migración exitosa! Se corrigieron ${totalUpdated} cuadres de caja.`,
      );
    } catch (error) {
      console.error("Error en migración:", error);
      setStatus("Error: Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 border rounded-xl max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Migración de Cuadres de Caja</h2>
      <p className="mb-4 text-sm text-gray-600">
        Este script analizará todos los cuadres históricos e inyectará
        <strong> money.usd.rate3</strong> y <strong>money.usd.cash3</strong> en
        valor 0 si no existen.
      </p>

      <Button color="primary" isLoading={loading} onClick={runMigration}>
        Ejecutar Migración
      </Button>

      {status && (
        <div className="mt-4 p-3 bg-default-100 rounded-lg">
          <p className="font-medium text-sm">{status}</p>
        </div>
      )}
    </div>
  );
}
 */
