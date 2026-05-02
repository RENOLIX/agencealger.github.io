import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, LogOut, Mail, Plus, ReceiptText, Save, Search, ShieldCheck, Trash2, Users, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth";
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
  saveTravelToSupabase,
  saveContactMessages,
  saveTeamGroups,
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
  type User,
} from "../lib/data";

type Tab = "reservations" | "voyages" | "team" | "messages" | "users";

const emptyTravelForm = {
  name: "",
  destination: "مكة المكرمة",
  country: "السعودية",
  image: "",
  images: [] as string[],
  banner: "",
  date: "",
  duration: "30 يوم",
  price: 185000,
  childPrice: 145000,
  description: "",
  longDescription: "",
  guidesText: "",
  category: "Culture" as Travel["category"],
  benefits: ["Vol", "Hotel", "Repas", "Guide", "Transfert"] as BenefitKey[],
  ticketsTotal: 20,
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("reservations");
  const [travels, setTravels] = useState<Travel[]>(() => getTravels());
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations());
  const [messages, setMessages] = useState<ContactMessage[]>(() => getContactMessages());
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>(() => getTeamGroups());
  const [adminUsers, setAdminUsers] = useState<User[]>(() => getUsers());
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "employee" as User["role"] });
  const [travelForm, setTravelForm] = useState(emptyTravelForm);
  const [travelMode, setTravelMode] = useState<"list" | "form">("list");
  const [editingTravelId, setEditingTravelId] = useState<string | null>(null);
  const [teamRoleForm, setTeamRoleForm] = useState("");
  const [teamMemberDrafts, setTeamMemberDrafts] = useState<Record<string, string>>({});
  const [reservationQuery, setReservationQuery] = useState("");

  useEffect(() => {
    void syncTravelsFromSupabase().then(setTravels).catch(() => undefined);
    void syncReservationsFromSupabase().then(setReservations).catch(() => undefined);
    void syncContactMessagesFromSupabase().then(setMessages).catch(() => undefined);
    void syncTeamGroupsFromSupabase().then(setTeamGroups).catch(() => undefined);
  }, []);

  const visibleReservations = useMemo(() => (
    user?.role === "admin"
      ? reservations
      : reservations.filter((reservation) => reservation.employeeId === user?.id)
  ), [reservations, user]);

  const filteredReservations = useMemo(() => {
    const needle = reservationQuery.trim().toLowerCase();
    if (!needle) return visibleReservations;
    return visibleReservations.filter((reservation) => {
      return [
        reservation.travelName,
        reservation.customerFirstName,
        reservation.customerLastName,
        reservation.customerPhone,
        reservation.employeeName,
      ].some((value) => value.toLowerCase().includes(needle));
    });
  }, [reservationQuery, visibleReservations]);

  const totalPending = reservations.filter((reservation) => reservation.status === "Nouvelle" || reservation.status === "En etude").length;
  const confirmedRevenue = reservations
    .filter((reservation) => reservation.status === "Confirmee")
    .reduce((sum, reservation) => sum + reservation.total, 0);

  function persistTravels(next: Travel[]) {
    setTravels(next);
    saveTravels(next);
  }

  function persistMessages(next: ContactMessage[]) {
    setMessages(next);
    saveContactMessages(next);
  }

  function persistUsers(next: User[]) {
    setAdminUsers(next);
    saveUsers(next);
  }

  function persistTeamGroups(next: TeamGroup[]) {
    setTeamGroups(next);
    saveTeamGroups(next);
  }

  async function persistTeamGroupsWithSync(next: TeamGroup[]) {
    persistTeamGroups(next);
    try {
      setTeamGroups(await replaceTeamGroupsInSupabase(next));
    } catch (error) {
      console.error(error);
    }
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
      banner: travel.banner,
      date: travel.date,
      duration: travel.duration,
      price: travel.price,
      childPrice: travel.childPrice,
      description: travel.description,
      longDescription: travel.longDescription,
      guidesText: travel.guides.join("\n"),
      category: travel.category,
      benefits: travel.benefits,
      ticketsTotal: travel.ticketsTotal,
    });
    setTravelMode("form");
  }

  async function uploadTravelImages(files: FileList | null, field: "images" | "banner") {
    if (!files?.length) return;
    const imageData = await Promise.all(Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
      reader.readAsDataURL(file);
    })));

    if (field === "banner") {
      setTravelForm((current) => ({ ...current, banner: imageData[0] ?? current.banner }));
      return;
    }

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

  async function saveTravel(event: FormEvent) {
    event.preventDefault();
    const fallbackImage = travelForm.image || travelForm.banner || "https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400";
    const images = travelForm.images.length ? travelForm.images : [fallbackImage];
    const total = Number(travelForm.ticketsTotal);
    const guides = travelForm.guidesText.split("\n").map((value) => value.trim()).filter(Boolean);

    if (editingTravelId) {
      const currentTravel = travels.find((travel) => travel.id === editingTravelId);
      const confirmedSeats = reservations
        .filter((reservation) => reservation.travelId === editingTravelId && reservation.status === "Confirmee")
        .reduce((sum, reservation) => sum + reservation.quantity, 0);
      const nextTravel: Travel = {
        id: editingTravelId,
        name: travelForm.name,
        destination: travelForm.destination,
        country: travelForm.country,
        image: images[0],
        images,
        banner: travelForm.banner || images[0],
        date: travelForm.date,
        duration: travelForm.duration,
        price: Number(travelForm.price),
        childPrice: Number(travelForm.childPrice),
        description: travelForm.description,
        longDescription: travelForm.longDescription,
        guides,
        category: travelForm.category,
        benefits: travelForm.benefits,
        ticketsTotal: total,
        ticketsLeft: Math.max(0, total - confirmedSeats),
        rating: currentTravel?.rating ?? 4.8,
      };
      persistTravels(travels.map((travel) => travel.id === editingTravelId ? nextTravel : travel));
      try {
        setTravels(await saveTravelToSupabase(nextTravel));
      } catch (error) {
        console.error(error);
      }
    } else {
      const nextTravel: Travel = {
        id: crypto.randomUUID(),
        name: travelForm.name,
        destination: travelForm.destination,
        country: travelForm.country,
        image: images[0],
        images,
        banner: travelForm.banner || images[0],
        date: travelForm.date,
        duration: travelForm.duration,
        price: Number(travelForm.price),
        childPrice: Number(travelForm.childPrice),
        description: travelForm.description,
        longDescription: travelForm.longDescription,
        guides,
        category: travelForm.category,
        benefits: travelForm.benefits,
        ticketsTotal: total,
        ticketsLeft: total,
        rating: 4.8,
      };
      persistTravels([nextTravel, ...travels]);
      try {
        setTravels(await saveTravelToSupabase(nextTravel));
      } catch (error) {
        console.error(error);
      }
    }

    setTravelForm(emptyTravelForm);
    setEditingTravelId(null);
    setTravelMode("list");
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
    void persistTeamGroupsWithSync(teamGroups.map((group) => group.id === groupId && !group.members.includes(name) ? { ...group, members: [...group.members, name] } : group));
    setTeamMemberDrafts((current) => ({ ...current, [groupId]: "" }));
  }

  function removeMemberFromGroup(groupId: string, memberName: string) {
    void persistTeamGroupsWithSync(teamGroups.map((group) => group.id === groupId ? { ...group, members: group.members.filter((member) => member !== memberName) } : group));
  }

  function deleteTeamGroup(groupId: string) {
    if (!window.confirm("حذف هذا المنصب؟")) return;
    void persistTeamGroupsWithSync(teamGroups.filter((group) => group.id !== groupId));
  }

  const allTeamNames = Array.from(new Set(teamGroups.flatMap((group) => group.members))).sort((a, b) => a.localeCompare(b, "ar"));

  return (
    <main className="admin-shell admin-shell-modern">
      <aside className="admin-side admin-side-modern">
        <div className="admin-logo">
          <img src="/agencealger.github.io/logo-normal.png" alt="Hamdi Voyage" />
        </div>
        {user?.role === "admin" && <button onClick={() => navigate("/admin/approvals")}><ShieldCheck /> الحجوزات للموافقة</button>}
        <button className={tab === "reservations" ? "active" : ""} onClick={() => setTab("reservations")}><ReceiptText /> سجل الحجوزات</button>
        <button className={tab === "voyages" ? "active" : ""} onClick={() => setTab("voyages")}><WalletCards /> الرحلات</button>
        <button className={tab === "team" ? "active" : ""} onClick={() => setTab("team")}><Users /> الطاقم</button>
        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}><Mail /> الرسائل</button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}><ShieldCheck /> الحسابات</button>
        <button onClick={logout}><LogOut /> تسجيل الخروج</button>
      </aside>

      <section className="admin-main admin-main-modern">
        <header className="admin-top admin-top-modern">
          <div>
            <span className="label">لوحة الوكالة</span>
            <h1>{tab === "reservations" ? "متابعة سجل الحجوزات" : tab === "voyages" ? "إدارة الرحلات" : tab === "team" ? "إدارة الطاقم" : tab === "messages" ? "رسائل العملاء" : "الحسابات"}</h1>
          </div>
          <div className="profile">
            <span>{user?.avatar}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.role === "admin" ? "مدير" : "موظف"}</small>
            </div>
          </div>
        </header>

        <div className="metric-grid">
          <article><span>طلبات جديدة</span><strong>{totalPending}</strong></article>
          <article><span>إيراد مؤكد</span><strong>{confirmedRevenue.toLocaleString("fr-FR")} دج</strong></article>
          <article><span>أماكن متاحة</span><strong>{travels.reduce((sum, travel) => sum + travel.ticketsLeft, 0)}</strong></article>
          <article><span>أعضاء الطاقم</span><strong>{teamGroups.reduce((sum, group) => sum + group.members.length, 0)}</strong></article>
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
                <article className="admin-card"><h2>لا توجد طلبات</h2><p>طلبات الحجز الجديدة ستظهر هنا مع المسافرين والوثائق والحالة.</p></article>
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
                      {user?.role === "admin" && (reservation.status === "Nouvelle" || reservation.status === "En etude") && (
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

        {tab === "voyages" && (
          travelMode === "form" ? (
            <form className="admin-card form-grid travel-editor travel-editor-modern" onSubmit={saveTravel}>
              <div className="editor-head">
                <h2>{editingTravelId ? "تعديل الرحلة" : "إضافة رحلة"}</h2>
                <button type="button" className="secondary-button" onClick={() => { setEditingTravelId(null); setTravelMode("list"); setTravelForm(emptyTravelForm); }}>
                  رجوع
                </button>
              </div>

              <div className="form-two">
                <label>اسم الرحلة<input required value={travelForm.name} onChange={(event) => setTravelForm({ ...travelForm, name: event.target.value })} /></label>
                <label>الوجهة<input required value={travelForm.destination} onChange={(event) => setTravelForm({ ...travelForm, destination: event.target.value })} /></label>
                <label>البلد<input required value={travelForm.country} onChange={(event) => setTravelForm({ ...travelForm, country: event.target.value })} /></label>
                <label>تاريخ الانطلاق<input required type="date" value={travelForm.date} onChange={(event) => setTravelForm({ ...travelForm, date: event.target.value })} /></label>
                <label>المدة<input required value={travelForm.duration} onChange={(event) => setTravelForm({ ...travelForm, duration: event.target.value })} /></label>
                <label>الفئة<select value={travelForm.category} onChange={(event) => setTravelForm({ ...travelForm, category: event.target.value as Travel["category"] })}>
                  {Object.entries(categoryLabels).filter(([key]) => key !== "Tous").map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select></label>
                <label>سعر البالغ<input required type="number" min={1} value={travelForm.price} onChange={(event) => setTravelForm({ ...travelForm, price: Number(event.target.value) })} /></label>
                <label>سعر الطفل<input required type="number" min={1} value={travelForm.childPrice} onChange={(event) => setTravelForm({ ...travelForm, childPrice: Number(event.target.value) })} /></label>
                <label>عدد المقاعد<input required type="number" min={1} value={travelForm.ticketsTotal} onChange={(event) => setTravelForm({ ...travelForm, ticketsTotal: Number(event.target.value) })} /></label>
              </div>

              <label>وصف مختصر<textarea required value={travelForm.description} onChange={(event) => setTravelForm({ ...travelForm, description: event.target.value })} /></label>
              <label>وصف كامل<textarea required value={travelForm.longDescription} onChange={(event) => setTravelForm({ ...travelForm, longDescription: event.target.value })} /></label>
              <label>المرشدون<textarea required value={travelForm.guidesText} onChange={(event) => setTravelForm({ ...travelForm, guidesText: event.target.value })} placeholder="كل اسم في سطر" /></label>

              <div className="form-two">
                <label className="upload-zone">
                  <input type="file" accept="image/*" multiple onChange={(event) => void uploadTravelImages(event.target.files, "images")} />
                  <strong>صور البطاقة</strong>
                  <span>ارفع صورة أو عدة صور للرحلة.</span>
                </label>
                <label className="upload-zone">
                  <input type="file" accept="image/*" onChange={(event) => void uploadTravelImages(event.target.files, "banner")} />
                  <strong>صورة البانر</strong>
                  <span>الصورة الكبيرة أعلى صفحة الحجز.</span>
                </label>
              </div>

              {travelForm.banner && <img className="travel-banner-preview" src={travelForm.banner} alt="banner preview" />}

              {travelForm.images.length > 0 && (
                <div className="uploaded-images">
                  {travelForm.images.map((image, index) => (
                    <div key={`${image.slice(0, 16)}-${index}`}>
                      <img src={image} alt={`travel ${index + 1}`} />
                      <button type="button" onClick={() => removeTravelImage(index)}><Trash2 size={14} /></button>
                      {index === 0 && <small>الرئيسية</small>}
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

              <button><Save /> {editingTravelId ? "حفظ التعديلات" : "إضافة الرحلة"}</button>
            </form>
          ) : (
            <div className="travel-admin-list">
              <div className="list-toolbar">
                <div><h2>كتالوج الرحلات</h2><p>{travels.length} رحلة متاحة حاليا</p></div>
                <button onClick={openNewTravel}><Plus /> إضافة رحلة</button>
              </div>
              <div className="travel-management-grid">
                {travels.map((travel) => (
                  <article key={travel.id} className="travel-manage-card">
                    <div className="travel-photo-stack">
                      {travel.images.slice(0, 3).map((image, index) => <img key={`${travel.id}-${index}`} src={image} alt={travel.name} />)}
                    </div>
                    <div>
                      <span>{categoryLabels[travel.category]} - {travel.date}</span>
                      <h3>{travel.name}</h3>
                      <p>{travel.destination} - {travel.country}</p>
                      <p>المرشدون: {travel.guides.join(" - ")}</p>
                      <strong>{travel.price.toLocaleString("fr-FR")} دج</strong>
                      <small>{travel.ticketsLeft}/{travel.ticketsTotal} مكان متاح</small>
                    </div>
                    <footer>
                      <button onClick={() => openEditTravel(travel)}><Edit3 /> تعديل</button>
                      <button className="danger" onClick={() => deleteTravel(travel.id)}><Trash2 /> حذف</button>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          )
        )}

        {tab === "team" && (
          <div className="team-admin-layout">
            <form className="admin-card form-grid" onSubmit={createTeamRole}>
              <h2>إضافة منصب جديد</h2>
              <label>اسم المنصب<input required value={teamRoleForm} onChange={(event) => setTeamRoleForm(event.target.value)} placeholder="مثال: مشرف إعاشة وإطعام" /></label>
              <button><Plus /> إضافة المنصب</button>
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
                    <button type="button" onClick={() => addMemberToGroup(group.id)}><Plus /> إضافة</button>
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

        {tab === "messages" && (
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
                    void markContactMessageAsReadInSupabase(message.id)
                      .then(setMessages)
                      .catch((error) => console.error(error));
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

        {tab === "users" && (
          <div className="admin-grid">
            <form className="admin-card form-grid" onSubmit={createUser}>
              <h2>إضافة مستخدم</h2>
              <label>الاسم الكامل<input required value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} /></label>
              <label>Email<input required type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} /></label>
              <label>كلمة المرور<input required value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} /></label>
              <label>الدور<select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as User["role"] })}><option value="employee">موظف</option><option value="admin">مدير</option></select></label>
              <button><Plus /> إضافة</button>
            </form>
            <div className="admin-card user-list">
              <h2>الحسابات</h2>
              {adminUsers.map((account) => (
                <article key={account.id}>
                  <span>{account.avatar}</span>
                  <div><strong>{account.name}</strong><small>{account.email} - {account.role === "admin" ? "مدير" : "موظف"}</small></div>
                  <button
                    disabled={account.id === user?.id}
                    onClick={() => persistUsers(adminUsers.filter((item) => item.id !== account.id))}
                    title={account.id === user?.id ? "لا يمكن حذف الحساب المتصل" : "حذف"}
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
