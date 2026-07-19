"use client";

import CardTitle from "@/components/home/CardTitle";
import {
  IconBuildingStore,
  IconEdit,
  IconNote,
  IconPlus,
  IconTrash,
  IconUserCircle,
  IconUserDollar,
} from "@tabler/icons-react";
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
import dynamic from "next/dynamic";
import useProviders from "@/hooks/providers/useProviders";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useMemo, useState } from "react";
import ProviderTableToolbar, {
  ProviderFilters,
} from "@/components/provider/ProviderTableToolbar";
import { DynamicTable } from "@/components/ui/table/DynamicTable";
import { Provider } from "@/validations/provider.validations";
import Image from "next/image";
import { defaultCellValue } from "@/utils/table.utils";
import { PROVIDER_TYPE_MAP } from "@/types/providersTypes";
import { dateToString } from "@/utils/dateUtils";
import Link from "next/link";
import FloatingActionButton from "@/components/general/FloatingActionButton";
import { toast } from "sonner";
import { softDeleteProvider } from "@/services/provider.service";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { QueryConstraint, where } from "firebase/firestore";
import { transformProvider } from "@/utils/normalizers/normalizeProviders";
import { BaseTableProps } from "@/components/ui/table/BaseTable";
import { Note } from "@/validations/note.validations";
import { transformNote } from "@/utils/normalizers/normalizeNotes";
import NoteCard from "@/components/note/NoteCard";
import { softDeleteNote } from "@/services/note.service";
import EmptyState from "@/components/general/EmptyState";

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
  const [selectedItem, setSelectedItem] = useState<Note | null>();

  const [isDeleting, setIsDeleting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handlePreDelete = (item: Note) => {
    setSelectedItem(item);
    onOpen();
  };

  const handleDelete = async () => {
    if (!selectedItem) return toast.error("No se ha podido eliminar la nota");

    setIsDeleting(true);

    try {
      const res = await softDeleteNote(selectedItem.id);
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
      setSelectedItem(null); // Limpiamos el buffer
    }
  };

  return (
    <main className="flex gap-5 h-full">
      <FloatingActionButton
        label="Nuevo"
        startContent={<IconPlus />}
        as={Link}
        href="/dashboard/notas/crear"
      />
      {/* CHART SECTION */}
      <section className="w-full h-full bg-layer-2 rounded-3xl p-3 flex flex-col gap-4">
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Confirmar Eliminación</ModalHeader>
            <ModalBody>
              <p>
                ¿Estás seguro de que deseas eliminar a{" "}
                <strong>{selectedItem?.title}</strong>? Esta acción no se puede
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
                    as={Link}
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
