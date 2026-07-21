import React from "react";

interface IProps {
  title: string;
  text: string;
}

const HomeNoteCard = ({ title, text }: IProps) => {
  return (
    <div className="rounded-2xl bg-layer-3 p-2 flex flex-col gap-0">
      <h6 className="font-semibold">{title}</h6>
      <p className="text-soft-light text-sm font-normal leading-tight">
        {text}
      </p>
    </div>
  );
};

export default HomeNoteCard;
