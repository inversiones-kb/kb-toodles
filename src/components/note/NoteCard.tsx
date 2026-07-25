import { Note } from "@/validations/note.validations";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { IconDots } from "@tabler/icons-react";
import Link from "next/link";
import BranchLink from "../general/BranchLink";

interface Props {
  data: Note;
  handleDelete?: (item: Note, isHardDelete: boolean) => void;
}

const NoteCard = ({ data, handleDelete }: Props) => {
  return (
    <div className="p-3 bg-layer-3 h-fit rounded-xl gap-3 flex flex-col w-full break-inside-avoid mb-4">
      <div className="flex gap-2 justify-between items-center">
        <h6 className="text-lg leading-tight">{data.title}</h6>

        <Popover placement="bottom-end" showArrow={true}>
          <PopoverTrigger>
            <Button isIconOnly size="sm">
              <IconDots size={20} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 flex flex-col overflow-hidden">
            <Button
              as={BranchLink}
              href={`/dashboard/notas/${data.id}`}
              size="sm"
              variant="light"
              className="rounded-none px-8 py-5"
            >
              Editar
            </Button>
            <span className="w-full h-px bg-soft-light/20" />
            {handleDelete && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                className="rounded-none px-8 py-5"
                onPress={(e) => handleDelete(data, e.shiftKey)}
              >
                Borrar
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-balance text-sm text-soft-light">{data.text}</p>
    </div>
  );
};

export default NoteCard;
