import React from "react";
import { Icon, IconArrowNarrowLeft } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
interface IProps {
  title: string;
  Icon: Icon;
}

const CardTitle = ({ title, Icon }: IProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-stretch gap-1.5">
      {pathname !== "/" && (
        <Button
          color="secondary"
          isIconOnly
          size="sm"
          radius="full"
          onPress={() => router.back()}
          className="h-full"
        >
          <IconArrowNarrowLeft size={20} />
        </Button>
      )}
      <div className="flex items-center gap-1.5 w-fit bg-light/20 text-light px-3 py-1.5 rounded-full">
        <p className="text-xs w-fit">{title}</p>
      </div>
    </div>
  );
};

export default CardTitle;
