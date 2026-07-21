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
  PressEvent,
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
    handleDelete: (item: T, e: PressEvent) => void,
  ) => React.ReactNode;
  onDeleteAction?: (id: string, hardDelete?: boolean) => Promise<void>;
  emptyContent?: string;
  isLoading?: boolean;
  topContent?: React.ReactNode;
}

// Usamos <T extends { id: string }> porque HeroUI necesita un ID único para cada fila
export default function BaseTable<T extends { id: string; name?: string }>({
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
  const [deleteContext, setDeleteContext] = useState<{
    id: string | null;
    isHardDelete: boolean;
    name?: string | null;
  }>({ id: null, isHardDelete: false });

  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Interceptamos el clic en la fila
  const handlePreDelete = (item: T, e: PressEvent) => {
    setDeleteContext({
      id: item.id,
      name: item?.name,
      isHardDelete: e.shiftKey,
    });

    onOpen();
  };

  // 2. Ejecutamos la acción final
  const handleConfirmDelete = async () => {
    if (!deleteContext.id || !onDeleteAction) return;

    setIsDeleting(true);
    try {
      // Aquí llamas a tu servicio de Firebase o Server Action
      // await deleteUser(selectedItem.id);
      await onDeleteAction(deleteContext.id, deleteContext.isHardDelete);

      // Lógica extra: actualizar el estado local para quitar la fila de la vista
      onClose();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleting(false);
      setDeleteContext({ id: null, isHardDelete: false }); // Limpiamos el buffer
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop={deleteContext.isHardDelete ? "blur" : "opaque"}
        classNames={
          deleteContext.isHardDelete
            ? {
                backdrop: "bg-danger/10",
                base: "border-danger/20 border text-soft-light",

                header: "bg-danger/30 text-light",

                /* closeButton: "hover:bg-white/5 active:bg-white/10", */
              }
            : undefined
        }
      >
        <ModalContent>
          <ModalHeader>
            {deleteContext.isHardDelete
              ? "Eliminar permanentemente"
              : "Confirmar Eliminación"}
          </ModalHeader>
          <ModalBody>
            {deleteContext.name ? (
              <p>
                ¿Estás seguro de que deseas eliminar a{" "}
                <strong>{deleteContext.name}</strong>? Esta acción no se puede
                deshacer.
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
          wrapper: "p-0 bg-trasparent h-full",

          th: "bg-layer-3 whitespace-nowrap px-4",

          table: "w-full min-w-max overflow-x-auto",
          base: "w-full",

          tr: "*:hover:before:!bg-layer-3 min-w-max",
          td: "min-w-max whitespace-nowrap px-4",

          tbody: "min-w-max",
        }}
        topContent={topContent}
        topContentPlacement="outside"
        /* removeWrapper={true} */
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
