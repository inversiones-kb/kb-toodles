import { RetailSeason } from "@/types/retailSeason.types";
import {
  IconBabyCarriage,
  IconBackpack,
  IconBriefcase,
  IconDeviceGamepad,
  IconGift,
  IconHeart,
  IconTags,
} from "@tabler/icons-react";

export const VENEZUELA_RETAIL_SEASONS: RetailSeason[] = [
  {
    id: "san-valentin",
    title: "Día de los Enamorados",
    type: "fixed",
    month: 2,
    day: 14,
    icon: IconHeart,
    themeColor: "text-danger-500", // Rojo/Rosado
  },
  {
    id: "dia-madre",
    title: "Día de las Madres",
    type: "relative",
    month: 5,
    weekPosition: 2, // Segundo
    dayOfWeek: 0, // Domingo
    icon: IconBabyCarriage, // O una flor
    themeColor: "text-pink-500",
  },
  {
    id: "dia-padre",
    title: "Día del Padre",
    type: "relative",
    month: 6,
    weekPosition: 3, // Tercer
    dayOfWeek: 0, // Domingo
    icon: IconBriefcase,
    themeColor: "text-blue-500",
  },
  {
    id: "dia-nino",
    title: "Día del Niño",
    type: "relative",
    month: 7,
    weekPosition: 3, // Tercer
    dayOfWeek: 0, // Domingo
    icon: IconDeviceGamepad,
    themeColor: "text-warning-500", // Amarillo/Naranja
  },
  {
    id: "vuelta-clases",
    title: "Vuelta a Clases",
    type: "month-long",
    month: 9, // Típicamente todo septiembre
    day: 15, // Fecha referencial central
    icon: IconBackpack,
    themeColor: "text-primary-500",
  },
  {
    id: "black-friday",
    title: "Black Friday",
    type: "relative",
    month: 11,
    weekPosition: 4, // Último/Cuarto
    dayOfWeek: 5, // Viernes
    icon: IconTags,
    themeColor: "text-default-900", // Negro/Oscuro
  },
  {
    id: "navidad",
    title: "Temporada Navideña",
    type: "fixed",
    month: 12,
    day: 24,
    icon: IconGift,
    themeColor: "text-success-500", // Verde
  },
];
