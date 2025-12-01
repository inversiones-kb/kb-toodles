"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import LogoImage from "@public/logo.svg";
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Tooltip,
} from "@heroui/react";
import { IconChevronsRight, IconDashboard } from "@tabler/icons-react";
import clsx from "clsx";
import { NAVBAR_DATA } from "@/data/navbarData";
import { usePathname } from "next/navigation";
import { useNavbarStore } from "@/store/navbarStore";
const CustomNavbar = () => {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useNavbarStore();

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

  return (
    <nav
      className={clsx([
        "bg-layer-2 h-full rounded-3xl flex flex-col p-3 items-left justify-between w-full opacity-0 max-w-16 transition-all gap-3 overflow-hidden",
        { "max-w-56": !isCollapsed },
        { fadeIn: isCollapsed != null },
      ])}
    >
      <Link href={"/"} className="flex items-center gap-3">
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
              { "text-light bg-light/10": pathname === "/" },
            ])}
            href={"/"}
          >
            <IconDashboard size={32} />
            <span className="w-full text-ellipsis overflow-hidden whitespace-nowrap text-xs">
              Panel
            </span>
          </Link>
          <div className="h-[1px]" />
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
                href={"/"}
                color="secondary"
                className={clsx([
                  "text-soft-light",
                  {
                    "text-light bg-light/10": pathname === "/",
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
                        route.items[0].href
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
            <div
              className={clsx([
                "bg-brand-primary/10 text-brand-primary h-full font-medium text-lg p-2 aspect-square grid place-content-center rounded-2xl",
              ])}
            >
              KB
            </div>
          </Tooltip>
          <p
            className={clsx([
              "text-xs transition-opacity text-light",
              { "opacity-0": isCollapsed },
            ])}
          >
            Keibis Belandria
          </p>
        </Button>

        <Button
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
        </Button>
      </div>
    </nav>
  );
};

export default CustomNavbar;
