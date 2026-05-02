import type { ElementType } from "react";
import {
  Accessibility,
  Baby,
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
  Users,
  Wifi,
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

export type TravelCategory = "Plage" | "Aventure" | "Culture" | "Luxe";

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
  childPrice: number;
  description: string;
  longDescription: string;
  banner: string;
  guides: string[];
  category: TravelCategory;
  benefits: BenefitKey[];
  ticketsTotal: number;
  ticketsLeft: number;
  rating: number;
};

export type ReservationStatus = "Nouvelle" | "En etude" | "Confirmee" | "Annulee";
export type PassengerType = "adult" | "child";

export type ReservationAttachment = {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
};

export type ReservationPassenger = {
  id: string;
  type: PassengerType;
  firstName: string;
  lastName: string;
  phone: string;
  birthPlace: string;
  birthDate: string;
  passportNumber: string;
  passportExpiry: string;
  notes: string;
};

export type Reservation = {
  id: string;
  travelId: string;
  travelName: string;
  employeeId: string | null;
  employeeName: string;
  customerFirstName: string;
  customerLastName: string;
  customerAddress: string;
  customerPhone: string;
  adults: number;
  children: number;
  quantity: number;
  total: number;
  passengers: ReservationPassenger[];
  attachments: ReservationAttachment[];
  notes: string;
  status: ReservationStatus;
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

export type TeamGroup = {
  id: string;
  title: string;
  members: string[];
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
  Repas: Coffee,
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
  Spa: "استراحة",
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

export const categoryLabels: Record<TravelCategory | "Tous", string> = {
  Tous: "الكل",
  Plage: "اقتصادي",
  Aventure: "منظم",
  Culture: "عمرة",
  Luxe: "مميز",
};

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  Nouvelle: "جديدة",
  "En etude": "قيد الدراسة",
  Confirmee: "مؤكدة",
  Annulee: "ملغاة",
};

export const passengerTypeLabels: Record<PassengerType, string> = {
  adult: "بالغ",
  child: "طفل",
};

export const seedTeamGroups: TeamGroup[] = [
  { id: "general-director", title: "المدير العام للمجموعة", members: ["حمدي نبيل"] },
  {
    id: "branch-directors",
    title: "مدراء الفروع",
    members: [
      "شلغوم عبد القادر - قصر البخاري",
      "حماني محمد - الرغاية",
      "العمري كمال - البرواقية",
      "رضا قنان - خميس الخشنة",
      "عبد الحميد قسول - العطاف",
      "عبد الحميد تعوينات - بجاية",
    ],
  },
  {
    id: "subcontracted-agencies",
    title: "مدراء الوكالات المناولة",
    members: [
      "امين فريحة - فريحة",
      "كمال قرمي - البراق",
      "عجاج عبد العزيز - عجاج",
      "على لحمر جمال - صفانا",
      "عماد الدين أكليل - أمجد",
    ],
  },
  {
    id: "umrah-guides",
    title: "مرشد حج وعمرة",
    members: [
      "كمال رايب",
      "مهدي عجرود",
      "حامي إبراهيم",
      "بويعلة إبراهيم",
      "ناصر صغير",
      "تجني إبراهيم",
      "دحون حمزة",
      "طاهر هني",
      "رعاد نوفل",
      "ضيف شرف",
      "عيسى التير",
      "مصعب هني",
      "العربي شلف",
      "خليفة حسين",
      "عبد العزيز حيدة",
      "محند غدو الطيب",
      "بوشملة عبد الله",
    ],
  },
  {
    id: "sales-marketing",
    title: "موظف تسويق ومبيعات",
    members: ["عيسى العمري", "ايوب أحمد ناصر", "حسام الدين شلغوم", "حسين لعور"],
  },
  {
    id: "guide-nurse",
    title: "مرشد وممرض",
    members: ["عبد المالك بوقادة", "قنان عز الدين", "خالد عايس", "بن عيشة محمد"],
  },
  {
    id: "religious-guide-imam",
    title: "مرشد ديني وإمام",
    members: ["المحفوظ بن صدقة", "السعيد دباح"],
  },
  { id: "catering-manager", title: "مشرف إعاشة وإطعام", members: ["عمر درموش"] },
  { id: "umrah-system-manager", title: "مشرف سيستم عمرة", members: ["بن سرحان مروان"] },
  { id: "airport-installation-manager", title: "مشرف مطار وتركيب", members: ["محروق محي الدين"] },
  { id: "assistant-guide", title: "مساعد مرشد", members: ["سمير التير", "عبد القادر سياح"] },
  { id: "intern", title: "متربص بالمعهد والوكالة", members: ["بركي زكرياء"] },
  { id: "tourism-supervisor", title: "مشرف عام للسياحة", members: ["عبد المحيد عمير"] },
];

export function getTeamGroups() {
  return readStore<TeamGroup[]>("hv-team-groups", seedTeamGroups);
}

export function saveTeamGroups(nextGroups: TeamGroup[]) {
  writeStore("hv-team-groups", nextGroups);
}

export const seedTravels: Travel[] = [
  {
    id: "omra-juin",
    name: "عمرة شهر يونيو",
    destination: "مكة المكرمة",
    country: "السعودية",
    image: "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400",
    images: [
      "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400",
      "https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    banner: "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1920",
    date: "2026-06-01",
    duration: "30 يوم",
    price: 185000,
    childPrice: 145000,
    description: "برنامج كامل من 1 إلى 30 يونيو يشمل الإقامة قرب الحرم، النقل، والمتابعة اليومية.",
    longDescription: "رحلة عمرة متكاملة مصممة لتمنح المسافرين تجربة واضحة ومريحة من لحظة التسجيل حتى العودة. يشمل البرنامج فندقا مختارا، استقبال المطار، تنقلات ميدانية، متابعة إدارية، ومرافقة من فريق الوكالة.",
    guides: ["كمال رايب", "مهدي عجرود", "حامي إبراهيم"],
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
    images: [
      "https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1400",
      "https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    banner: "https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1920",
    date: "2026-07-01",
    duration: "30 يوم",
    price: 189000,
    childPrice: 149000,
    description: "رحلة منظمة من 1 إلى 30 يوليو مع مرشدين مرافقين وخدمة متابعة للحجاج والمعتمرين.",
    longDescription: "هذا البرنامج مناسب للمعتمرين الذين يريدون رحلة ثابتة ومهيكلة مع عدد مقاعد مدروس. تتكفل الوكالة بالمتابعة قبل السفر وبعد الوصول مع فريق مرشدين معروفين داخل المجموعة.",
    guides: ["ناصر صغير", "تجني إبراهيم", "دحون حمزة"],
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
    images: [
      "https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1400",
      "https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    banner: "https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1920",
    date: "2026-08-01",
    duration: "30 يوم",
    price: 192000,
    childPrice: 152000,
    description: "إقامة مريحة من 1 إلى 30 أغسطس، تنقلات جماعية، ومرافقة إدارية طوال الرحلة.",
    longDescription: "برنامج أغسطس موجه لمن يريد مستوى راحة أعلى داخل الرحلة مع تنظيم محكم وخدمات مريحة للعائلات. جميع التفاصيل الأساسية واضحة من البداية داخل صفحة الحجز.",
    guides: ["طاهر هني", "رعاد نوفل", "عيسى التير"],
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
    images: [
      "https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1400",
      "https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    banner: "https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1920",
    date: "2026-09-01",
    duration: "30 يوم",
    price: 179000,
    childPrice: 139000,
    description: "برنامج اقتصادي من 1 إلى 30 سبتمبر مع خدمات أساسية منظمة وقريبة من احتياجات العائلات.",
    longDescription: "رحلة اقتصادية منظمة بعناية مع الحفاظ على العناصر الأساسية التي يحتاجها المسافر. مناسبة لمن يريد سعرا مضبوطا مع متابعة جدية من الوكالة.",
    guides: ["مصعب هني", "العربي شلف", "خليفة حسين"],
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
    images: [
      "https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1400",
      "https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    banner: "https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1920",
    date: "2026-10-01",
    duration: "30 يوم",
    price: 187000,
    childPrice: 147000,
    description: "رحلة من 1 إلى 30 أكتوبر تجمع بين التنظيم الهادئ والإرشاد الديني والمتابعة اليومية.",
    longDescription: "صيغ هذا البرنامج ليعطي توازنا جيدا بين السعر والخدمات والهدوء في التنظيم. يظهر في صفحة الحجز كل ما يحتاجه الموظف لتجهيز ملف العميل بطريقة مرتبة.",
    guides: ["عبد العزيز حيدة", "محند غدو الطيب", "بوشملة عبد الله"],
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
    images: [
      "https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1400",
      "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400",
    ],
    banner: "https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1920",
    date: "2026-11-01",
    duration: "30 يوم",
    price: 194000,
    childPrice: 154000,
    description: "برنامج مميز من 1 إلى 30 نوفمبر مع فنادق مختارة وخدمة إرشاد ومرافقة كاملة.",
    longDescription: "برنامج نوفمبر يقدم مستوى أعلى من الراحة والخدمة مع مساحات أوسع لتنظيم الطلبات الكبيرة والملفات العائلية، ويظهر كل شيء بوضوح داخل طلب الحجز.",
    guides: ["عبد المالك بوقادة", "قنان عز الدين", "خالد عايس"],
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

export function getTravels() {
  return readStore<Travel[]>("hv-travels", seedTravels);
}

export function saveTravels(nextTravels: Travel[]) {
  writeStore("hv-travels", nextTravels);
}

export function getReservations() {
  return readStore<Reservation[]>("hv-reservations", []);
}

export function saveReservations(nextReservations: Reservation[]) {
  writeStore("hv-reservations", nextReservations);
}

export function getContactMessages() {
  return readStore<ContactMessage[]>("hv-contact-messages", []);
}

export function saveContactMessages(nextMessages: ContactMessage[]) {
  writeStore("hv-contact-messages", nextMessages);
}

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
