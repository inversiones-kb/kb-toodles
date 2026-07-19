import React from "react";
import { Icon, IconArrowNarrowLeft } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import clsx from "clsx";
interface IProps {
  title: string;
  Icon?: Icon;
  backButton?: boolean;
  endContent?: React.ReactNode;
  loadingProgress?: number;
}

const CardTitle = ({
  title,
  Icon,
  backButton = true,
  endContent,
  loadingProgress = 0,
}: IProps) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex relative flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-stretch gap-1.5">
          {pathname !== "/dashboard" && backButton ? (
            <Button
              color="secondary"
              isIconOnly
              size="sm"
              radius="full"
              onPress={() => router.back()}
              className="h-full py-1"
            >
              <IconArrowNarrowLeft size={20} />
            </Button>
          ) : null}
          <div className="flex items-center gap-1.5 w-fit bg-light/20 text-light px-3 py-1.5 rounded-full">
            <p className="text-xs w-fit">{title}</p>
          </div>
        </div>

        {endContent && <div className="flex gap-2">{endContent}</div>}
      </div>

      <div
        className={clsx([
          "w-full rounded-full h-1 flex transition-colors",
          { "bg-layer-3": loadingProgress > 0 },
        ])}
      >
        <span
          style={{ width: `${loadingProgress}%` }}
          className="inline-block rounded-full bg-primary h-1 transition-all"
        ></span>
      </div>
    </div>
  );
};

export default CardTitle;
