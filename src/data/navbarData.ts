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
  IconKey,
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
        href: "/dashboard/cuadre-de-cajas",
        Icon: IconEye,
      },
      /* {
        name: "Crear",
        href: "/dashboard/cuadre-de-cajas/crear",
        Icon: IconPlus,
      }, */
    ],
  },
  {
    name: "Empleados",
    Icon: IconUsersGroup,
    items: [
      {
        name: "Ver",
        href: "/dashboard/empleados",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/dashboard/empleados/crear",
        Icon: IconPlus,
      },
    ],
  },
  {
    name: "Usuarios",
    Icon: IconKey,
    items: [
      {
        name: "Ver",
        href: "/dashboard/usuarios",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/dashboard/usuarios/crear",
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
        href: "/dashboard/proveedores",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/dashboard/proveedores/crear",
        Icon: IconPlus,
      },
    ],
  },
  /* {
    name: "Deudas",
    Icon: IconCash,
    items: [
      {
        name: "Ver",
        href: "/dashboard/deudas",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/dashboard/deudas/crear",
        Icon: IconPlus,
      },
    ],
  }, */
  /* {
    name: "Pedidos",
    Icon: IconInvoice,
    items: [
      {
        name: "Ver",
        href: "/dashboard/pedidos",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/dashboard/pedidos/crear",
        Icon: IconPlus,
      },
    ],
  }, */
  {
    name: "Notas",
    Icon: IconNote,
    items: [
      {
        name: "Ver",
        href: "/dashboard/notas",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/dashboard/notas/crear",
        Icon: IconPlus,
      },
    ],
  },
  /*  {
    name: "Auditorias de Inventario",
    Icon: IconCircleDashedCheck,
    items: [
      {
        name: "Ver",
        href: "/dashboard/auditorias-inventario",
        Icon: IconEye,
      },
      {
        name: "Crear",
        href: "/dashboard/auditorias-inventario/crear",
        Icon: IconPlus,
      },
    ],
  }, */
];
