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
import { hasSupabaseConfig, supabase } from "./supabase";

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

export type TravelHotel = {
  id: string;
  name: string;
  photos: string[];
};

export type FlightMode = "direct" | "escale";
export type AirlineCode =
  | "Air Algerie"
  | "SV"
  | "MS"
  | "TK"
  | "Flynas"
  | "Jordanian airline"
  | "Qatar Airlines"
  | "Pegasus"
  | "Ajet"
  | "Tunisia Airlines"
  | "Tassili airlines";
export type RoomType = "single" | "double" | "triple" | "quad" | "quint" | "sext";

export type TravelRoomPrices = Record<RoomType, number>;

export type ReservationRoom = {
  id: string;
  type: RoomType;
  capacity: number;
  price: number;
};

export const roomTypeLabels: Record<RoomType, string> = {
  single: "غرفة أحادية",
  double: "غرفة ثنائية",
  triple: "غرفة ثلاثية",
  quad: "غرفة رباعية",
  quint: "غرفة خماسية",
  sext: "غرفة سداسية",
};

export const roomCapacities: Record<RoomType, number> = {
  single: 1,
  double: 2,
  triple: 3,
  quad: 4,
  quint: 5,
  sext: 6,
};

export const defaultRoomPrices: TravelRoomPrices = {
  single: 0,
  double: 0,
  triple: 0,
  quad: 0,
  quint: 0,
  sext: 0,
};

export type Travel = {
  id: string;
  name: string;
  destination: string;
  exitCity?: string;
  country: string;
  image: string;
  images: string[];
  date: string;
  departures?: string[];
  duration: string;
  price: number;
  commission?: number | null;
  roomPrices?: TravelRoomPrices;
  childPrice?: number | null;
  babyPrice?: number | null;
  hasChildPrice?: boolean;
  hasBabyPrice?: boolean;
  description: string;
  longDescription: string;
  banner: string;
  guides: string[];
  hotels?: TravelHotel[];
  flightMode?: FlightMode;
  airlines?: AirlineCode[];
  category: TravelCategory;
  benefits: BenefitKey[];
  ticketsTotal: number;
  ticketsLeft: number;
  rating: number;
};

export type ReservationStatus = "Nouvelle" | "En etude" | "Confirmee" | "Annulee";
export type PassengerType = "adult" | "child" | "baby";
export type PassengerSex = "male" | "female";

export type ReservationAttachment = {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  storagePath?: string;
};

export type ReservationPassenger = {
  id: string;
  type: PassengerType;
  sex: PassengerSex;
  firstName: string;
  lastName: string;
  firstNameLatin: string;
  lastNameLatin: string;
  phone: string;
  address: string;
  fatherName: string;
  grandfatherName: string;
  profession: string;
  birthPlace: string;
  birthDate: string;
  passportNumber: string;
  passportIssueDate: string;
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
  babies?: number;
  quantity: number;
  rooms?: ReservationRoom[];
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
  { id: "seller-bouraq", name: "وكالة البراق", email: "elbouraqtravel@gmail.com", password: "Hamdi2026!01", role: "employee", avatar: "بر" },
  { id: "seller-fariha", name: "وكالة فريحة", email: "agencefareha@gmail.com", password: "Hamdi2026!02", role: "employee", avatar: "فر" },
  { id: "seller-barouaguia", name: "فرع حمدي البراواقية", email: "voyage26.02hamdi@gmail.com", password: "Hamdi2026!03", role: "employee", avatar: "بر" },
  { id: "seller-kasr", name: "فرع قصر البخاري", email: "Voyage26hamdi@gmail.com", password: "Hamdi2026!04", role: "employee", avatar: "قب" },
  { id: "seller-mahieddine", name: "محي الدين محروق", email: "voyage.hamdi35.1@gmail.com", password: "Hamdi2026!05", role: "employee", avatar: "مح" },
  { id: "seller-bejaia", name: "فرع حمدي بجاية", email: "Hamdivoyagebejaia06@gmail.com", password: "Hamdi2026!06", role: "employee", avatar: "بج" },
  { id: "seller-reghaia", name: "فرع الرغاية -الجزائر-", email: "voyage16hamdi@gmail.com", password: "Hamdi2026!07", role: "employee", avatar: "رغ" },
];

function mergeUsersWithSeeds(users: User[]) {
  const byEmail = new globalThis.Map<string, User>();

  for (const user of users) {
    byEmail.set(user.email.trim().toLowerCase(), user);
  }

  for (const seedUser of seedUsers) {
    const email = seedUser.email.trim().toLowerCase();
    if (!byEmail.has(email)) {
      byEmail.set(email, seedUser);
    }
  }

  return Array.from(byEmail.values());
}

export function getUsers() {
  const storedUsers = readStore<User[]>("hv-users", []);
  if (hasSupabaseConfig) return storedUsers;
  const mergedUsers = mergeUsersWithSeeds(storedUsers);
  if (mergedUsers.length !== storedUsers.length) writeStore("hv-users", mergedUsers);
  return mergedUsers;
}

export function saveUsers(nextUsers: User[]) {
  writeStore("hv-users", nextUsers);
}

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string | null;
  created_at: string;
};

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email.trim().toLowerCase(),
    password: row.password,
    role: row.role,
    avatar: row.avatar || row.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "HV",
  };
}

function mapUserToRow(user: User) {
  return {
    id: user.id,
    full_name: user.name.trim(),
    email: user.email.trim().toLowerCase(),
    password: user.password,
    role: user.role,
    avatar: user.avatar,
  };
}

export async function syncUsersFromSupabase() {
  if (!hasSupabaseConfig) return getUsers();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, password, role, avatar, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const users = (data as UserRow[]).map(mapUserRow);
  saveUsers(users);
  return users;
}

export async function createUserInSupabase(user: User) {
  if (!hasSupabaseConfig) {
    const nextUsers = [...getUsers(), user];
    saveUsers(nextUsers);
    return nextUsers;
  }

  const { error } = await supabase.from("profiles").insert(mapUserToRow(user));
  if (error) throw error;
  return syncUsersFromSupabase();
}

export async function deleteUserFromSupabase(userId: string) {
  if (!hasSupabaseConfig) {
    const nextUsers = getUsers().filter((user) => user.id !== userId);
    saveUsers(nextUsers);
    return nextUsers;
  }

  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error) throw error;
  return syncUsersFromSupabase();
}

export function formatReservationDisplayNumber(value: number) {
  return String(Math.max(1, value)).padStart(5, "0");
}

export function buildReservationNumberMap(reservations: Reservation[]) {
  return new globalThis.Map(
    [...reservations]
      .sort((left, right) => (
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ))
      .map((reservation, index) => [reservation.id, formatReservationDisplayNumber(index + 1)]),
  );
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

const benefitOptionSet = new Set<string>(benefitOptions);
const travelCategorySet = new Set<TravelCategory>(["Plage", "Aventure", "Culture", "Luxe"]);

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
  baby: "رضيع",
};

const ARABIC_MONTHS = [
  "جانفي",
  "فيفري",
  "مارس",
  "افريل",
  "ماي",
  "جوان",
  "جويلية",
  "اوت",
  "سبتمبر",
  "اكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function getArabicMonthName(monthIndex: number) {
  return ARABIC_MONTHS[monthIndex] ?? "";
}

export function formatArabicDate(dateValue: string) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return `${date.getDate()} ${getArabicMonthName(date.getMonth())} ${date.getFullYear()}`;
}

export function formatArabicMonthRange(dateValue: string, duration = "30 يوم") {
  if (!dateValue) return duration;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return `${dateValue} - ${duration}`;
  const durationLabel = duration.includes("30") ? "30" : duration;
  return `${date.getDate()} - ${durationLabel} ${getArabicMonthName(date.getMonth())}`;
}

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
  return readStore<Travel[]>("hv-travels", seedTravels).map(normalizeTravel);
}

export function saveTravels(nextTravels: Travel[]) {
  writeStore("hv-travels", nextTravels.map(normalizeTravel));
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

const RESERVATION_BUCKET = "reservation-documents";

type TravelRow = {
  id: string;
  name: string;
  destination: string;
  exit_city?: string | null;
  country: string;
  image_url: string;
  image_urls: string[] | null;
  banner_url: string;
  departure_date: string;
  departures: string[] | null;
  duration: string;
  adult_price: number | string;
  commission: number | string | null;
  room_prices?: TravelRoomPrices | null;
  child_price: number | string | null;
  baby_price: number | string | null;
  has_child_price: boolean | null;
  has_baby_price: boolean | null;
  short_description: string;
  long_description: string;
  guides: string[] | null;
  hotels: TravelHotel[] | null;
  flight_mode: FlightMode | null;
  airlines: AirlineCode[] | null;
  category: TravelCategory;
  benefits: string[] | null;
  tickets_total: number;
  tickets_left: number;
  rating: number | string;
};

type TeamGroupRow = {
  id: string;
  title: string;
  display_order: number;
};

type TeamMemberRow = {
  id: string;
  team_group_id: string;
  full_name: string;
  display_order: number;
};

type ContactMessageRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  destination: string | null;
  message: string;
  status: "Nouveau" | "Lu";
  created_at: string;
};

type ReservationRequestRow = {
  id: string;
  travel_id: string;
  employee_id: string | null;
  employee_name: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_address: string;
  customer_phone: string;
  adults_count: number;
  children_count: number;
  babies_count?: number | null;
  quantity: number;
  total_amount: number | string;
  notes: string | null;
  status: ReservationStatus;
  created_at: string;
};

type ReservationPassengerRow = {
  id: string;
  reservation_id: string;
  passenger_type: PassengerType;
  first_name: string;
  last_name: string;
  phone: string;
  birth_place: string;
  birth_date: string;
  passport_number: string;
  passport_expiry: string;
  notes: string | null;
};

function serializePassengerNotes(passenger: ReservationPassenger) {
  return JSON.stringify({
    notes: passenger.notes || "",
    sex: passenger.sex || "male",
    address: passenger.address || "",
    fatherName: passenger.fatherName || "",
    grandfatherName: passenger.grandfatherName || "",
    firstNameLatin: passenger.firstNameLatin || "",
    lastNameLatin: passenger.lastNameLatin || "",
    profession: passenger.profession || "",
    passportIssueDate: passenger.passportIssueDate || "",
  });
}

function parsePassengerNotes(raw: string | null) {
  if (!raw) return {
    notes: "",
    sex: "male" as PassengerSex,
    address: "",
    fatherName: "",
    grandfatherName: "",
    firstNameLatin: "",
    lastNameLatin: "",
    profession: "",
    passportIssueDate: "",
  };
  try {
    const parsed = JSON.parse(raw) as Partial<ReservationPassenger>;
    return {
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      sex: (parsed.sex === "female" ? "female" : "male") as PassengerSex,
      address: typeof parsed.address === "string" ? parsed.address : "",
      fatherName: typeof parsed.fatherName === "string" ? parsed.fatherName : "",
      grandfatherName: typeof parsed.grandfatherName === "string" ? parsed.grandfatherName : "",
      firstNameLatin: typeof parsed.firstNameLatin === "string" ? parsed.firstNameLatin : "",
      lastNameLatin: typeof parsed.lastNameLatin === "string" ? parsed.lastNameLatin : "",
      profession: typeof parsed.profession === "string" ? parsed.profession : "",
      passportIssueDate: typeof parsed.passportIssueDate === "string" ? parsed.passportIssueDate : "",
    };
  } catch {
    return {
      notes: raw,
      sex: "male" as PassengerSex,
      address: "",
      fatherName: "",
      grandfatherName: "",
      firstNameLatin: "",
      lastNameLatin: "",
      profession: "",
      passportIssueDate: "",
    };
  }
}

function serializeReservationNotes(reservation: Reservation) {
  return JSON.stringify({
    notes: reservation.notes || "",
    babies: Number(reservation.babies ?? 0),
    rooms: reservation.rooms ?? [],
  });
}

function parseReservationNotes(raw: string | null) {
  if (!raw) return { notes: "", babies: 0, rooms: [] as ReservationRoom[] };
  try {
    const parsed = JSON.parse(raw) as { notes?: unknown; babies?: unknown; rooms?: unknown };
    return {
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      babies: typeof parsed.babies === "number" ? parsed.babies : 0,
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms.filter((room): room is ReservationRoom => (
        Boolean(room) &&
        typeof room === "object" &&
        "type" in room &&
        "capacity" in room
      )) : [],
    };
  } catch {
    return { notes: raw, babies: 0, rooms: [] as ReservationRoom[] };
  }
}

function isUuidLike(value: string | null | undefined) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeTextList(value: unknown) {
  const sanitize = (items: string[]) => Array.from(new Set(
    items
      .map((item) => item.trim())
      .filter(Boolean),
  ));

  if (Array.isArray(value)) {
    return sanitize(value.filter((item): item is string => typeof item === "string"));
  }

  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return sanitize(parsed.filter((item): item is string => typeof item === "string"));
    }
  } catch {
    // Fallback to PostgreSQL/text parsing below.
  }

  if (raw.startsWith("{") && raw.endsWith("}")) {
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return sanitize(
      inner
        .split(",")
        .map((item) => item.trim().replace(/^"+|"+$/g, "")),
    );
  }

  return sanitize(raw.split(","));
}

type ReservationAttachmentRow = {
  id: string;
  reservation_id: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  public_url: string | null;
};

function normalizeTravel(travel: Travel): Travel {
  const image = travel.image || travel.banner || travel.images?.[0] || "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400";
  const images = Array.isArray(travel.images) && travel.images.length > 0 ? travel.images.filter(Boolean) : [image];
  const departures = Array.isArray(travel.departures) && travel.departures.length > 0
    ? Array.from(new Set(travel.departures.filter(Boolean))).sort()
    : [travel.date || new Date().toISOString().slice(0, 10)];
  const hasChildPrice = travel.hasChildPrice ?? travel.childPrice != null;
  const hasBabyPrice = travel.hasBabyPrice ?? travel.babyPrice != null;
  const roomPrices = { ...defaultRoomPrices, ...(travel.roomPrices ?? {}) };
  const destination = travel.destination === "مكة المكرمة"
    ? "جدة"
    : travel.destination === "المدينة"
      ? "المدينة المنورة"
      : (travel.destination || "جدة");

  return {
    ...travel,
    destination,
    exitCity: travel.exitCity || "جدة",
    image,
    images,
    banner: travel.banner || images[0] || image,
    date: departures[0] || travel.date || new Date().toISOString().slice(0, 10),
    departures,
    roomPrices,
    price: Number(roomPrices.quint || travel.price || 0),
    commission: Number(travel.commission ?? 0),
    childPrice: hasChildPrice ? Number(travel.childPrice ?? 0) : null,
    babyPrice: hasBabyPrice ? Number(travel.babyPrice ?? 0) : null,
    hasChildPrice,
    hasBabyPrice,
    hotels: Array.isArray(travel.hotels)
      ? travel.hotels.map((hotel) => ({
        id: hotel.id || crypto.randomUUID(),
        name: hotel.name,
        photos: Array.isArray(hotel.photos) ? hotel.photos.filter(Boolean) : [],
      }))
      : [],
    guides: normalizeTextList(travel.guides),
    flightMode: travel.flightMode ?? "direct",
    airlines: Array.isArray(travel.airlines) && travel.airlines.length > 0 ? travel.airlines : ["Air Algerie"],
  };
}

function mapTravelRow(row: TravelRow, fallbackTravel?: Travel): Travel {
  const image = row.image_url || "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400";
  const images = Array.isArray(row.image_urls) && row.image_urls.length > 0
    ? row.image_urls.filter(Boolean)
    : [image];
  const rowGuides = normalizeTextList(row.guides);
  const fallbackGuides = normalizeTextList(fallbackTravel?.guides ?? []);
  const guides = rowGuides.length > 0 ? rowGuides : fallbackGuides;
  const benefits = Array.isArray(row.benefits)
    ? row.benefits.filter((benefit): benefit is BenefitKey => benefitOptionSet.has(benefit))
    : [];
  const category = travelCategorySet.has(row.category) ? row.category : "Culture";

  return normalizeTravel({
    id: row.id,
    name: row.name || "رحلة عمرة",
    destination: row.destination || "مكة المكرمة",
    exitCity: row.exit_city || "جدة",
    country: row.country || "السعودية",
    image,
    images,
    banner: row.banner_url || image,
    date: row.departure_date || new Date().toISOString().slice(0, 10),
    departures: Array.isArray(row.departures) && row.departures.length > 0 ? row.departures.filter(Boolean) : [row.departure_date || new Date().toISOString().slice(0, 10)],
    duration: row.duration || "30 يوم",
    price: Number(row.adult_price ?? 0),
    commission: Number(row.commission ?? 0),
    roomPrices: row.room_prices ?? {
      ...defaultRoomPrices,
      quint: Number(row.adult_price ?? 0),
    },
    childPrice: row.child_price == null ? null : Number(row.child_price),
    babyPrice: row.baby_price == null ? null : Number(row.baby_price),
    hasChildPrice: row.has_child_price ?? row.child_price != null,
    hasBabyPrice: row.has_baby_price ?? row.baby_price != null,
    description: row.short_description || "برنامج عمرة منظم.",
    longDescription: row.long_description || row.short_description || "برنامج عمرة منظم مع متابعة كاملة.",
    guides,
    hotels: Array.isArray(row.hotels) ? row.hotels : [],
    flightMode: row.flight_mode ?? "direct",
    airlines: Array.isArray(row.airlines) ? row.airlines : ["Air Algerie"],
    category,
    benefits,
    ticketsTotal: Number(row.tickets_total ?? 0),
    ticketsLeft: Number(row.tickets_left ?? 0),
    rating: Number(row.rating ?? 4.8),
  });
}

function mapTravelToRow(travel: Travel) {
  const normalized = normalizeTravel(travel);
  return {
    id: normalized.id,
    name: normalized.name,
    destination: normalized.destination,
    exit_city: normalized.exitCity ?? "جدة",
    country: normalized.country,
    image_url: normalized.image,
    image_urls: normalized.images,
    banner_url: normalized.banner,
    departure_date: normalized.date,
    departures: normalized.departures,
    duration: normalized.duration,
    adult_price: normalized.price,
    commission: Number(normalized.commission ?? 0),
    room_prices: normalized.roomPrices ?? defaultRoomPrices,
    child_price: normalized.hasChildPrice ? normalized.childPrice : null,
    baby_price: normalized.hasBabyPrice ? normalized.babyPrice : null,
    has_child_price: normalized.hasChildPrice,
    has_baby_price: normalized.hasBabyPrice,
    short_description: normalized.description,
    long_description: normalized.longDescription,
    guides: normalizeTextList(normalized.guides),
    hotels: normalized.hotels ?? [],
    flight_mode: normalized.flightMode ?? "direct",
    airlines: normalized.airlines ?? ["Air Algerie"],
    category: normalized.category,
    benefits: normalized.benefits,
    tickets_total: normalized.ticketsTotal,
    tickets_left: normalized.ticketsLeft,
    rating: normalized.rating,
    active: true,
  };
}

function mapContactMessageRow(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    destination: row.destination ?? "",
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapTeamRows(groupRows: TeamGroupRow[], memberRows: TeamMemberRow[]): TeamGroup[] {
  return groupRows
    .sort((a, b) => a.display_order - b.display_order)
    .map((group) => ({
      id: group.id,
      title: group.title,
      members: memberRows
        .filter((member) => member.team_group_id === group.id)
        .sort((a, b) => a.display_order - b.display_order)
        .map((member) => member.full_name),
    }));
}

function mapReservationRows(
  requestRows: ReservationRequestRow[],
  passengerRows: ReservationPassengerRow[],
  attachmentRows: ReservationAttachmentRow[],
  travels: Travel[],
): Reservation[] {
  const travelNames = new globalThis.Map(travels.map((travel) => [travel.id, travel.name]));

  return requestRows.map((row) => {
    const reservationMeta = parseReservationNotes(row.notes);
    return {
    id: row.id,
    travelId: row.travel_id,
    travelName: travelNames.get(row.travel_id) ?? "رحلة",
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    customerFirstName: row.customer_first_name,
    customerLastName: row.customer_last_name,
    customerAddress: row.customer_address,
    customerPhone: row.customer_phone,
    adults: row.adults_count,
    children: row.children_count,
    babies: Number(row.babies_count ?? reservationMeta.babies ?? 0),
    quantity: row.quantity,
    rooms: reservationMeta.rooms,
    total: Number(row.total_amount),
    passengers: passengerRows
      .filter((passenger) => passenger.reservation_id === row.id)
      .map((passenger) => {
        const meta = parsePassengerNotes(passenger.notes);
        return {
          id: passenger.id,
          type: passenger.passenger_type,
          sex: meta.sex,
          firstName: passenger.first_name,
          lastName: passenger.last_name,
          firstNameLatin: meta.firstNameLatin,
          lastNameLatin: meta.lastNameLatin,
          phone: passenger.phone,
          address: meta.address,
          fatherName: meta.fatherName,
          grandfatherName: meta.grandfatherName,
          profession: meta.profession,
          birthPlace: passenger.birth_place,
          birthDate: passenger.birth_date,
          passportNumber: passenger.passport_number,
          passportIssueDate: meta.passportIssueDate,
          passportExpiry: passenger.passport_expiry,
          notes: meta.notes,
        };
      }),
    attachments: attachmentRows
      .filter((attachment) => attachment.reservation_id === row.id)
      .map((attachment) => ({
        id: attachment.id,
        name: attachment.file_name,
        mimeType: attachment.mime_type,
        dataUrl: attachment.public_url ?? attachment.storage_path,
        storagePath: attachment.storage_path,
      })),
    notes: reservationMeta.notes,
    status: row.status,
    createdAt: row.created_at,
  };
  });
}

async function uploadReservationAttachment(reservationId: string, attachment: ReservationAttachment) {
  const response = await fetch(attachment.dataUrl);
  const blob = await response.blob();
  const extension = attachment.name.includes(".") ? "" : attachment.mimeType === "application/pdf" ? ".pdf" : "";
  const path = `reservations/${reservationId}/${attachment.id}-${attachment.name.replace(/[^\w.-]+/g, "-")}${extension}`;
  const { error: uploadError } = await supabase.storage.from(RESERVATION_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: attachment.mimeType,
  });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(RESERVATION_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function syncTravelsFromSupabase() {
  if (!hasSupabaseConfig) return getTravels();
  const localTravels = getTravels();
  const localTravelMap = new globalThis.Map(localTravels.map((travel) => [travel.id, travel]));

  const { data, error } = await supabase
    .from("travels")
    .select("*")
    .eq("active", true)
    .order("departure_date", { ascending: true });

  if (error) throw error;

  const travels = (data as TravelRow[]).map((row) => mapTravelRow(row, localTravelMap.get(row.id)));
  saveTravels(travels);
  return travels;
}

export async function saveTravelToSupabase(travel: Travel) {
  if (!hasSupabaseConfig) {
    const nextTravels = [travel, ...getTravels().filter((item) => item.id !== travel.id)];
    saveTravels(nextTravels);
    return nextTravels;
  }

  const { error } = await supabase.from("travels").upsert(mapTravelToRow(travel), { onConflict: "id" });
  if (error) throw error;
  return syncTravelsFromSupabase();
}

export async function deleteTravelFromSupabase(travelId: string) {
  if (!hasSupabaseConfig) {
    const nextTravels = getTravels().filter((travel) => travel.id !== travelId);
    saveTravels(nextTravels);
    return nextTravels;
  }

  const { error } = await supabase.from("travels").delete().eq("id", travelId);
  if (error) throw error;
  return syncTravelsFromSupabase();
}

export async function syncTeamGroupsFromSupabase() {
  if (!hasSupabaseConfig) return getTeamGroups();

  const [{ data: groupsData, error: groupsError }, { data: membersData, error: membersError }] = await Promise.all([
    supabase.from("team_groups").select("id, title, display_order").order("display_order", { ascending: true }),
    supabase.from("team_members").select("id, team_group_id, full_name, display_order").order("display_order", { ascending: true }),
  ]);

  if (groupsError) throw groupsError;
  if (membersError) throw membersError;

  const teamGroups = mapTeamRows(groupsData as TeamGroupRow[], membersData as TeamMemberRow[]);
  saveTeamGroups(teamGroups);
  return teamGroups;
}

export async function replaceTeamGroupsInSupabase(groups: TeamGroup[]) {
  if (!hasSupabaseConfig) {
    saveTeamGroups(groups);
    return groups;
  }

  const { error: deleteMembersError } = await supabase.from("team_members").delete().gte("display_order", 0);
  if (deleteMembersError) throw deleteMembersError;

  const { error: deleteGroupsError } = await supabase.from("team_groups").delete().gte("display_order", 0);
  if (deleteGroupsError) throw deleteGroupsError;

  const groupRows = groups.map((group, index) => ({
    id: group.id,
    title: group.title,
    display_order: index + 1,
  }));

  if (groupRows.length > 0) {
    const { error: insertGroupsError } = await supabase.from("team_groups").insert(groupRows);
    if (insertGroupsError) throw insertGroupsError;
  }

  const memberRows = groups.flatMap((group) => group.members.map((member, index) => ({
    team_group_id: group.id,
    full_name: member,
    display_order: index + 1,
  })));

  if (memberRows.length > 0) {
    const { error: insertMembersError } = await supabase.from("team_members").insert(memberRows);
    if (insertMembersError) throw insertMembersError;
  }

  return syncTeamGroupsFromSupabase();
}

export async function syncContactMessagesFromSupabase() {
  if (!hasSupabaseConfig) return getContactMessages();

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, full_name, phone, email, destination, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const messages = (data as ContactMessageRow[]).map(mapContactMessageRow);
  saveContactMessages(messages);
  return messages;
}

export async function createContactMessageInSupabase(message: ContactMessage) {
  const fallback = () => {
    const nextMessages = [message, ...getContactMessages()];
    saveContactMessages(nextMessages);
    return nextMessages;
  };

  if (!hasSupabaseConfig) return fallback();

  try {
    const { error } = await supabase.from("contact_messages").insert({
      id: message.id,
      full_name: message.fullName,
      phone: message.phone,
      email: message.email,
      destination: message.destination || null,
      message: message.message,
      status: message.status,
      created_at: message.createdAt,
    });

    if (error) throw error;
    return await syncContactMessagesFromSupabase();
  } catch {
    return fallback();
  }
}

export async function markContactMessageAsReadInSupabase(messageId: string) {
  if (!hasSupabaseConfig) {
    const nextMessages = getContactMessages().map((message) => message.id === messageId ? { ...message, status: "Lu" as const } : message);
    saveContactMessages(nextMessages);
    return nextMessages;
  }

  const { error } = await supabase.from("contact_messages").update({ status: "Lu" }).eq("id", messageId);
  if (error) throw error;
  return syncContactMessagesFromSupabase();
}

export async function syncReservationsFromSupabase() {
  if (!hasSupabaseConfig) return getReservations();

  const { data: reservationData, error: reservationError } = await supabase
    .from("reservation_requests")
    .select("id, travel_id, employee_id, employee_name, customer_first_name, customer_last_name, customer_address, customer_phone, adults_count, children_count, babies_count, quantity, total_amount, notes, status, created_at")
    .order("created_at", { ascending: false });

  if (reservationError) throw reservationError;

  const reservations = reservationData as ReservationRequestRow[];
  const reservationIds = reservations.map((reservation) => reservation.id);
  const travelIds = Array.from(new Set(reservations.map((reservation) => reservation.travel_id)));

  const [passengerResult, attachmentResult, travelResult] = await Promise.all([
    reservationIds.length > 0
      ? supabase.from("reservation_passengers").select("id, reservation_id, passenger_type, first_name, last_name, phone, birth_place, birth_date, passport_number, passport_expiry, notes").in("reservation_id", reservationIds)
      : Promise.resolve({ data: [], error: null }),
    reservationIds.length > 0
      ? supabase.from("reservation_attachments").select("id, reservation_id, file_name, mime_type, storage_path, public_url").in("reservation_id", reservationIds)
      : Promise.resolve({ data: [], error: null }),
    travelIds.length > 0
    ? supabase.from("travels").select("id, name, destination, exit_city, country, image_url, image_urls, banner_url, departure_date, departures, duration, adult_price, commission, child_price, baby_price, has_child_price, has_baby_price, short_description, long_description, guides, hotels, flight_mode, airlines, category, benefits, tickets_total, tickets_left, rating").in("id", travelIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (passengerResult.error) throw passengerResult.error;
  if (attachmentResult.error) throw attachmentResult.error;
  if (travelResult.error) throw travelResult.error;

  const mappedReservations = mapReservationRows(
    reservations,
    passengerResult.data as ReservationPassengerRow[],
    attachmentResult.data as ReservationAttachmentRow[],
    (travelResult.data as TravelRow[]).map((row) => mapTravelRow(row)),
  );

  saveReservations(mappedReservations);
  return mappedReservations;
}

export async function createReservationInSupabase(reservation: Reservation) {
  const fallback = () => {
    const nextReservations = [reservation, ...getReservations()];
    saveReservations(nextReservations);
    return nextReservations;
  };

  if (!hasSupabaseConfig) return fallback();

  try {
    const employeeId = isUuidLike(reservation.employeeId) ? reservation.employeeId : null;
    const { error: reservationError } = await supabase.from("reservation_requests").insert({
      id: reservation.id,
      travel_id: reservation.travelId,
      employee_id: employeeId,
      employee_name: reservation.employeeName,
      customer_first_name: reservation.customerFirstName,
      customer_last_name: reservation.customerLastName,
      customer_address: reservation.customerAddress,
      customer_phone: reservation.customerPhone,
      adults_count: reservation.adults,
      children_count: reservation.children,
      babies_count: Number(reservation.babies ?? 0),
      quantity: reservation.quantity,
      total_amount: reservation.total,
      notes: serializeReservationNotes(reservation),
      status: reservation.status,
      created_at: reservation.createdAt,
    });

    if (reservationError) throw reservationError;

    if (reservation.passengers.length > 0) {
      const { error: passengersError } = await supabase.from("reservation_passengers").insert(
        reservation.passengers.map((passenger) => ({
          id: passenger.id,
          reservation_id: reservation.id,
          passenger_type: passenger.type,
          first_name: passenger.firstName,
          last_name: passenger.lastName,
          phone: passenger.phone,
          birth_place: passenger.birthPlace,
          birth_date: passenger.birthDate,
          passport_number: passenger.passportNumber,
          passport_expiry: passenger.passportExpiry,
          notes: serializePassengerNotes(passenger),
        })),
      );

      if (passengersError) throw passengersError;
    }

    if (reservation.attachments.length > 0) {
      const uploaded = await Promise.all(reservation.attachments.map((attachment) => uploadReservationAttachment(reservation.id, attachment)));
      const { error: attachmentsError } = await supabase.from("reservation_attachments").insert(
        reservation.attachments.map((attachment, index) => ({
          id: attachment.id,
          reservation_id: reservation.id,
          file_name: attachment.name,
          mime_type: attachment.mimeType,
          storage_path: uploaded[index].path,
          public_url: uploaded[index].publicUrl,
        })),
      );

      if (attachmentsError) throw attachmentsError;
    }

    return await syncReservationsFromSupabase();
  } catch {
    return fallback();
  }
}

export async function updateReservationInSupabase(reservation: Reservation) {
  const fallback = () => {
    const nextReservations = [reservation, ...getReservations().filter((item) => item.id !== reservation.id)];
    saveReservations(nextReservations);
    return nextReservations;
  };

  if (!hasSupabaseConfig) return fallback();

  try {
    const employeeId = isUuidLike(reservation.employeeId) ? reservation.employeeId : null;
    const { error: reservationError } = await supabase.from("reservation_requests").update({
      travel_id: reservation.travelId,
      employee_id: employeeId,
      employee_name: reservation.employeeName,
      customer_first_name: reservation.customerFirstName,
      customer_last_name: reservation.customerLastName,
      customer_address: reservation.customerAddress,
      customer_phone: reservation.customerPhone,
      adults_count: reservation.adults,
      children_count: reservation.children,
      babies_count: Number(reservation.babies ?? 0),
      quantity: reservation.quantity,
      total_amount: reservation.total,
      notes: serializeReservationNotes(reservation),
      status: reservation.status,
    }).eq("id", reservation.id);

    if (reservationError) throw reservationError;

    const { error: deletePassengersError } = await supabase.from("reservation_passengers").delete().eq("reservation_id", reservation.id);
    if (deletePassengersError) throw deletePassengersError;

    const { error: deleteAttachmentsError } = await supabase.from("reservation_attachments").delete().eq("reservation_id", reservation.id);
    if (deleteAttachmentsError) throw deleteAttachmentsError;

    if (reservation.passengers.length > 0) {
      const { error: passengersError } = await supabase.from("reservation_passengers").insert(
        reservation.passengers.map((passenger) => ({
          id: passenger.id,
          reservation_id: reservation.id,
          passenger_type: passenger.type,
          first_name: passenger.firstName,
          last_name: passenger.lastName,
          phone: passenger.phone,
          birth_place: passenger.birthPlace,
          birth_date: passenger.birthDate,
          passport_number: passenger.passportNumber,
          passport_expiry: passenger.passportExpiry,
          notes: serializePassengerNotes(passenger),
        })),
      );

      if (passengersError) throw passengersError;
    }

    if (reservation.attachments.length > 0) {
      const uploaded = await Promise.all(reservation.attachments.map(async (attachment) => {
        if (attachment.dataUrl.startsWith("data:")) return uploadReservationAttachment(reservation.id, attachment);
        return {
          path: attachment.storagePath ?? attachment.dataUrl,
          publicUrl: attachment.dataUrl,
        };
      }));

      const { error: attachmentsError } = await supabase.from("reservation_attachments").insert(
        reservation.attachments.map((attachment, index) => ({
          id: attachment.id,
          reservation_id: reservation.id,
          file_name: attachment.name,
          mime_type: attachment.mimeType,
          storage_path: uploaded[index].path,
          public_url: uploaded[index].publicUrl,
        })),
      );

      if (attachmentsError) throw attachmentsError;
    }

    return await syncReservationsFromSupabase();
  } catch {
    return fallback();
  }
}

export async function updateReservationStatusInSupabase(reservationId: string, status: ReservationStatus) {
  if (!hasSupabaseConfig) {
    const nextReservations = getReservations().map((reservation) => reservation.id === reservationId ? { ...reservation, status } : reservation);
    saveReservations(nextReservations);
    return nextReservations;
  }

  const { error } = await supabase.from("reservation_requests").update({ status }).eq("id", reservationId);
  if (error) throw error;
  return syncReservationsFromSupabase();
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
