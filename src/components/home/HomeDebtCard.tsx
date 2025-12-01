import { Currency } from "@/types/unionTypes";
import { dateToString } from "@/utils/dateUtils";
import { moneyFormatter } from "@/utils/formatters";
import { Button } from "@heroui/react";
import { IconEyeDollar } from "@tabler/icons-react";
import React from "react";

interface IProps {
  title: string;
  created_at: Date;
  amount: number;
  currency: Currency;
}

const HomeDebtCard = ({ title, created_at, currency, amount }: IProps) => {
  return (
    <div className="rounded-2xl bg-layer-3 p-2 flex gap-2">
      <div className="flex flex-col gap-0 flex-1">
        <h6 className="font-semibold">{title}</h6>
        <p className="text-soft-light text-sm font-normal leading-tight">A</p>
        <p className="text-soft-light text-sm font-normal leading-tight">
          Creado el {dateToString(created_at)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0 justify-center">
        <h6 className="text-lg font-semibold">
          ${moneyFormatter.format(amount)}
        </h6>
        <p className="font-medium text-sm uppercase">{currency}</p>
      </div>
    </div>
  );
};

export default HomeDebtCard;
