import React from "react";

interface InputGroupSectionProps {
  title: string;
  children: React.ReactNode;
}

const InputGroupSection = ({ children, title }: InputGroupSectionProps) => {
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <h6 className="text-xs text-soft-light font-semibold">{title}</h6>
      <div className="flex flex-col gap-2 w-full">{children}</div>
    </div>
  );
};

export default InputGroupSection;
