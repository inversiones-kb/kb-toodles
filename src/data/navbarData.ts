import {
  Icon,
  IconCash,
  IconCashRegister,
  IconEye,
  IconInvoice,
  IconNote,
  IconPlus,
  IconUserDollar,
  IconUsersGroup,
  IconCircleDashedCheck,
} from "@tabler/icons-react";

interface NavbarItem extends NavbarSection {
  href: string;
}

interface NavbarSection {
  name: string;
  Icon: Icon;
  items: Omit<NavbarItem, "items">[];
}

// ? First items route must be entry path
export const NAVBAR_DATA: NavbarSection[] = [
  {
    name: "Cuadre de cajas",
    Icon: IconCashRegister,
    items: [
      {
        name: "Ver",
        href: "/cuadre-de-cajas",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/cuadre-de-cajas/crear",
        Icon: IconPlus,
      },
    ],
  },
  {
    name: "Empleados",
    Icon: IconUsersGroup,
    items: [
      {
        name: "Ver",
        href: "/empleados",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/empleados/crear",
        Icon: IconPlus,
      },
    ],
  },
  {
    name: "Proveedores",
    Icon: IconUserDollar,
    items: [
      {
        name: "Ver",
        href: "/proveedores",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/proveedores/crear",
        Icon: IconPlus,
      },
    ],
  },
  {
    name: "Deudas",
    Icon: IconCash,
    items: [
      {
        name: "Ver",
        href: "/deudas",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/deudas/crear",
        Icon: IconPlus,
      },
    ],
  },
  {
    name: "Pedidos",
    Icon: IconInvoice,
    items: [
      {
        name: "Ver",
        href: "/pedidos",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/pedidos/crear",
        Icon: IconPlus,
      },
    ],
  },
  {
    name: "Notas",
    Icon: IconNote,
    items: [
      {
        name: "Ver",
        href: "/notas",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/notas/crear",
        Icon: IconPlus,
      },
    ],
  },
  {
    name: "Auditorias de Inventario",
    Icon: IconCircleDashedCheck,
    items: [
      {
        name: "Ver",
        href: "/auditorias-inventario",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/auditorias-inventario/crear",
        Icon: IconPlus,
      },
    ],
  },
];
