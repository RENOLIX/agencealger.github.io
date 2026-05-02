import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Mail, Plus, ReceiptText, Save, Search, ShieldCheck, Trash2, Users, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth";
import AdminTopbar from "./_components/AdminTopbar";
import {
  benefitIcons,
  benefitLabels,
  benefitOptions,
  categoryLabels,
  deleteTravelFromSupabase,
  getContactMessages,
  getReservations,
  getTeamGroups,
  getTravels,
  getUsers,
  markContactMessageAsReadInSupabase,
  passengerTypeLabels,
  replaceTeamGroupsInSupabase,
  reservationStatusLabels,
  saveContactMessages,
  saveTeamGroups,
  saveTravelToSupabase,
  saveTravels,
  saveUsers,
  syncContactMessagesFromSupabase,
  syncReservationsFromSupabase,
  syncTeamGroupsFromSupabase,
  syncTravelsFromSupabase,
  type BenefitKey,
  type ContactMessage,
  type Reservation,
  type TeamGroup,
  type Travel,
  type TravelHotel,
  type User,
} from "../lib/data";

type AdminTab = "reservations" | "voyages" | "team" | "messages" | "users";

type TravelFormState = {
  name: string;
  destination: string;
  country: string;
  image: string;
  images: string[];
  date: string;
  departures: string[];
  duration: string;
  price: number;
  hasChildPrice: boolean;
  childPrice: number;
  hasBabyPrice: boolean;
  babyPrice: number;
  description: string;
  longDescription: string;
  guides: string[];
  hotels: TravelHotel[];
  flightMode: "direct" | "escale";
  airlines: Array<"Air Algerie" | "MS" | "TK">;
  category: Travel["category"];
  benefits: BenefitKey[];
  ticketsTotal: number;
};

const emptyTravelForm: TravelFormState = {
  name: "",
  destination: "مكة المكرمة",
  country: "السعودية",
  image: "",
  images: [],
  date: "",
  departures: [""],
  duration: "30 يوم",
  price: 185000,
  hasChildPrice: true,
  childPrice: 145000,
  hasBabyPrice: false,
  babyPrice: 0,
  description: "",
  longDescription: "",
  guides: [],
  hotels: [],
  flightMode: "direct",
  airlines: ["Air Algerie"],
  category: "Culture",
  benefits: ["Vol", "Hotel", "Repas", "Guide", "Transfert"],
  ticketsTotal: 20,
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("reservations");
  const [travels, setTravels] = useState<Travel[]>(() => getTravels());
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations());
  const [messages, setMessages] = useState<ContactMessage[]>(() => getContactMessages());
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>(() => getTeamGroups());
  const [adminUsers, setAdminUsers] = useState<User[]>(() => getUsers());
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "employee" as User["role"] });
  const [travelForm, setTravelForm] = useState<TravelFormState>(emptyTravelForm);
  const [travelMode, setTravelMode] = useState<"list" | "form">("list");
  const [editingTravelId, setEditingTravelId] = useState<string | null>(null);
  const [teamRoleForm, setTeamRoleForm] = useState("");
  const [teamMemberDrafts, setTeamMemberDrafts] = useState<Record<string, string>>({});
  const [reservationQuery, setReservationQuery] = useState("");
  const [guideQuery, setGuideQuery] = useState("");

  useEffect(() => {
    void syncTravelsFromSupabase().then(setTravels).catch(() => undefined);
    void syncReservationsFromSupabase().then(setReservations).catch(() => undefined);
    void syncContactMessagesFromSupabase().then(setMessages).catch(() => undefined);
    void syncTeamGroupsFromSupabase().then(setTeamGroups).catch(() => undefined);
  }, []);

  const isAdmin = user?.role === "admin";

  const reservationScope = useMemo(() => (
    user?.role === "admin"
      ? reservations
      : reservations.filter((reservation) => reservation.employeeId === user?.id)
  ), [reservations, user]);

  const filteredReservations = useMemo(() => {
    const needle = reservationQuery.trim().toLowerCase();
    if (!needle) return reservationScope;
    return reservationScope.filter((reservation) => (
      [
        reservation.travelName,
        reservation.customerFirstName,
        reservation.customerLastName,
        reservation.customerPhone,
        reservation.employeeName,
      ].some((value) => value.toLowerCase().includes(needle))
    ));
  }, [reservationQuery, reservationScope]);

  const guideOptions = useMemo(() => (
    Array.from(new Set(
      teamGroups
        .filter((group) => group.title.includes("مرشد"))
        .flatMap((group) => group.members),
    )).sort((a, b) => a.localeCompare(b, "ar"))
  ), [teamGroups]);

  const filteredGuideOptions = useMemo(() => {
    const needle = guideQuery.trim().toLowerCase();
    if (!needle) return guideOptions;
    return guideOptions.filter((guide) => guide.toLowerCase().includes(needle));
  }, [guideOptions, guideQuery]);

  const totalPending = reservations.filter((reservation) => reservation.status === "Nouvelle" || reservation.status === "En etude").length;
  const confirmedRevenue = reservations
    .filter((reservation) => reservation.status === "Confirmee")
    .reduce((sum, reservation) => sum + reservation.total, 0);
  const employeeApproved = reservationScope.filter((reservation) => reservation.status === "Confirmee").length;
  const employeePending = reservationScope.filter((reservation) => reservation.status === "Nouvelle" || reservation.status === "En etude").length;
  const allTeamNames = Array.from(new Set(teamGroups.flatMap((group) => group.members))).sort((a, b) => a.localeCompare(b, "ar"));

  function persistTravels(nextTravels: Travel[]) {
    setTravels(nextTravels);
    saveTravels(nextTravels);
  }

  function persistMessages(nextMessages: ContactMessage[]) {
    setMessages(nextMessages);
    saveContactMessages(nextMessages);
  }

  function persistUsers(nextUsers: User[]) {
    setAdminUsers(nextUsers);
    saveUsers(nextUsers);
  }

  function persistTeamGroups(nextGroups: TeamGroup[]) {
    setTeamGroups(nextGroups);
    saveTeamGroups(nextGroups);
  }

  async function persistTeamGroupsWithSync(nextGroups: TeamGroup[]) {
    persistTeamGroups(nextGroups);
    try {
      setTeamGroups(await replaceTeamGroupsInSupabase(nextGroups));
    } catch (error) {
      console.error(error);
    }
  }

  function resetTravelEditor() {
    setEditingTravelId(null);
    setTravelForm(emptyTravelForm);
    setGuideQuery("");
    setTravelMode("list");
  }

  function createUser(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = userForm.email.trim().toLowerCase();
    if (!cleanEmail || adminUsers.some((item) => item.email === cleanEmail)) return;
    const initials = userForm.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "HV";
    persistUsers([
      ...adminUsers,
      {
        id: crypto.randomUUID(),
        name: userForm.name.trim(),
        email: cleanEmail,
        password: userForm.password,
        role: userForm.role,
        avatar: initials,
      },
    ]);
    setUserForm({ name: "", email: "", password: "", role: "employee" });
  }

  function openNewTravel() {
    setEditingTravelId(null);
    setTravelForm(emptyTravelForm);
    setGuideQuery("");
    setTravelMode("form");
  }

  function openEditTravel(travel: Travel) {
    setEditingTravelId(travel.id);
    setTravelForm({
      name: travel.name,
      destination: travel.destination,
      country: travel.country,
      image: travel.image,
      images: travel.images,
      date: travel.date,
      departures: travel.departures?.length ? travel.departures : [travel.date],
      duration: travel.duration,
      price: travel.price,
      hasChildPrice: travel.hasChildPrice ?? travel.childPrice != null,
      childPrice: travel.childPrice ?? 0,
      hasBabyPrice: travel.hasBabyPrice ?? travel.babyPrice != null,
      babyPrice: travel.babyPrice ?? 0,
      description: travel.description,
      longDescription: travel.longDescription,
      guides: travel.guides,
      hotels: travel.hotels ?? [],
      flightMode: travel.flightMode ?? "direct",
      airlines: travel.airlines ?? ["Air Algerie"],
      category: travel.category,
      benefits: travel.benefits,
      ticketsTotal: travel.ticketsTotal,
    });
    setGuideQuery("");
    setTravelMode("form");
  }

  async function readImageFiles(files: FileList | null) {
    if (!files?.length) return [];
    return Promise.all(Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
      reader.readAsDataURL(file);
    })));
  }

  async function uploadTravelImages(files: FileList | null) {
    const imageData = await readImageFiles(files);
    if (imageData.length === 0) return;
    setTravelForm((current) => {
      const nextImages = [...current.images, ...imageData];
      return { ...current, images: nextImages, image: nextImages[0] ?? current.image };
    });
  }

  function removeTravelImage(index: number) {
    setTravelForm((current) => {
      const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...current, images: nextImages, image: nextImages[0] ?? "" };
    });
  }

  function addDeparture() {
    setTravelForm((current) => ({ ...current, departures: [...current.departures, ""] }));
  }

  function updateDeparture(index: number, value: string) {
    setTravelForm((current) => {
      const nextDepartures = current.departures.map((departure, departureIndex) => departureIndex === index ? value : departure);
      return { ...current, departures: nextDepartures, date: nextDepartures[0] ?? "" };
    });
  }

  function removeDeparture(index: number) {
    setTravelForm((current) => {
      const nextDepartures = current.departures.filter((_, departureIndex) => departureIndex !== index);
      return { ...current, departures: nextDepartures.length ? nextDepartures : [""], date: nextDepartures[0] ?? "" };
    });
  }

  function addHotel() {
    setTravelForm((current) => ({
      ...current,
      hotels: [...current.hotels, { id: crypto.randomUUID(), name: "", photos: [] }],
    }));
  }

  function updateHotelName(hotelId: string, name: string) {
    setTravelForm((current) => ({
      ...current,
      hotels: current.hotels.map((hotel) => hotel.id === hotelId ? { ...hotel, name } : hotel),
    }));
  }

  async function uploadHotelImages(hotelId: string, files: FileList | null) {
    const images = await readImageFiles(files);
    if (images.length === 0) return;
    setTravelForm((current) => ({
      ...current,
      hotels: current.hotels.map((hotel) => hotel.id === hotelId ? { ...hotel, photos: [...hotel.photos, ...images] } : hotel),
    }));
  }

  function removeHotelImage(hotelId: string, photoIndex: number) {
    setTravelForm((current) => ({
      ...current,
      hotels: current.hotels.map((hotel) => (
        hotel.id === hotelId
          ? { ...hotel, photos: hotel.photos.filter((_, index) => index !== photoIndex) }
          : hotel
      )),
    }));
  }

  function removeHotel(hotelId: string) {
    setTravelForm((current) => ({
      ...current,
      hotels: current.hotels.filter((hotel) => hotel.id !== hotelId),
    }));
  }

  function toggleGuide(guide: string, checked: boolean) {
    setTravelForm((current) => ({
      ...current,
      guides: checked
        ? Array.from(new Set([...current.guides, guide]))
        : current.guides.filter((item) => item !== guide),
    }));
  }

  function toggleAirline(airline: "Air Algerie" | "MS" | "TK", checked: boolean) {
    setTravelForm((current) => ({
      ...current,
      airlines: checked
        ? Array.from(new Set([...current.airlines, airline])) as TravelFormState["airlines"]
        : current.airlines.filter((item) => item !== airline) as TravelFormState["airlines"],
    }));
  }

  async function saveTravel(event: FormEvent) {
    event.preventDefault();

    const departures = Array.from(new Set(travelForm.departures.map((departure) => departure.trim()).filter(Boolean))).sort();
    if (departures.length === 0) return;

    const images = travelForm.images.length > 0
      ? travelForm.images
      : ["https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400"];

    const total = Number(travelForm.ticketsTotal);
    const hotels = travelForm.hotels
      .map((hotel) => ({ ...hotel, name: hotel.name.trim(), photos: hotel.photos.filter(Boolean) }))
      .filter((hotel) => hotel.name);
    const airlines: TravelFormState["airlines"] = travelForm.airlines.length > 0 ? travelForm.airlines : ["Air Algerie"];

    const baseTravel: Travel = {
      id: editingTravelId ?? crypto.randomUUID(),
      name: travelForm.name.trim(),
      destination: travelForm.destination.trim(),
      country: travelForm.country.trim(),
      image: images[0],
      images,
      banner: images[0],
      date: departures[0],
      departures,
      duration: travelForm.duration.trim(),
      price: Number(travelForm.price),
      hasChildPrice: travelForm.hasChildPrice,
      childPrice: travelForm.hasChildPrice ? Number(travelForm.childPrice) : null,
      hasBabyPrice: travelForm.hasBabyPrice,
      babyPrice: travelForm.hasBabyPrice ? Number(travelForm.babyPrice) : null,
      description: travelForm.description.trim(),
      longDescription: travelForm.longDescription.trim(),
      guides: travelForm.guides,
      hotels,
      flightMode: travelForm.flightMode,
      airlines,
      category: travelForm.category,
      benefits: travelForm.benefits,
      ticketsTotal: total,
      ticketsLeft: total,
      rating: travels.find((travel) => travel.id === editingTravelId)?.rating ?? 4.8,
    };

    if (editingTravelId) {
      const confirmedSeats = reservations
        .filter((reservation) => reservation.travelId === editingTravelId && reservation.status === "Confirmee")
        .reduce((sum, reservation) => sum + reservation.quantity, 0);
      baseTravel.ticketsLeft = Math.max(0, total - confirmedSeats);
    }

    const optimisticTravels = editingTravelId
      ? travels.map((travel) => travel.id === editingTravelId ? baseTravel : travel)
      : [baseTravel, ...travels];

    persistTravels(optimisticTravels);
    try {
      setTravels(await saveTravelToSupabase(baseTravel));
    } catch (error) {
      console.error(error);
    }

    resetTravelEditor();
  }

  async function deleteTravel(travelId: string) {
    if (!window.confirm("حذف هذه الرحلة؟")) return;
    persistTravels(travels.filter((travel) => travel.id !== travelId));
    try {
      setTravels(await deleteTravelFromSupabase(travelId));
    } catch (error) {
      console.error(error);
    }
  }

  function createTeamRole(event: FormEvent) {
    event.preventDefault();
    const title = teamRoleForm.trim();
    if (!title) return;
    void persistTeamGroupsWithSync([{ id: crypto.randomUUID(), title, members: [] }, ...teamGroups]);
    setTeamRoleForm("");
  }

  function addMemberToGroup(groupId: string) {
    const name = teamMemberDrafts[groupId]?.trim();
    if (!name) return;
    void persistTeamGroupsWithSync(teamGroups.map((group) => (
      group.id === groupId && !group.members.includes(name)
        ? { ...group, members: [...group.members, name] }
        : group
    )));
    setTeamMemberDrafts((current) => ({ ...current, [groupId]: "" }));
  }

  function removeMemberFromGroup(groupId: string, memberName: string) {
    void persistTeamGroupsWithSync(teamGroups.map((group) => (
      group.id === groupId
        ? { ...group, members: group.members.filter((member) => member !== memberName) }
        : group
    )));
  }

  function deleteTeamGroup(groupId: string) {
    if (!window.confirm("حذف هذا المنصب؟")) return;
    void persistTeamGroupsWithSync(teamGroups.filter((group) => group.id !== groupId));
  }

  if (!user) return null;

  return (
    <main className="admin-shell admin-shell-modern">
      <section className="admin-main admin-main-modern">
        <AdminTopbar
          user={user}
          items={[
            { key: "reservations", label: "سجل الحجوزات", active: tab === "reservations", onClick: () => setTab("reservations") },
            { key: "voyages", label: "الرحلات", active: tab === "voyages", onClick: () => setTab("voyages"), visible: isAdmin },
            { key: "team", label: "الطاقم", active: tab === "team", onClick: () => setTab("team"), visible: isAdmin },
            { key: "messages", label: "الرسائل", active: tab === "messages", onClick: () => setTab("messages"), visible: isAdmin },
            { key: "users", label: "الحسابات", active: tab === "users", onClick: () => setTab("users"), visible: isAdmin },
          ]}
          onCreateReservation={() => navigate("/admin/reservations/new")}
          onOpenApprovals={isAdmin ? () => navigate("/admin/approvals") : undefined}
          onLogout={logout}
        />

        <header className="admin-top admin-top-modern">
          <div>
            <span className="label">لوحة الوكالة</span>
            <h1>
              {tab === "reservations" ? "متابعة سجل الحجوزات" :
                tab === "voyages" ? "إدارة الرحلات" :
                  tab === "team" ? "إدارة الطاقم" :
                    tab === "messages" ? "رسائل العملاء" : "الحسابات"}
            </h1>
          </div>
        </header>

        <div className="metric-grid">
          <article><span>{isAdmin ? "طلبات جديدة" : "حجوزاتي الجديدة"}</span><strong>{isAdmin ? totalPending : employeePending}</strong></article>
          <article><span>{isAdmin ? "إيراد مؤكد" : "الحجوزات الموافق عليها"}</span><strong>{isAdmin ? `${confirmedRevenue.toLocaleString("fr-FR")} دج` : employeeApproved}</strong></article>
          <article><span>أماكن متاحة</span><strong>{travels.reduce((sum, travel) => sum + travel.ticketsLeft, 0)}</strong></article>
          <article><span>{isAdmin ? "أعضاء الطاقم" : "إجمالي حجوزاتي"}</span><strong>{isAdmin ? teamGroups.reduce((sum, group) => sum + group.members.length, 0) : reservationScope.length}</strong></article>
        </div>

        {tab === "reservations" && (
          <div className="reservation-admin-shell">
            <div className="reservation-admin-toolbar">
              <div className="reservation-admin-search">
                <Search size={18} />
                <input value={reservationQuery} onChange={(event) => setReservationQuery(event.target.value)} placeholder="ابحث باسم العميل أو الرحلة أو الموظف" />
              </div>
              <button type="button" className="create-reservation-button" onClick={() => navigate("/admin/reservations/new")}>
                <Plus size={16} /> إنشاء حجز جديد
              </button>
            </div>

            <div className="reservation-admin-list">
              {filteredReservations.length === 0 ? (
                <article className="admin-card">
                  <h2>لا توجد حجوزات</h2>
                  <p>كل ملفات الحجز الخاصة بهذا الحساب ستظهر هنا.</p>
                </article>
              ) : filteredReservations.map((reservation) => (
                <article key={reservation.id} className="admin-card reservation-request-card">
                  <div className="reservation-request-top">
                    <div>
                      <span className={`status-pill status-${reservation.status.replace(/\s+/g, "-").toLowerCase()}`}>{reservationStatusLabels[reservation.status]}</span>
                      <h2>{reservation.travelName}</h2>
                      <p>{reservation.customerFirstName} {reservation.customerLastName} - {reservation.customerPhone}</p>
                    </div>
                    <div className="history-side">
                      <strong>{reservationStatusLabels[reservation.status]}</strong>
                      {isAdmin && (reservation.status === "Nouvelle" || reservation.status === "En etude") && (
                        <button type="button" className="secondary-button" onClick={() => navigate("/admin/approvals")}>
                          فتح صفحة الموافقة
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="reservation-request-metrics">
                    <div><small>الموظف</small><strong>{reservation.employeeName}</strong></div>
                    <div><small>المقاعد</small><strong>{reservation.quantity}</strong></div>
                    <div><small>الإجمالي</small><strong>{reservation.total.toLocaleString("fr-FR")} دج</strong></div>
                    <div><small>المرفقات</small><strong>{reservation.attachments.length}</strong></div>
                  </div>

                  <div className="reservation-request-grid">
                    <div>
                      <h3>بيانات صاحب الطلب</h3>
                      <p><strong>الاسم:</strong> {reservation.customerFirstName} {reservation.customerLastName}</p>
                      <p><strong>العنوان:</strong> {reservation.customerAddress}</p>
                      <p><strong>الهاتف:</strong> {reservation.customerPhone}</p>
                      <p><strong>تاريخ الطلب:</strong> {new Date(reservation.createdAt).toLocaleString("fr-FR")}</p>
                      {reservation.notes && <p><strong>ملاحظة:</strong> {reservation.notes}</p>}
                    </div>
                    <div>
                      <h3>المسافرون</h3>
                      <div className="reservation-passenger-list">
                        {reservation.passengers.map((passenger) => (
                          <div key={passenger.id} className="reservation-passenger-item">
                            <strong>{passenger.firstName} {passenger.lastName}</strong>
                            <small>{passengerTypeLabels[passenger.type]} - {passenger.passportNumber}</small>
                            <small>{passenger.birthPlace} - {passenger.birthDate}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {reservation.attachments.length > 0 && (
                    <div className="reservation-request-files">
                      <h3>الوثائق المرفوعة</h3>
                      <div className="attachment-list">
                        {reservation.attachments.map((attachment) => (
                          <a key={attachment.id} href={attachment.dataUrl} target="_blank" rel="noreferrer" className="attachment-item">
                            <span>{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {isAdmin && tab === "voyages" && (
          travelMode === "form" ? (
            <form className="admin-card form-grid travel-editor travel-editor-modern" onSubmit={saveTravel}>
              <div className="editor-head">
                <h2>{editingTravelId ? "تعديل الرحلة" : "إضافة رحلة"}</h2>
                <button type="button" className="secondary-button" onClick={resetTravelEditor}>رجوع</button>
              </div>

              <div className="form-two">
                <label>اسم الرحلة<input required value={travelForm.name} onChange={(event) => setTravelForm({ ...travelForm, name: event.target.value })} /></label>
                <label>الوجهة<input required value={travelForm.destination} onChange={(event) => setTravelForm({ ...travelForm, destination: event.target.value })} /></label>
                <label>البلد<input required value={travelForm.country} onChange={(event) => setTravelForm({ ...travelForm, country: event.target.value })} /></label>
                <label>المدة<input required value={travelForm.duration} onChange={(event) => setTravelForm({ ...travelForm, duration: event.target.value })} /></label>
                <label>الفئة<select value={travelForm.category} onChange={(event) => setTravelForm({ ...travelForm, category: event.target.value as Travel["category"] })}>
                  {Object.entries(categoryLabels).filter(([key]) => key !== "Tous").map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select></label>
                <label>عدد المقاعد<input required type="number" min={1} value={travelForm.ticketsTotal} onChange={(event) => setTravelForm({ ...travelForm, ticketsTotal: Number(event.target.value) })} /></label>
              </div>

              <div className="departure-block">
                <div className="editor-subhead">
                  <div>
                    <strong>مواعيد الانطلاق</strong>
                    <span>يمكنك إضافة أكثر من انطلاق داخل نفس الشهر.</span>
                  </div>
                  <button type="button" className="secondary-button" onClick={addDeparture}><Plus size={15} /> إضافة موعد</button>
                </div>
                <div className="departure-list">
                  {travelForm.departures.map((departure, index) => (
                    <div key={`departure-${index}`} className="departure-row">
                      <input required type="date" value={departure} onChange={(event) => updateDeparture(index, event.target.value)} />
                      <button type="button" className="danger-icon" onClick={() => removeDeparture(index)} disabled={travelForm.departures.length === 1}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="guide-picker-shell">
                <div className="guide-picker-head">
                  <div>
                    <strong>الرحلة الجوية</strong>
                    <span>حدد إن كانت الرحلة مباشرة أو مع توقف، ثم اختر شركة أو أكثر.</span>
                  </div>
                </div>
                <div className="pricing-grid">
                  <label>نوع الرحلة الجوية
                    <select value={travelForm.flightMode} onChange={(event) => setTravelForm({ ...travelForm, flightMode: event.target.value as TravelFormState["flightMode"] })}>
                      <option value="direct">Vol direct</option>
                      <option value="escale">Avec escale</option>
                    </select>
                  </label>
                  <div className="guide-picker-grid flight-picker-grid">
                    {(["Air Algerie", "MS", "TK"] as const).map((airline) => (
                      <label key={airline} className="guide-option">
                        <span>{airline}</span>
                        <input type="checkbox" checked={travelForm.airlines.includes(airline)} onChange={(event) => toggleAirline(airline, event.target.checked)} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pricing-grid">
                <label>سعر البالغ (ADT)<input required type="number" min={1} value={travelForm.price} onChange={(event) => setTravelForm({ ...travelForm, price: Number(event.target.value) })} /></label>
                <div className="price-optional">
                  <label className="checkbox-row"><input type="checkbox" checked={travelForm.hasChildPrice} onChange={(event) => setTravelForm({ ...travelForm, hasChildPrice: event.target.checked })} /> تفعيل سعر الطفل (CLD)</label>
                  {travelForm.hasChildPrice && <input type="number" min={0} value={travelForm.childPrice} onChange={(event) => setTravelForm({ ...travelForm, childPrice: Number(event.target.value) })} />}
                </div>
                <div className="price-optional">
                  <label className="checkbox-row"><input type="checkbox" checked={travelForm.hasBabyPrice} onChange={(event) => setTravelForm({ ...travelForm, hasBabyPrice: event.target.checked })} /> تفعيل سعر الرضيع (INF)</label>
                  {travelForm.hasBabyPrice && <input type="number" min={0} value={travelForm.babyPrice} onChange={(event) => setTravelForm({ ...travelForm, babyPrice: Number(event.target.value) })} />}
                </div>
              </div>

              <label>وصف مختصر<textarea required value={travelForm.description} onChange={(event) => setTravelForm({ ...travelForm, description: event.target.value })} /></label>
              <label>وصف كامل<textarea required value={travelForm.longDescription} onChange={(event) => setTravelForm({ ...travelForm, longDescription: event.target.value })} /></label>

              <div className="guide-picker-shell">
                <div className="guide-picker-head">
                  <div>
                    <strong>المرشدون</strong>
                    <span>ابحث ثم اختر المرشدين الذين تريد إسنادهم إلى الرحلة.</span>
                  </div>
                  <div className="team-search-box">
                    <Search size={16} />
                    <input value={guideQuery} onChange={(event) => setGuideQuery(event.target.value)} placeholder="ابحث عن مرشد" />
                  </div>
                </div>
                <div className="guide-picker-grid">
                  {filteredGuideOptions.map((guide) => (
                    <label key={guide} className="guide-option">
                      <span>{guide}</span>
                      <input type="checkbox" checked={travelForm.guides.includes(guide)} onChange={(event) => toggleGuide(guide, event.target.checked)} />
                    </label>
                  ))}
                </div>
                {travelForm.guides.length > 0 && (
                  <div className="selected-guides-row">
                    {travelForm.guides.map((guide) => <span key={guide}>{guide}</span>)}
                  </div>
                )}
              </div>

              <div className="hotel-block">
                <div className="editor-subhead">
                  <div>
                    <strong>الفنادق</strong>
                    <span>أضف فندقا أو أكثر مع صور مباشرة من الهاتف أو الحاسوب.</span>
                  </div>
                  <button type="button" className="secondary-button" onClick={addHotel}><Plus size={15} /> إضافة فندق</button>
                </div>
                <div className="hotel-editor-list">
                  {travelForm.hotels.length === 0 && <p className="hint-text">لا يوجد فندق مضاف بعد.</p>}
                  {travelForm.hotels.map((hotel) => (
                    <article key={hotel.id} className="hotel-editor-card">
                      <div className="hotel-editor-head">
                        <input value={hotel.name} onChange={(event) => updateHotelName(hotel.id, event.target.value)} placeholder="اسم الفندق" />
                        <button type="button" className="danger-icon" onClick={() => removeHotel(hotel.id)}><Trash2 size={15} /></button>
                      </div>
                      <label className="upload-zone compact">
                        <input type="file" accept="image/*" multiple onChange={(event) => void uploadHotelImages(hotel.id, event.target.files)} />
                        <strong>رفع صور الفندق</strong>
                        <span>إضافة صورة أو عدة صور.</span>
                      </label>
                      {hotel.photos.length > 0 && (
                        <div className="uploaded-images hotel-photos">
                          {hotel.photos.map((photo, index) => (
                            <div key={`${hotel.id}-${index}`}>
                              <img src={photo} alt={hotel.name || `hotel-${index + 1}`} />
                              <button type="button" onClick={() => removeHotelImage(hotel.id, index)}><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>

              <label className="upload-zone">
                <input type="file" accept="image/*" multiple onChange={(event) => void uploadTravelImages(event.target.files)} />
                <strong>صور الرحلة</strong>
                <span>رفع صور البطاقة والمعرض والصفحة الداخلية.</span>
              </label>

              {travelForm.images.length > 0 && (
                <div className="uploaded-images">
                  {travelForm.images.map((image, index) => (
                    <div key={`${image.slice(0, 16)}-${index}`}>
                      <img src={image} alt={`travel ${index + 1}`} />
                      <button type="button" onClick={() => removeTravelImage(index)}><Trash2 size={14} /></button>
                      {index === 0 && <small>الصورة الرئيسية</small>}
                    </div>
                  ))}
                </div>
              )}

              <div className="benefit-picker">
                {benefitOptions.map((benefit) => {
                  const Icon = benefitIcons[benefit];
                  return (
                    <label key={benefit}>
                      <span><Icon size={16} /> {benefitLabels[benefit]}</span>
                      <input
                        type="checkbox"
                        checked={travelForm.benefits.includes(benefit)}
                        onChange={(event) => setTravelForm({
                          ...travelForm,
                          benefits: event.target.checked
                            ? Array.from(new Set([...travelForm.benefits, benefit]))
                            : travelForm.benefits.filter((value) => value !== benefit),
                        })}
                      />
                    </label>
                  );
                })}
              </div>

              <button><Save size={16} /> {editingTravelId ? "حفظ التعديلات" : "إضافة الرحلة"}</button>
            </form>
          ) : (
            <div className="travel-admin-list">
              <div className="list-toolbar">
                <div><h2>كتالوج الرحلات</h2><p>{travels.length} رحلة متاحة حاليا</p></div>
                <button onClick={openNewTravel}><Plus size={16} /> إضافة رحلة</button>
              </div>
              <div className="travel-management-grid">
                {travels.map((travel) => (
                  <article key={travel.id} className="travel-manage-card">
                    <div className="travel-photo-stack">
                      {travel.images.slice(0, 3).map((image, index) => <img key={`${travel.id}-${index}`} src={image} alt={travel.name} />)}
                    </div>
                    <div>
                      <span>{categoryLabels[travel.category]} - {travel.departures?.length ?? 1} موعد</span>
                      <h3>{travel.name}</h3>
                      <p>{travel.destination} - {travel.country}</p>
                      <p>المرشدون: {travel.guides.join(" - ")}</p>
                      <strong>{travel.price.toLocaleString("fr-FR")} دج</strong>
                      <small>{travel.ticketsLeft}/{travel.ticketsTotal} مكان متاح</small>
                    </div>
                    <footer>
                      <button onClick={() => openEditTravel(travel)}><Edit3 size={15} /> تعديل</button>
                      <button className="danger" onClick={() => void deleteTravel(travel.id)}><Trash2 size={15} /> حذف</button>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          )
        )}

        {isAdmin && tab === "team" && (
          <div className="team-admin-layout">
            <form className="admin-card form-grid" onSubmit={createTeamRole}>
              <h2>إضافة منصب جديد</h2>
              <label>اسم المنصب<input required value={teamRoleForm} onChange={(event) => setTeamRoleForm(event.target.value)} placeholder="مثال: مشرف إعاشة وإطعام" /></label>
              <button><Plus size={16} /> إضافة المنصب</button>
            </form>

            <div className="team-admin-grid">
              {teamGroups.map((group) => (
                <article key={group.id} className="admin-card team-admin-card">
                  <div className="team-admin-head">
                    <div>
                      <h2>{group.title}</h2>
                      <small>{group.members.length} اسم</small>
                    </div>
                    <button className="danger-icon" type="button" onClick={() => deleteTeamGroup(group.id)} title="حذف المنصب">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="team-admin-input">
                    <div className="team-search-box">
                      <Search size={16} />
                      <input
                        list={`team-${group.id}`}
                        value={teamMemberDrafts[group.id] ?? ""}
                        onChange={(event) => setTeamMemberDrafts((current) => ({ ...current, [group.id]: event.target.value }))}
                        placeholder={`أضف اسما إلى ${group.title}`}
                      />
                      <datalist id={`team-${group.id}`}>
                        {allTeamNames.map((name) => <option key={`${group.id}-${name}`} value={name} />)}
                      </datalist>
                    </div>
                    <button type="button" onClick={() => addMemberToGroup(group.id)}><Plus size={15} /> إضافة</button>
                  </div>
                  <div className="team-admin-members">
                    {group.members.map((member) => (
                      <div key={`${group.id}-${member}`} className="team-admin-member">
                        <span>{member}</span>
                        <button type="button" onClick={() => removeMemberFromGroup(group.id, member)}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {isAdmin && tab === "messages" && (
          <div className="message-list">
            {messages.length === 0 ? (
              <article className="admin-card"><h2>لا توجد رسائل</h2><p>الرسائل القادمة من صفحة الاتصال ستظهر هنا.</p></article>
            ) : messages.map((message) => (
              <article key={message.id} className="message-card">
                <div className="message-head">
                  <div>
                    <strong>{message.fullName}</strong>
                    <span>{message.email} - {message.phone}</span>
                  </div>
                  <button onClick={() => {
                    const nextMessages = messages.map((item) => item.id === message.id ? { ...item, status: "Lu" as const } : item);
                    persistMessages(nextMessages);
                    void markContactMessageAsReadInSupabase(message.id).then(setMessages).catch((error) => console.error(error));
                  }}>
                    {message.status === "Lu" ? "مقروء" : "جديد"}
                  </button>
                </div>
                <p>{message.message}</p>
                <footer><span>{message.destination || "بدون وجهة محددة"}</span><span>{new Date(message.createdAt).toLocaleString("fr-FR")}</span></footer>
              </article>
            ))}
          </div>
        )}

        {isAdmin && tab === "users" && (
          <div className="admin-grid">
            <form className="admin-card form-grid" onSubmit={createUser}>
              <h2>إضافة مستخدم</h2>
              <label>الاسم الكامل<input required value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} /></label>
              <label>Email<input required type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} /></label>
              <label>كلمة المرور<input required value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} /></label>
              <label>الدور<select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as User["role"] })}><option value="employee">موظف</option><option value="admin">مدير</option></select></label>
              <button><Plus size={16} /> إضافة</button>
            </form>
            <div className="admin-card user-list">
              <h2>الحسابات</h2>
              {adminUsers.map((account) => (
                <article key={account.id}>
                  <span>{account.avatar}</span>
                  <div><strong>{account.name}</strong><small>{account.email} - {account.role === "admin" ? "مدير" : "موظف"}</small></div>
                  <button
                    disabled={account.id === user.id}
                    onClick={() => persistUsers(adminUsers.filter((item) => item.id !== account.id))}
                    title={account.id === user.id ? "لا يمكن حذف الحساب المتصل" : "حذف"}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
