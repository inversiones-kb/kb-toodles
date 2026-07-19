"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import LogoImage from "@public/logo.svg";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { IconChevronsRight, IconDashboard } from "@tabler/icons-react";
import clsx from "clsx";
import { NAVBAR_DATA } from "@/data/navbarData";
import { usePathname, useRouter } from "next/navigation";
import { useNavbarStore } from "@/store/navbarStore";
import { useAuthStore } from "@/app/context/AuthProvider";
import { logoutUser } from "@/services/auth.service";
import { toast } from "sonner";
const CustomNavbar = () => {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useNavbarStore();
  const { user, isLoading, clearAuth } = useAuthStore((store) => store);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    const storedState = localStorage.getItem("navbarIsCollapsed");

    setIsCollapsed(storedState === "true");
  }, []);

  useEffect(() => {
    if (isCollapsed != null) {
      localStorage.setItem("navbarIsCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed]);

  function toggleMenuIsCollapsed() {
    setIsCollapsed(!isCollapsed);
  }

  const handleLogout = async () => {
    setDeleteLoading(true);
    // 1. Matamos la sesión en el backend (Firebase)
    const result = await logoutUser();

    if (result.success) {
      // 2. Limpiamos la memoria del cliente (Zustand)
      clearAuth();

      // 3. Expulsamos al usuario a la pantalla de login
      router.push("/");
    } else {
      // Aquí podrías disparar un toast de error si falla la red
      toast.error("No se pudo cerrar sesión");
    }
    setDeleteLoading(false);
  };

  return (
    <nav
      className={clsx([
        "bg-layer-2 h-full rounded-3xl flex flex-col p-3 items-left justify-between w-full opacity-0 max-w-16 transition-all gap-3 overflow-hidden",
        { "max-w-56": !isCollapsed },
        { fadeIn: isCollapsed != null },
      ])}
    >
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>¿Cerrar sesión?</ModalHeader>
          <ModalBody>
            <p>Volverás a la pantalla de iniciar sesión</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onClose}
              isDisabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button color="danger" onPress={handleLogout} isLoading={isLoading}>
              Sí, salir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Link href={"/dashboard"} className="flex items-center gap-3">
        <Image
          width={120}
          height={120}
          alt="Logo de la empresa"
          className="w-10 h-auto"
          src={LogoImage}
        />
        <p
          className={clsx(["transition-opacity", { "opacity-0": isCollapsed }])}
        >
          Toddles
        </p>
      </Link>

      <Divider className="bg-layer-3 my-2" />

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden pr-1.5">
        <div
          className={clsx([
            "transition-opacity absolute pr-[inherit] top-0 left-0 z-10 w-full h-full",
            { "opacity-0 z-0 overflow-hidden": isCollapsed },
          ])}
        >
          <Link
            className={clsx([
              "flex items-center gap-3 p-2 hover:bg-layer-3 transition-colors rounded-2xl",
              { "text-light bg-light/10": pathname === "/dashboard" },
            ])}
            href={"/dashboard"}
          >
            <IconDashboard size={32} />
            <span className="w-full text-ellipsis overflow-hidden whitespace-nowrap text-xs">
              Panel
            </span>
          </Link>
          <div className="h-px" />
          <Accordion
            className="px-0 flex flex-col"
            variant="light"
            defaultExpandedKeys={[`/${pathname.split("/")[1]}`]}
            showDivider={true}
            dividerProps={{
              className: "bg-stone-600/10 rounded-full",
            }}
          >
            {NAVBAR_DATA.map((item) => (
              <AccordionItem
                key={item.items[0].href}
                title={item.name}
                startContent={<item.Icon />}
                classNames={{
                  title: "text-xs text-light",
                  base: "hover:bg-layer-3 px-2 rounded-2xl",
                  trigger: "cursor-pointer",
                  content: "py-0 pb-2",
                  indicator: "text-soft-light",
                }}
              >
                {item.items?.map((child) => (
                  <Link
                    key={child.href}
                    className={clsx([
                      "flex items-center gap-1 p-2 hover:bg-layer-2 transition-colors rounded-lg text-soft-light",
                      {
                        "text-light bg-light/10 hover:bg-light/10":
                          pathname === child.href,
                      },
                    ])}
                    href={child.href}
                  >
                    <child.Icon />
                    <span className="w-full text-ellipsis overflow-hidden whitespace-nowrap text-xs">
                      {child.name}
                    </span>
                  </Link>
                ))}
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <ul
          className={clsx([
            "opacity-0 w-full flex flex-col items-center gap-4 transition-opacity absolute top-0 left-0",
            { "opacity-100 z-10": isCollapsed },
          ])}
        >
          <li>
            <Tooltip content="Panel" placement="right" color="secondary">
              <Button
                isIconOnly
                as={Link}
                href={"/dashboard"}
                color="secondary"
                className={clsx([
                  "text-soft-light",
                  {
                    "text-light bg-light/10": pathname === "/dashboard",
                  },
                ])}
                variant="light"
              >
                <IconDashboard />
              </Button>
            </Tooltip>
          </li>
          {NAVBAR_DATA.map((route) => (
            <li key={route.items[0].href}>
              <Tooltip content={route.name} placement="right" color="secondary">
                <Button
                  isIconOnly
                  as={Link}
                  href={route.items[0].href}
                  color="secondary"
                  className={clsx([
                    "text-soft-light",
                    {
                      "text-light bg-light/10": pathname.includes(
                        route.items[0].href,
                      ),
                    },
                  ])}
                  variant="light"
                >
                  <route.Icon />
                </Button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>

      <Divider className="bg-layer-3 my-2" />

      {/* BOTTOM CONTENT */}
      <div className="flex flex-col gap-2 items-start w-full">
        <Popover placement="right" offset={0} showArrow>
          <PopoverTrigger>
            <Button
              variant="light"
              color="secondary"
              className="flex justify-start px-0 items-center gap-2 w-full rounded-2xl max-w-full min-w-0"
            >
              <Tooltip
                isDisabled={!isCollapsed}
                content="Mi perfil"
                placement="right"
                color="secondary"
              >
                <Avatar
                  showFallback
                  color="primary"
                  className="rounded-2xl bg-primary/20 text-primary"
                  fallback={
                    <p className="text-lg">
                      {user?.name[0]}
                      {user?.last_name[0]}
                    </p>
                  }
                />
              </Tooltip>
              <p
                className={clsx([
                  "text-xs transition-opacity text-light",
                  { "opacity-0": isCollapsed },
                ])}
              >
                {user?.name} {user?.last_name}
              </p>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-1 rounded-2xl">
            <Button variant="flat" color="danger" onPress={onOpen}>
              Cerrar sesión
            </Button>
          </PopoverContent>
        </Popover>

        {/*  <Button
          isIconOnly
          className="w-full rounded-2xl"
          color="secondary"
          variant="light"
          onPress={toggleMenuIsCollapsed}
        >
          <IconChevronsRight
            className={clsx([
              "rotate-0 transition-transform",
              { "rotate-180": !isCollapsed },
            ])}
          />
        </Button> */}
      </div>
    </nav>
  );
};

export default CustomNavbar;
