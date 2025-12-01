import { dateToString } from "@/utils/dateUtils";
import { Button } from "@heroui/react";
import { IconEyeDollar } from "@tabler/icons-react";
import React from "react";

interface IProps {
  title: string;
  provider: string;
  created_at: Date;
}

const HomeOrderCard = ({ title, provider, created_at }: IProps) => {
  return (
    <div className="rounded-2xl bg-layer-3 p-2 flex gap-2">
      <div className="flex flex-col gap-0 flex-1">
        <h6 className="font-semibold">{title}</h6>
        <p className="text-soft-light text-sm font-normal leading-tight">
          A {provider}
        </p>
        <p className="text-soft-light text-sm font-normal leading-tight">
          Creado el {dateToString(created_at)}
        </p>
      </div>
      <Button
        isIconOnly
        className="bg-brand-primary/20 h-full w-fit text-brand-primary rounded-xl p-2"
      >
        <IconEyeDollar />
      </Button>
    </div>
  );
};

export default HomeOrderCard;
