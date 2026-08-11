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
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import {
  IconChevronsRight,
  IconChevronUp,
  IconDashboard,
  IconMenu,
  IconSelector,
} from "@tabler/icons-react";
import clsx from "clsx";
import { NAVBAR_DATA } from "@/data/navbarData";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useNavbarStore } from "@/store/navbarStore";
import { useAuthStore } from "@/app/context/AuthProvider";
import { logoutUser } from "@/services/auth.service";
import { toast } from "sonner";
import BranchLink from "./BranchLink";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import {
  BUSINESS_BRANCH_MAP,
  BUSINESS_BRANCH_OPTIONS,
  BUSINESS_BRANCHES,
  BusinessBranch,
} from "@/types/businessBranch.types";

const Content = () => {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useNavbarStore();
  const { user, isLoading, clearAuth } = useAuthStore((store) => store);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const nextRouter = useRouter();
  const logoutDisclosure = useDisclosure();

  const branch = useParams().branch as keyof typeof BUSINESS_BRANCH_MAP;

  useEffect(() => {
    const storedState = localStorage.getItem("navbarIsCollapsed");

    setIsCollapsed(storedState === "true");
  }, []);

  useEffect(() => {
    if (isCollapsed != null) {
      localStorage.setItem("navbarIsCollapsed", isCollapsed.toString());
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    setDeleteLoading(true);
    // 1. Matamos la sesión en el backend (Firebase)
    const result = await logoutUser();

    if (result.success) {
      // 2. Limpiamos la memoria del cliente (Zustand)
      clearAuth();

      // 3. Expulsamos al usuario a la pantalla de login
      nextRouter.push("/");
    } else {
      // Aquí podrías disparar un toast de error si falla la red
      toast.error("No se pudo cerrar sesión");
    }
    setDeleteLoading(false);
  };

  const onBranchChange = (newBranch: BusinessBranch) => {
    if (!newBranch || newBranch === branch) return;

    // Magia de reemplazo: cambiamos "/la-fria" por "/main_st" en la cadena de texto
    const newPath = pathname.replace(`/${branch}`, `/${newBranch}`);

    // Ejecutamos la navegación fluida
    nextRouter.push(newPath);
  };

  const branchlessPathname = pathname.replace(`/${branch}`, "");

  return (
    <>
      <Modal
        isOpen={logoutDisclosure.isOpen}
        onClose={logoutDisclosure.onClose}
      >
        <ModalContent>
          <ModalHeader>¿Cerrar sesión?</ModalHeader>
          <ModalBody>
            <p>Volverás a la pantalla de iniciar sesión</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={logoutDisclosure.onClose}
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

      <BranchLink href={"/dashboard"} className="flex items-center gap-3">
        <Image
          width={120}
          height={120}
          alt="Logo de la empresa"
          className="w-10 h-auto"
          src={LogoImage}
        />
        <div className="flex flex-col gap-0">
          <p
            className={clsx([
              "transition-opacity leading-tight",
              { "opacity-0": isCollapsed },
            ])}
          >
            Toddles
          </p>
          <p className="text-sm leading-tight font-light text-soft-light">
            {BUSINESS_BRANCH_MAP[branch].title}
          </p>
        </div>
      </BranchLink>

      <Divider className="bg-layer-3 my-2" />

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden pr-1.5">
        <div
          className={clsx([
            "transition-opacity absolute pr-[inherit] top-0 left-0 z-10 w-full h-full",
            { "opacity-0 z-0 overflow-hidden": isCollapsed },
          ])}
        >
          <BranchLink
            className={clsx([
              "flex items-center gap-3 p-2 hover:bg-layer-3 transition-colors rounded-2xl",
              { "text-light bg-light/10": branchlessPathname === "/dashboard" },
            ])}
            href={"/dashboard"}
          >
            <IconDashboard size={32} />
            <span className="w-full text-ellipsis overflow-hidden whitespace-nowrap text-xs">
              Panel
            </span>
          </BranchLink>
          <div className="h-px" />
          <Accordion
            className="px-0 flex flex-col"
            variant="light"
            defaultExpandedKeys={[`/${branchlessPathname.split("/")[1]}`]}
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
                  <BranchLink
                    key={child.href}
                    className={clsx([
                      "flex items-center gap-1 p-2 hover:bg-layer-2 transition-colors rounded-lg text-soft-light",
                      {
                        "text-light bg-light/10 hover:bg-light/10":
                          branchlessPathname === child.href,
                      },
                    ])}
                    href={child.href}
                  >
                    <child.Icon />
                    <span className="w-full text-ellipsis overflow-hidden whitespace-nowrap text-xs">
                      {child.name}
                    </span>
                  </BranchLink>
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
                as={BranchLink}
                href={"/dashboard"}
                color="secondary"
                className={clsx([
                  "text-soft-light",
                  {
                    "text-light bg-light/10":
                      branchlessPathname === "/dashboard",
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
                  as={BranchLink}
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
      <div className="flex flex-col gap-4 items-start w-full">
        {/*  <Select
          defaultSelectedKeys={[branch || BUSINESS_BRANCHES[0]]}
          label="Sucursal"
          variant="bordered"
          size="sm"
          radius="lg"
          disallowEmptySelection={true}
          items={BUSINESS_BRANCH_OPTIONS}
          disableSelectorIconRotation
          selectorIcon={<IconSelector />}
          onSelectionChange={(value) =>
            onBranchChange(value.currentKey as keyof typeof BUSINESS_BRANCH_MAP)
          }
        >
          {(item) => <SelectItem key={item.key}>{item.title}</SelectItem>}
        </Select> */}

        <div className="flex justify-start px-0 items-center gap-2 w-full rounded-2xl max-w-full min-w-0">
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

          <p
            className={clsx([
              "text-xs transition-opacity text-light",
              { "opacity-0": isCollapsed },
            ])}
          >
            {user?.name} {user?.last_name}
          </p>
        </div>

        <Tabs
          selectedKey={branch}
          onSelectionChange={
            (key) => onBranchChange(key as BusinessBranch)
            /* setSelectedCurrency(key.toString() as typeof selectedCurrency) */
          }
          classNames={{
            base: "w-full",
            tabList: "w-full",
          }}
          items={BUSINESS_BRANCH_OPTIONS}
          variant="solid"
          color="default"
        >
          {(item) => (
            <Tab key={item.key} title={item.title} className="flex-1" />
          )}
        </Tabs>

        <Button
          variant="flat"
          color="default"
          className="w-full"
          onPress={logoutDisclosure.onOpen}
        >
          Cerrar sesión
        </Button>

        {/* <Popover placement="right" offset={0} showArrow>
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
            <Button
              variant="flat"
              color="danger"
              onPress={logoutDisclosure.onOpen}
            >
              Cerrar sesión
            </Button>
          </PopoverContent>
        </Popover> */}

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
    </>
  );
};

const CustomNavbar = () => {
  const branch = useParams().branch as keyof typeof BUSINESS_BRANCH_MAP;
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const pathname = usePathname();
  const branchlessPathname = pathname.replace(`/${branch}`, "");

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      <Drawer
        isDismissable={true}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="opaque"
      >
        <DrawerContent className="bg-stone-900 flex flex-col gap-3 p-6">
          <Content />
        </DrawerContent>
      </Drawer>

      <nav
        className={clsx([
          "bg-layer-2 h-full max-sm:hidden rounded-3xl flex flex-col p-3 items-left justify-between w-full opacity-0 transition-all gap-3 overflow-hidden max-w-56 min-w-56 fadeIn",
          /* { "max-w-56 min-w-56": !isCollapsed }, */
        ])}
      >
        <Content />
      </nav>

      <nav className="max-sm:flex hidden bg-layer-2 p-1.5 rounded-3xl items-center gap-2 justify-between">
        <Button
          as={BranchLink}
          href="/dashboard"
          isIconOnly
          variant="light"
          className={clsx([
            "flex-1 rounded-[1.2rem] py-6",
            {
              "bg-primary/10 text-primary": branchlessPathname === "/dashboard",
            },
          ])}
        >
          <IconDashboard />
        </Button>

        {NAVBAR_DATA.filter((e) => e.mobile).map((item) => (
          <Button
            key={item.name}
            as={BranchLink}
            href={item.items[0].href}
            isIconOnly
            variant="light"
            className={clsx([
              "flex-1 rounded-[1.2rem] py-6",
              {
                "bg-primary/10 text-primary":
                  branchlessPathname === item.items[0].href,
              },
            ])}
          >
            <item.Icon />
          </Button>
        ))}

        <Button
          onPress={() => onOpen()}
          className={clsx([
            "flex-1 rounded-[1.2rem] py-6",
            { "bg-primary/10 text-primary": isOpen },
          ])}
          variant="light"
          isIconOnly
        >
          <IconMenu />
        </Button>
      </nav>
    </>
  );
};

export default CustomNavbar;
