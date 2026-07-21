"use client";

import CardTitle from "@/components/home/CardTitle";
import { IconNote, IconPlus } from "@tabler/icons-react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";

import { getLocalTimeZone, today } from "@internationalized/date";
import { useMemo, useState } from "react";
import { ProviderFilters } from "@/components/provider/ProviderTableToolbar";
import FloatingActionButton from "@/components/general/FloatingActionButton";
import { toast } from "sonner";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { QueryConstraint, where } from "firebase/firestore";
import { Note } from "@/validations/note.validations";
import { transformNote } from "@/utils/normalizers/normalizeNotes";
import NoteCard from "@/components/note/NoteCard";
import { hardDeleteNote, softDeleteNote } from "@/services/note.service";
import EmptyState from "@/components/general/EmptyState";
import BranchLink from "@/components/general/BranchLink";

export default function NotesPage() {
  const [filters, setFilters] = useState<ProviderFilters>({
    search: "",
    country: undefined,
    type: undefined,
    dateRange: {
      start: today(getLocalTimeZone()) as any,
      end: today(getLocalTimeZone()) as any,
    },
  });

  const queryConstraints = useMemo(() => {
    const constraints: QueryConstraint[] = [where("is_deleted", "==", false)];

    if (filters.search) {
      constraints.push(where("name", "==", filters.search));
    }

    return constraints;
  }, [filters]);

  const { data, isLoading, refetch } = useCollectionQuery<Note>(
    "notes",
    queryConstraints,
    [filters],
    transformNote,
  );

  const [deleteContext, setDeleteContext] = useState<{
    id: string | null;
    name: string | null;
    isHardDelete: boolean;
  }>({
    id: null,
    name: null,
    isHardDelete: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handlePreDelete = (item: Note, isHardDelete: boolean = false) => {
    setDeleteContext({
      id: item.id,
      name: item.title,
      isHardDelete,
    });

    onOpen();
  };

  const handleDelete = async () => {
    if (!deleteContext.id)
      return toast.error("No se ha podido eliminar la nota");

    setIsDeleting(true);

    try {
      const res = await (deleteContext.isHardDelete
        ? hardDeleteNote(deleteContext.id)
        : softDeleteNote(deleteContext.id));
      onClose();

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      refetch();
      toast.success("Nota eliminado");
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleting(false);
      setDeleteContext({
        id: null,
        name: null,
        isHardDelete: false,
      }); // Limpiamos el buffer
    }
  };

  return (
    <main className="flex gap-5 h-full">
      <FloatingActionButton
        label="Nuevo"
        startContent={<IconPlus />}
        as={BranchLink}
        href="/dashboard/notas/crear"
      />
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
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
              <p>
                ¿Estás seguro de que deseas eliminar a{" "}
                <strong>{deleteContext?.name}</strong>? Esta acción no se puede
                deshacer.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                color="danger"
                onPress={handleDelete}
                isLoading={isDeleting}
              >
                Sí, Eliminar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <CardTitle Icon={IconNote} title="Notas" />
        <div className="w-full overflow-y-auto h-full flex justify-start items-start">
          {isLoading ? (
            <div className="flex justify-center w-full">
              <Spinner label="Cargando notas..." />
            </div>
          ) : null}

          {!isLoading && data ? (
            data.length ? (
              data.map((note) => {
                return (
                  <NoteCard
                    key={note.id}
                    data={note}
                    handleDelete={handlePreDelete}
                  />
                );
              })
            ) : (
              <EmptyState
                title="No hay notas para mostrar"
                description="Aquí puedes guardar notas del trabajo"
                actionContent={
                  <Button
                    as={BranchLink}
                    href="/dashboard/notas/crear"
                    variant="flat"
                    startContent={<IconPlus />}
                  >
                    Crear
                  </Button>
                }
              />
            )
          ) : null}
        </div>
      </section>
    </main>
  );
}
