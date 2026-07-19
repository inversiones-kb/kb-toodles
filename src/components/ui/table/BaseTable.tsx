"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
  Modal,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import React, { useState } from "react";

// Tipos base para que TypeScript sepa qué esperar
export interface Column {
  key: string;
  label: string;
}

export interface BaseTableProps<T> {
  columns: Column[];
  data: T[];
  // Opcional: Para renderizar celdas personalizadas (botones de acción, fechas formateadas, etc)
  renderCell?: (
    item: T,
    columnKey: React.Key,
    handleDelete: (item: T) => void,
  ) => React.ReactNode;
  onDeleteAction?: (id: string) => Promise<void>;
  emptyContent?: string;
  isLoading?: boolean;
  topContent?: React.ReactNode;
}

// Usamos <T extends { id: string }> porque HeroUI necesita un ID único para cada fila
export default function BaseTable<T extends { id: string }>({
  columns,
  data,
  renderCell,
  emptyContent = "No hay datos para mostrar.",
  topContent,
  isLoading,
  onDeleteAction,
}: BaseTableProps<T>) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Estado para saber a quién vamos a eliminar
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Interceptamos el clic en la fila
  const handlePreDelete = (item: T) => {
    setSelectedItem(item);
    onOpen();
  };

  // 2. Ejecutamos la acción final
  const handleConfirmDelete = async () => {
    if (!selectedItem || !onDeleteAction) return;

    setIsDeleting(true);
    try {
      // Aquí llamas a tu servicio de Firebase o Server Action
      // await deleteUser(selectedItem.id);
      await onDeleteAction(selectedItem.id);

      // Lógica extra: actualizar el estado local para quitar la fila de la vista
      onClose();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleting(false);
      setSelectedItem(null); // Limpiamos el buffer
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalBody>
            {selectedItem && Object.hasOwn(selectedItem, "name") ? (
              <p>
                ¿Estás seguro de que deseas eliminar a{" "}
                <strong>{(selectedItem as any).name}</strong>? Esta acción no se
                puede deshacer.
              </p>
            ) : (
              <p>
                ¿Estás seguro de que deseas eliminar este item? Esta acción no
                se puede deshacer.
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Sí, Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Table
        aria-label="Tabla de datos genérica"
        selectionMode="multiple"
        classNames={{
          th: "bg-layer-3",
          wrapper: "h-full bg-layer-2 p-2",
          tr: "*:hover:before:!bg-layer-3",
        }}
        topContent={topContent}
        topContentPlacement="outside"
        removeWrapper={true}
        isHeaderSticky
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={data}
          emptyContent={emptyContent}
          loadingContent={
            <div className="w-full flex justify-center p-10">
              <Spinner label="Buscando..." color="primary" />
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell
                    ? renderCell(item, columnKey, handlePreDelete)
                    : getKeyValue(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
