import React from "react";
import { Icon } from "@tabler/icons-react";

interface IProps {
  title: string;
  Icon: Icon;
}

const CardTitle = ({ title, Icon }: IProps) => {
  return (
    <div className="flex items-center gap-1.5 w-fit bg-light/20 text-light px-3 py-1.5 rounded-full">
      <Icon size={20} />
      <p className="text-xs w-fit">{title}</p>
    </div>
  );
};

export default CardTitle;
