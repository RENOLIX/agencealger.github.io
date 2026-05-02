import type { ElementType } from "react";
import {
  Accessibility,
  Baby,
  BedDouble,
  BriefcaseBusiness,
  Bus,
  CalendarCheck,
  Camera,
  Car,
  Coffee,
  CreditCard,
  Dumbbell,
  Hotel,
  Landmark,
  Luggage,
  Map,
  Mountain,
  ParkingCircle,
  Plane,
  Sailboat,
  ShieldCheck,
  Snowflake,
  Star,
  TicketCheck,
  Trees,
  Utensils,
  Users,
  Wifi,
  Wine,
  Waves,
} from "lucide-react";

export type UserRole = "admin" | "employee";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
};

export type BenefitKey =
  | "Vol"
  | "Hotel"
  | "Repas"
  | "Guide"
  | "Spa"
  | "Wifi"
  | "Plage"
  | "Assurance"
  | "Transfert"
  | "Navette aeroport"
  | "Petit-dejeuner"
  | "Piscine"
  | "Parking"
  | "Climatisation"
  | "Vue mer"
  | "Salle de sport"
  | "Excursions"
  | "Guide prive"
  | "Billets inclus"
  | "Bagages"
  | "Location voiture"
  | "Paiement flexible"
  | "Annulation gratuite"
  | "Centre-ville"
  | "Famille"
  | "Accessible"
  | "Nature"
  | "Montagne"
  | "Croisiere"
  | "Experience locale";

export type Travel = {
  id: string;
  name: string;
  destination: string;
  country: string;
  image: string;
  images: string[];
  date: string;
  duration: string;
  price: number;
  description: string;
  guides: string;
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

export const seedUsers: User[] = [
  { id: "admin", name: "Nora Admin", email: "admin@hamdi.local", password: "admin123", role: "admin", avatar: "NA" },
  { id: "sara", name: "Sara Benali", email: "sara@hamdi.local", password: "voyage123", role: "employee", avatar: "SB" },
  { id: "yacine", name: "Yacine Morel", email: "yacine@hamdi.local", password: "voyage123", role: "employee", avatar: "YM" },
];

export function getUsers() {
  return readStore<User[]>("hv-users", seedUsers);
}

export function saveUsers(nextUsers: User[]) {
  writeStore("hv-users", nextUsers);
}

export const benefitIcons: Record<BenefitKey, ElementType> = {
  Vol: Plane,
  Hotel,
  Repas: Utensils,
  Guide: Users,
  Spa: Star,
  Wifi,
  Plage: Waves,
  Assurance: ShieldCheck,
  Transfert: Car,
  "Navette aeroport": Bus,
  "Petit-dejeuner": Coffee,
  Piscine: Waves,
  Parking: ParkingCircle,
  Climatisation: Snowflake,
  "Vue mer": Waves,
  "Salle de sport": Dumbbell,
  Excursions: Camera,
  "Guide prive": Users,
  "Billets inclus": TicketCheck,
  Bagages: Luggage,
  "Location voiture": Car,
  "Paiement flexible": CreditCard,
  "Annulation gratuite": CalendarCheck,
  "Centre-ville": Landmark,
  Famille: Baby,
  Accessible: Accessibility,
  Nature: Trees,
  Montagne: Mountain,
  Croisiere: Sailboat,
  "Experience locale": Map,
};

export const benefitOptions: BenefitKey[] = [
  "Vol",
  "Hotel",
  "Repas",
  "Guide",
  "Spa",
  "Wifi",
  "Plage",
  "Assurance",
  "Transfert",
  "Navette aeroport",
  "Petit-dejeuner",
  "Piscine",
  "Parking",
  "Climatisation",
  "Vue mer",
  "Salle de sport",
  "Excursions",
  "Guide prive",
  "Billets inclus",
  "Bagages",
  "Location voiture",
  "Paiement flexible",
  "Annulation gratuite",
  "Centre-ville",
  "Famille",
  "Accessible",
  "Nature",
  "Montagne",
  "Croisiere",
  "Experience locale",
];

export const benefitLabels: Record<BenefitKey, string> = {
  Vol: "الطيران",
  Hotel: "الفندق",
  Repas: "الوجبات",
  Guide: "مرشد",
  Spa: "راحة",
  Wifi: "واي فاي",
  Plage: "زيارة",
  Assurance: "تأمين",
  Transfert: "النقل",
  "Navette aeroport": "نقل المطار",
  "Petit-dejeuner": "الفطور",
  Piscine: "مسبح",
  Parking: "موقف",
  Climatisation: "تكييف",
  "Vue mer": "إطلالة",
  "Salle de sport": "قاعة رياضة",
  Excursions: "جولات",
  "Guide prive": "مرشد خاص",
  "Billets inclus": "التذاكر",
  Bagages: "الأمتعة",
  "Location voiture": "سيارة",
  "Paiement flexible": "دفع مرن",
  "Annulation gratuite": "إلغاء مجاني",
  "Centre-ville": "قرب المركز",
  Famille: "عائلات",
  Accessible: "مناسب للجميع",
  Nature: "راحة",
  Montagne: "مزارات",
  Croisiere: "تنقلات",
  "Experience locale": "مرافقة محلية",
};

export const categoryLabels: Record<Travel["category"] | "Tous", string> = {
  Tous: "الكل",
  Plage: "اقتصادي",
  Aventure: "منظم",
  Culture: "عمرة",
  Luxe: "مميز",
};

export const seedTravels: Travel[] = [
  {
    id: "omra-juin",
    name: "عمرة شهر يونيو",
    destination: "مكة المكرمة",
    country: "السعودية",
    image: "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400",
    images: ["https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400"],
    date: "2026-06-01",
    duration: "30 يوم",
    price: 185000,
    description: "برنامج كامل من 1 إلى 30 يونيو يشمل الإقامة قرب الحرم، النقل، والمتابعة اليومية.",
    guides: "الشيخ أحمد بن يوسف، الأستاذ سمير بن عمر",
    category: "Culture",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Transfert", "Assurance"],
    ticketsTotal: 45,
    ticketsLeft: 31,
    rating: 4.9,
  },
  {
    id: "omra-juillet",
    name: "عمرة شهر يوليو",
    destination: "مكة المكرمة",
    country: "السعودية",
    image: "https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1400",
    images: ["https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1400"],
    date: "2026-07-01",
    duration: "30 يوم",
    price: 189000,
    description: "رحلة منظمة من 1 إلى 30 يوليو مع مرشدين مرافقين وخدمة متابعة للحجاج والمعتمرين.",
    guides: "الحاج مصطفى قادري، الأستاذة نوال حميدي",
    category: "Culture",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Wifi", "Transfert"],
    ticketsTotal: 40,
    ticketsLeft: 22,
    rating: 4.8,
  },
  {
    id: "omra-aout",
    name: "عمرة شهر أغسطس",
    destination: "مكة المكرمة",
    country: "السعودية",
    image: "https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1400",
    images: ["https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1400"],
    date: "2026-08-01",
    duration: "30 يوم",
    price: 192000,
    description: "إقامة مريحة من 1 إلى 30 أغسطس، تنقلات جماعية، ومرافقة إدارية طوال الرحلة.",
    guides: "الشيخ عبد الرحمن علي، الأستاذ كريم منصوري",
    category: "Luxe",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Climatisation", "Assurance"],
    ticketsTotal: 36,
    ticketsLeft: 14,
    rating: 5,
  },
  {
    id: "omra-septembre",
    name: "عمرة شهر سبتمبر",
    destination: "مكة المكرمة",
    country: "السعودية",
    image: "https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1400",
    images: ["https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1400"],
    date: "2026-09-01",
    duration: "30 يوم",
    price: 179000,
    description: "برنامج اقتصادي من 1 إلى 30 سبتمبر مع خدمات أساسية منظمة وقريبة من احتياجات العائلات.",
    guides: "الحاج رابح دحمان، الأستاذ ياسين مرابط",
    category: "Aventure",
    benefits: ["Vol", "Hotel", "Guide", "Transfert", "Bagages"],
    ticketsTotal: 50,
    ticketsLeft: 37,
    rating: 4.7,
  },
  {
    id: "omra-octobre",
    name: "عمرة شهر أكتوبر",
    destination: "مكة المكرمة",
    country: "السعودية",
    image: "https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1400",
    images: ["https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1400"],
    date: "2026-10-01",
    duration: "30 يوم",
    price: 187000,
    description: "رحلة من 1 إلى 30 أكتوبر تجمع بين التنظيم الهادئ والإرشاد الديني والمتابعة اليومية.",
    guides: "الشيخ بلال زروقي، الأستاذة مريم بلقاسم",
    category: "Culture",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Wifi", "Assurance"],
    ticketsTotal: 42,
    ticketsLeft: 26,
    rating: 4.9,
  },
  {
    id: "omra-novembre",
    name: "عمرة شهر نوفمبر",
    destination: "مكة المكرمة",
    country: "السعودية",
    image: "https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1400",
    images: ["https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1400"],
    date: "2026-11-01",
    duration: "30 يوم",
    price: 194000,
    description: "برنامج مميز من 1 إلى 30 نوفمبر مع فنادق مختارة وخدمة إرشاد ومرافقة كاملة.",
    guides: "الحاج نور الدين بوعلام، الأستاذة سهام عابد",
    category: "Luxe",
    benefits: ["Vol", "Hotel", "Repas", "Guide", "Wifi", "Paiement flexible"],
    ticketsTotal: 34,
    ticketsLeft: 19,
    rating: 4.8,
  },
];

export const destinations = [
  { name: "عمرة يونيو", country: "مكة المكرمة", image: "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1200", trips: 31, tag: "1-30 يونيو", tall: true },
  { name: "عمرة يوليو", country: "مكة المكرمة", image: "https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1200", trips: 22, tag: "1-30 يوليو" },
  { name: "عمرة أغسطس", country: "مكة المكرمة", image: "https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1200", trips: 14, tag: "1-30 أغسطس" },
  { name: "عمرة سبتمبر", country: "مكة المكرمة", image: "https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1200", trips: 37, tag: "1-30 سبتمبر" },
  { name: "عمرة أكتوبر", country: "مكة المكرمة", image: "https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1200", trips: 26, tag: "1-30 أكتوبر" },
  { name: "عمرة نوفمبر", country: "مكة المكرمة", image: "https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1200", trips: 19, tag: "1-30 نوفمبر", tall: true },
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
