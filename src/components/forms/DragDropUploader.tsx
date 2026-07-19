"use client";

import React, { useState, useRef } from "react";
import { Button } from "@heroui/react";
import { IconFileUpload } from "@tabler/icons-react";

interface DragDropUploaderProps {
  label: string;
  maxSizeMB: number;
  acceptedTypes: string[];
  errorMessage?: string;
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null; // Para mostrar qué archivo está seleccionado actualmente
}

export default function DragDropUploader({
  label,
  maxSizeMB,
  acceptedTypes,
  errorMessage,
  onFileSelect,
  currentFile,
}: DragDropUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejadores de eventos de arrastre
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // Manejador del input tradicional
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Generamos el atributo 'accept' nativo de HTML (ej: "application/pdf,image/jpeg")
  const acceptString = acceptedTypes.join(",");

  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-xs font-semibold text-soft-light">{label}</span>

      <div
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer
          ${isDragging ? "border-primary bg-primary-50" : "border-default-300 hover:bg-default-100"}
          ${errorMessage ? "border-danger bg-danger-50" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptString}
          onChange={handleFileInput}
        />

        {currentFile ? (
          <div className="flex flex-col items-center text-center">
            <span className="text-primary font-semibold">
              {currentFile.name}
            </span>
            <span className="text-tiny text-default-500 mb-2">
              {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <Button size="sm" color="danger" variant="flat" onClick={clearFile}>
              Remover archivo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center pointer-events-none">
            <div className="w-10 h-10 mb-2 rounded-full bg-default-200 flex items-center justify-center text-default-500">
              {/* Aquí puedes usar un icono de lucide-react como <UploadCloud size={20} /> */}
              <IconFileUpload />
            </div>
            <p className="text-small text-default-700 font-medium">
              Haz clic o arrastra un archivo aquí
            </p>
            <p className="text-tiny text-default-500 mt-1">
              Solo{" "}
              {acceptedTypes
                .map((t) => t.split("/")[1])
                .join(", ")
                .toUpperCase()}{" "}
              hasta {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Mensaje de error de Zod o React Hook Form */}
      {errorMessage && (
        <span className="text-tiny text-danger">{errorMessage}</span>
      )}
    </div>
  );
}
