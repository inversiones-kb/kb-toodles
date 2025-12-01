import { Spacer } from "@heroui/react";
import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionContent?: React.ReactNode;
}

const EmptyState = ({
  title = "No hay contenido",
  description,
  actionContent,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-lg font-semibold text-soft-light">{title}</h2>
      <p className="text-sm text-light/30">{description}</p>
      <Spacer y={4} />
      {actionContent}
    </div>
  );
};

export default EmptyState;
