import type { ElementType } from "react";
import { Camera, Hotel, Plane, ShieldCheck, Star, Utensils, Users, Wifi, Waves } from "lucide-react";

export type UserRole = "admin" | "employee";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
};

export type BenefitKey = "Vol" | "Hotel" | "Repas" | "Guide" | "Spa" | "Wifi" | "Plage" | "Assurance";

export type Travel = {
  id: string;
  name: string;
  destination: string;
  country: string;
  image: string;
  date: string;
  duration: string;
  price: number;
  description: string;
  category: "Plage" | "Aventure" | "Culture" | "Luxe";
  benefits: BenefitKey[];
  ticketsTotal: number;
  ticketsLeft: number;
  rating: number;
};

export type Reservation = {
  id: string;
  travelId: string;
  travelName: string;
  employeeId: string;
  employeeName: string;
  clientName: string;
  clientPhone: string;
  quantity: number;
  total: number;
  status: "Validee" | "En attente";
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  destination: string;
  message: string;
  status: "Nouveau" | "Lu";
  createdAt: string;
};

export const users: User[] = [
  { id: "admin", name: "Nora Admin", email: "admin@hamdi.local", password: "admin123", role: "admin", avatar: "NA" },
  { id: "sara", name: "Sara Benali", email: "sara@hamdi.local", password: "voyage123", role: "employee", avatar: "SB" },
  { id: "yacine", name: "Yacine Morel", email: "yacine@hamdi.local", password: "voyage123", role: "employee", avatar: "YM" },
];

export const benefitIcons: Record<BenefitKey, ElementType> = {
  Vol: Plane,
  Hotel,
  Repas: Utensils,
  Guide: Users,
  Spa: Star,
  Wifi,
  Plage: Waves,
  Assurance: ShieldCheck,
};

export const benefitOptions: BenefitKey[] = ["Vol", "Hotel", "Repas", "Guide", "Spa", "Wifi", "Plage", "Assurance"];

export const seedTravels: Travel[] = [
  {
    id: "grece",
    name: "Escapade Grecque",
    destination: "Santorini & Mykonos",
    country: "Grece",
    image: "https://images.unsplash.com/photo-1651610526505-a46802a4f2a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    date: "2026-06-15",
    duration: "8 jours",
    price: 2490,
    description: "Couchers de soleil, maisons blanches, criques privees et hotels elegants en bord de mer.",
    category: "Plage",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Plage"],
    ticketsTotal: 38,
    ticketsLeft: 24,
    rating: 4.9,
  },
  {
    id: "bali",
    name: "Bali Authentique",
    destination: "Ubud & Seminyak",
    country: "Indonesie",
    image: "https://images.unsplash.com/photo-1550232864-45ae019ae566?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    date: "2026-07-08",
    duration: "12 jours",
    price: 3150,
    description: "Temples, rizieres, villa privee et immersion douce dans la culture balinaise.",
    category: "Culture",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Wifi"],
    ticketsTotal: 30,
    ticketsLeft: 18,
    rating: 4.8,
  },
  {
    id: "maldives",
    name: "Maldives Prestige",
    destination: "Atoll de Male",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1575231902142-29aaec0bd547?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    date: "2026-07-01",
    duration: "7 jours",
    price: 4890,
    description: "Bungalow sur l'eau, spa, lagon transparent et service ultra-personnalise.",
    category: "Luxe",
    benefits: ["Vol", "Hotel", "Repas", "Spa", "Plage", "Assurance"],
    ticketsTotal: 16,
    ticketsLeft: 9,
    rating: 5,
  },
  {
    id: "perou",
    name: "Perou Mysterieux",
    destination: "Lima, Cusco & Machu Picchu",
    country: "Perou",
    image: "https://images.unsplash.com/photo-1568665320350-dd0496ef77cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    date: "2026-07-24",
    duration: "14 jours",
    price: 3680,
    description: "Un circuit intense entre cite inca, montagnes sacrees et tables locales memorables.",
    category: "Aventure",
    benefits: ["Vol", "Hotel", "Guide", "Assurance"],
    ticketsTotal: 24,
    ticketsLeft: 15,
    rating: 4.7,
  },
  {
    id: "japon",
    name: "Tokyo & Kyoto",
    destination: "Japon traditionnel",
    country: "Japon",
    image: "https://images.unsplash.com/photo-1557348024-6938769deccd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    date: "2026-08-07",
    duration: "11 jours",
    price: 3290,
    description: "Ryokan, temples, quartiers futuristes et accompagnement expert du premier au dernier jour.",
    category: "Culture",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Wifi"],
    ticketsTotal: 32,
    ticketsLeft: 21,
    rating: 4.9,
  },
  {
    id: "dubai",
    name: "Dubai Opulence",
    destination: "Dubai & Abu Dhabi",
    country: "Emirats",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    date: "2026-06-20",
    duration: "6 jours",
    price: 2890,
    description: "Hotels cinq etoiles, desert prive, diners panoramiques et excursions VIP.",
    category: "Luxe",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Wifi"],
    ticketsTotal: 28,
    ticketsLeft: 17,
    rating: 4.8,
  },
];

export const destinations = [
  { name: "Santorini", country: "Grece", image: "https://images.unsplash.com/photo-1574710042811-c910dedcb7a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900", trips: 24, tag: "Plage", tall: true },
  { name: "Maldives", country: "Ocean Indien", image: "https://images.unsplash.com/photo-1542292714-0af7af35e324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900", trips: 18, tag: "Luxe" },
  { name: "Tokyo", country: "Japon", image: "https://images.unsplash.com/photo-1570608301011-2781ae9f4d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900", trips: 31, tag: "Culture" },
  { name: "Machu Picchu", country: "Perou", image: "https://images.unsplash.com/photo-1543385426-191664295b58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900", trips: 15, tag: "Aventure" },
  { name: "Bali", country: "Indonesie", image: "https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900", trips: 22, tag: "Nature" },
  { name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900", trips: 45, tag: "Romance", tall: true },
];

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
