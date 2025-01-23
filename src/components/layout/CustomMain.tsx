import React from "react";

interface IProps {
  children: React.JSX.Element | React.JSX.Element[] | React.ReactNode;
}
const CustomSection = ({ children }: IProps) => {
  return (
    <main className="w-full h-full rounded-3xl bg-layer-2 p-3">{children}</main>
  );
};

export default CustomSection;
