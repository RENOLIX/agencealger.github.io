import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Edit3, LogOut, Mail, Plus, ReceiptText, Save, Search, ShieldCheck, Trash2, UserRound, Users, WalletCards } from "lucide-react";
import { useAuth } from "../components/providers/auth";
import { benefitIcons, benefitLabels, benefitOptions, categoryLabels, getTeamGroups, getUsers, readStore, saveTeamGroups, saveUsers, seedTravels, writeStore, type BenefitKey, type ContactMessage, type Reservation, type TeamGroup, type Travel, type User } from "../lib/data";

type Tab = "reservations" | "voyages" | "historique" | "messages" | "users" | "team";

const emptyTravel: Omit<Travel, "id" | "ticketsLeft" | "rating"> = {
  name: "",
  destination: "مكة المكرمة",
  country: "السعودية",
  image: "",
  images: [],
  date: "",
  duration: "30 يوم",
  price: 185000,
  description: "",
  guides: "",
  category: "Culture",
  benefits: ["Vol", "Hotel", "Repas", "Guide", "Transfert"],
  ticketsTotal: 20,
};

export default function Admin() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("reservations");
  const [travels, setTravels] = useState<Travel[]>(() => readStore("hv-travels", seedTravels));
  const [reservations, setReservations] = useState<Reservation[]>(() => readStore("hv-reservations", []));
  const [messages, setMessages] = useState<ContactMessage[]>(() => readStore("hv-contact-messages", []));
  const [adminUsers, setAdminUsers] = useState<User[]>(() => getUsers());
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>(() => getTeamGroups());
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "employee" as User["role"] });
  const [teamRoleForm, setTeamRoleForm] = useState("");
  const [teamMemberDrafts, setTeamMemberDrafts] = useState<Record<string, string>>({});
  const [travelForm, setTravelForm] = useState(emptyTravel);
  const [travelMode, setTravelMode] = useState<"list" | "form">("list");
  const [editingTravelId, setEditingTravelId] = useState<string | null>(null);
  const [reservationForm, setReservationForm] = useState({ travelId: travels[0]?.id ?? "", clientName: "", clientPhone: "", quantity: 1 });

  const visibleReservations = useMemo(() => user?.role === "admin" ? reservations : reservations.filter((item) => item.employeeId === user?.id), [reservations, user]);
  const totalSales = visibleReservations.reduce((sum, item) => sum + item.total, 0);

  function persistTravels(next: Travel[]) {
    setTravels(next);
    writeStore("hv-travels", next);
  }

  function persistReservations(next: Reservation[]) {
    setReservations(next);
    writeStore("hv-reservations", next);
  }

  function persistMessages(next: ContactMessage[]) {
    setMessages(next);
    writeStore("hv-contact-messages", next);
  }

  function persistUsers(next: User[]) {
    setAdminUsers(next);
    saveUsers(next);
  }

  function persistTeamGroups(next: TeamGroup[]) {
    setTeamGroups(next);
    saveTeamGroups(next);
  }

  function createUser(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = userForm.email.trim().toLowerCase();
    if (!cleanEmail || adminUsers.some((item) => item.email === cleanEmail)) return;
    const initials = userForm.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "HV";
    persistUsers([
      ...adminUsers,
      { id: crypto.randomUUID(), name: userForm.name.trim(), email: cleanEmail, password: userForm.password, role: userForm.role, avatar: initials },
    ]);
    setUserForm({ name: "", email: "", password: "", role: "employee" });
  }

  function createReservation(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const travel = travels.find((item) => item.id === reservationForm.travelId);
    if (!travel || reservationForm.quantity < 1 || travel.ticketsLeft < reservationForm.quantity) return;
    const reservation: Reservation = {
      id: crypto.randomUUID(),
      travelId: travel.id,
      travelName: travel.name,
      employeeId: user.id,
      employeeName: user.name,
      clientName: reservationForm.clientName,
      clientPhone: reservationForm.clientPhone,
      quantity: reservationForm.quantity,
      total: reservationForm.quantity * travel.price,
      status: "Validee",
      createdAt: new Date().toISOString(),
    };
    persistReservations([reservation, ...reservations]);
    persistTravels(travels.map((item) => item.id === travel.id ? { ...item, ticketsLeft: item.ticketsLeft - reservationForm.quantity } : item));
    setReservationForm({ travelId: travel.id, clientName: "", clientPhone: "", quantity: 1 });
  }

  function openNewTravel() {
    setTravelForm(emptyTravel);
    setEditingTravelId(null);
    setTravelMode("form");
  }

  function openEditTravel(travel: Travel) {
    const images = travel.images?.length ? travel.images : [travel.image].filter(Boolean);
    setTravelForm({
      name: travel.name,
      destination: travel.destination,
      country: travel.country,
      image: travel.image,
      images,
      date: travel.date,
      duration: travel.duration,
      price: travel.price,
      description: travel.description,
      guides: travel.guides,
      category: travel.category,
      benefits: travel.benefits,
      ticketsTotal: travel.ticketsTotal,
    });
    setEditingTravelId(travel.id);
    setTravelMode("form");
  }

  async function readImageFile(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
      reader.readAsDataURL(file);
    });
  }

  async function uploadTravelImages(files: FileList | null) {
    if (!files?.length) return;
    const images = await Promise.all(Array.from(files).map(readImageFile));
    setTravelForm((current) => {
      const nextImages = [...current.images, ...images];
      return { ...current, images: nextImages, image: nextImages[0] ?? current.image };
    });
  }

  function removeTravelImage(index: number) {
    setTravelForm((current) => {
      const nextImages = current.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...current, images: nextImages, image: nextImages[0] ?? "" };
    });
  }

  function saveTravel(event: FormEvent) {
    event.preventDefault();
    const total = Number(travelForm.ticketsTotal);
    const fallbackImage = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200";
    const images = travelForm.images.length ? travelForm.images : [travelForm.image || fallbackImage];
    const image = images[0];

    if (editingTravelId) {
      const current = travels.find((item) => item.id === editingTravelId);
      const reserved = current ? Math.max(0, current.ticketsTotal - current.ticketsLeft) : 0;
      persistTravels(travels.map((item) => item.id === editingTravelId ? {
        ...item,
        ...travelForm,
        image,
        images,
        price: Number(travelForm.price),
        ticketsTotal: total,
        ticketsLeft: Math.max(0, total - reserved),
      } : item));
    } else {
      const next: Travel = {
        ...travelForm,
        id: crypto.randomUUID(),
        ticketsLeft: total,
        ticketsTotal: total,
        price: Number(travelForm.price),
        rating: 4.8,
        image,
        images,
      };
      persistTravels([next, ...travels]);
    }

    setTravelForm(emptyTravel);
    setEditingTravelId(null);
    setTravelMode("list");
  }

  function deleteTravel(travelId: string) {
    if (!window.confirm("حذف هذه الرحلة؟")) return;
    persistTravels(travels.filter((item) => item.id !== travelId));
    if (reservationForm.travelId === travelId) {
      setReservationForm({ ...reservationForm, travelId: travels.find((item) => item.id !== travelId)?.id ?? "" });
    }
  }

  function createTeamRole(event: FormEvent) {
    event.preventDefault();
    const title = teamRoleForm.trim();
    if (!title) return;
    persistTeamGroups([{ id: crypto.randomUUID(), title, members: [] }, ...teamGroups]);
    setTeamRoleForm("");
  }

  function addMemberToGroup(groupId: string) {
    const name = teamMemberDrafts[groupId]?.trim();
    if (!name) return;
    persistTeamGroups(teamGroups.map((group) => (
      group.id === groupId && !group.members.includes(name)
        ? { ...group, members: [...group.members, name] }
        : group
    )));
    setTeamMemberDrafts((current) => ({ ...current, [groupId]: "" }));
  }

  function removeMemberFromGroup(groupId: string, memberName: string) {
    persistTeamGroups(teamGroups.map((group) => (
      group.id === groupId
        ? { ...group, members: group.members.filter((member) => member !== memberName) }
        : group
    )));
  }

  function deleteTeamGroup(groupId: string) {
    if (!window.confirm("حذف هذا المنصب؟")) return;
    persistTeamGroups(teamGroups.filter((group) => group.id !== groupId));
  }

  const allTeamNames = Array.from(new Set(teamGroups.flatMap((group) => group.members))).sort((a, b) => a.localeCompare(b, "ar"));

  return (
    <main className="admin-shell">
      <aside className="admin-side">
        <div className="admin-logo"><img src="/agencealger.github.io/logo-normal.png" alt="Hamdi Voyage" /></div>
        <button className={tab === "reservations" ? "active" : ""} onClick={() => setTab("reservations")}><ReceiptText /> الحجوزات</button>
        <button className={tab === "voyages" ? "active" : ""} onClick={() => setTab("voyages")}><WalletCards /> الرحلات</button>
        <button className={tab === "historique" ? "active" : ""} onClick={() => setTab("historique")}><UserRound /> السجل</button>
        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}><Mail /> الرسائل</button>
        {user?.role === "admin" && <button className={tab === "team" ? "active" : ""} onClick={() => setTab("team")}><Users /> الطاقم</button>}
        {user?.role === "admin" && <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}><Users /> المستخدمون</button>}
        <button onClick={logout}><LogOut /> تسجيل الخروج</button>
      </aside>

      <section className="admin-main">
        <header className="admin-top">
          <div><span className="label">لوحة التحكم</span><h1>{tab === "voyages" ? "إدارة الرحلات" : tab === "historique" ? "السجل التجاري" : tab === "messages" ? "رسائل العملاء" : tab === "users" ? "المستخدمون" : tab === "team" ? "إدارة الطاقم" : "إنشاء حجز"}</h1></div>
          <div className="profile"><span>{user?.avatar}</span><div><strong>{user?.name}</strong><small>{user?.role === "admin" ? "مدير" : "موظف"}</small></div></div>
        </header>

        <div className="metric-grid">
          <article><span>الحجوزات الظاهرة</span><strong>{visibleReservations.length}</strong></article>
          <article><span>المبيعات</span><strong>{totalSales.toLocaleString("fr-FR")} دج</strong></article>
          <article><span>الأماكن المتاحة</span><strong>{travels.reduce((sum, item) => sum + item.ticketsLeft, 0)}</strong></article>
          <article><span>رسائل العملاء</span><strong>{messages.length}</strong></article>
        </div>

        {tab === "reservations" && (
          <div className="admin-grid">
            <form className="admin-card form-grid" onSubmit={createReservation}>
              <h2>حجز جديد</h2>
              <label>الرحلة<select value={reservationForm.travelId} onChange={(event) => setReservationForm({ ...reservationForm, travelId: event.target.value })}>{travels.map((travel) => <option key={travel.id} value={travel.id}>{travel.name} - {travel.ticketsLeft} مكان</option>)}</select></label>
              <label>اسم العميل<input required value={reservationForm.clientName} onChange={(event) => setReservationForm({ ...reservationForm, clientName: event.target.value })} /></label>
              <label>هاتف العميل<input required value={reservationForm.clientPhone} onChange={(event) => setReservationForm({ ...reservationForm, clientPhone: event.target.value })} /></label>
              <label>العدد<input type="number" min={1} value={reservationForm.quantity} onChange={(event) => setReservationForm({ ...reservationForm, quantity: Number(event.target.value) })} /></label>
              <button><ShieldCheck /> تأكيد الحجز</button>
            </form>
            <TravelInventory travels={travels} />
          </div>
        )}

        {tab === "voyages" && (
          user?.role === "admin" ? (
            travelMode === "form" ? (
              <form className="admin-card form-grid travel-editor" onSubmit={saveTravel}>
                <div className="editor-head">
                  <button type="button" className="ghost-action" onClick={() => { setTravelMode("list"); setEditingTravelId(null); setTravelForm(emptyTravel); }}><ArrowLeft /> رجوع</button>
                  <h2>{editingTravelId ? "تعديل الرحلة" : "إضافة رحلة"}</h2>
                </div>
                <div className="form-two">
                  <label>الاسم<input required value={travelForm.name} onChange={(event) => setTravelForm({ ...travelForm, name: event.target.value })} /></label>
                  <label>الوجهة<input required value={travelForm.destination} onChange={(event) => setTravelForm({ ...travelForm, destination: event.target.value })} /></label>
                  <label>البلد<input required value={travelForm.country} onChange={(event) => setTravelForm({ ...travelForm, country: event.target.value })} /></label>
                  <label>تاريخ الانطلاق<input type="date" required value={travelForm.date} onChange={(event) => setTravelForm({ ...travelForm, date: event.target.value })} /></label>
                  <label>المدة<input required value={travelForm.duration} onChange={(event) => setTravelForm({ ...travelForm, duration: event.target.value })} /></label>
                  <label>الفئة<select value={travelForm.category} onChange={(event) => setTravelForm({ ...travelForm, category: event.target.value as Travel["category"] })}><option value="Plage">{categoryLabels.Plage}</option><option value="Aventure">{categoryLabels.Aventure}</option><option value="Culture">{categoryLabels.Culture}</option><option value="Luxe">{categoryLabels.Luxe}</option></select></label>
                  <label>السعر دج<input type="number" min={1} value={travelForm.price} onChange={(event) => setTravelForm({ ...travelForm, price: Number(event.target.value) })} /></label>
                  <label>الأماكن المتاحة<input type="number" min={0} value={travelForm.ticketsTotal} onChange={(event) => setTravelForm({ ...travelForm, ticketsTotal: Number(event.target.value) })} /></label>
                </div>
                <div className="image-uploader">
                  <label className="upload-zone">
                    <input type="file" accept="image/*" multiple onChange={(event) => void uploadTravelImages(event.target.files)} />
                    <strong>رفع الصور</strong>
                    <span>اختر صورة أو أكثر من جهازك.</span>
                  </label>
                  {travelForm.images.length > 0 && (
                    <div className="uploaded-images">
                      {travelForm.images.map((image, index) => (
                        <div key={`${image.slice(0, 18)}-${index}`}>
                          <img src={image} alt={`رحلة ${index + 1}`} />
                          <button type="button" onClick={() => removeTravelImage(index)}><Trash2 size={14} /></button>
                          {index === 0 && <small>الرئيسية</small>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label>الوصف<textarea required value={travelForm.description} onChange={(event) => setTravelForm({ ...travelForm, description: event.target.value })} /></label>
                <label>أسماء المرشدين<textarea required value={travelForm.guides} onChange={(event) => setTravelForm({ ...travelForm, guides: event.target.value })} placeholder="مثال: الشيخ أحمد، الأستاذ سمير" /></label>
                <div className="benefit-picker">
                  {benefitOptions.map((benefit) => {
                    const Icon = benefitIcons[benefit];
                    return (
                      <label key={benefit}>
                        <span><Icon size={16} /> {benefitLabels[benefit]}</span>
                        <input
                          type="checkbox"
                          checked={travelForm.benefits.includes(benefit)}
                          onChange={(event) => setTravelForm({ ...travelForm, benefits: event.target.checked ? Array.from(new Set([...travelForm.benefits, benefit])) : travelForm.benefits.filter((x: BenefitKey) => x !== benefit) })}
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
                  <div><h2>الرحلات</h2><p>{travels.length} رحلة في القائمة</p></div>
                  <button onClick={openNewTravel}><Plus /> إضافة رحلة</button>
                </div>
                <div className="travel-management-grid">
                  {travels.map((travel) => (
                    <article key={travel.id} className="travel-manage-card">
                      <div className="travel-photo-stack">
                        {(travel.images?.length ? travel.images : [travel.image]).slice(0, 3).map((image, index) => <img key={`${travel.id}-${index}`} src={image} alt={`${travel.name} ${index + 1}`} />)}
                        {(travel.images?.length ?? 0) > 3 && <span>+{travel.images.length - 3}</span>}
                      </div>
                      <div>
                        <span>{categoryLabels[travel.category]} - {travel.date}</span>
                        <h3>{travel.name}</h3>
                        <p>{travel.destination} - {travel.country}</p>
                        <p>المرشدون: {travel.guides}</p>
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
          ) : <div className="admin-card"><h2>صلاحية محدودة</h2><p>المدير فقط يمكنه إضافة الرحلات أو تعديلها أو حذفها.</p></div>
        )}

        {tab === "historique" && (
          <div className="history-list">
            {user?.role === "admin" && <EmployeeBoard reservations={reservations} />}
            {visibleReservations.map((reservation) => <article key={reservation.id} className="history-row"><div><strong>{reservation.clientName}</strong><span>{reservation.travelName} بواسطة {reservation.employeeName}</span></div><div><strong>{reservation.quantity} مكان</strong><span>{new Date(reservation.createdAt).toLocaleString("fr-FR")}</span></div><strong>{reservation.total.toLocaleString("fr-FR")} دج</strong></article>)}
          </div>
        )}

        {tab === "messages" && (
          <div className="message-list">
            {messages.length === 0 ? (
              <div className="admin-card"><h2>لا توجد رسائل</h2><p>الطلبات المرسلة من صفحة الاتصال ستظهر هنا.</p></div>
            ) : messages.map((message) => (
              <article key={message.id} className="message-card">
                <div className="message-head">
                  <div><strong>{message.fullName}</strong><span>{message.email} - {message.phone}</span></div>
                  <button onClick={() => persistMessages(messages.map((item) => item.id === message.id ? { ...item, status: "Lu" } : item))}>{message.status === "Lu" ? "مقروء" : "جديد"}</button>
                </div>
                <p>{message.message}</p>
                <footer><span>{message.destination || "وجهة غير محددة"}</span><span>{new Date(message.createdAt).toLocaleString("fr-FR")}</span></footer>
              </article>
            ))}
          </div>
        )}

        {tab === "team" && user?.role === "admin" && (
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
                        list={`team-names-${group.id}`}
                        value={teamMemberDrafts[group.id] ?? ""}
                        onChange={(event) => setTeamMemberDrafts((current) => ({ ...current, [group.id]: event.target.value }))}
                        placeholder={`ابحث عن اسم أو أضف اسما إلى ${group.title}`}
                      />
                      <datalist id={`team-names-${group.id}`}>
                        {allTeamNames.map((name) => <option key={`${group.id}-${name}`} value={name} />)}
                      </datalist>
                    </div>
                    <button type="button" onClick={() => addMemberToGroup(group.id)}><Plus /> إضافة</button>
                  </div>
                  <div className="team-admin-members">
                    {group.members.map((member) => (
                      <div key={`${group.id}-${member}`} className="team-admin-member">
                        <span>{member}</span>
                        <button type="button" onClick={() => removeMemberFromGroup(group.id, member)} title="حذف الاسم">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && user?.role === "admin" && (
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

function TravelInventory({ travels }: { travels: Travel[] }) {
  return <div className="admin-card inventory"><h2>مخزون الرحلات</h2>{travels.map((travel) => <article key={travel.id}><img src={travel.image} alt="" /><div><strong>{travel.name}</strong><span>{travel.date} - {travel.price.toLocaleString("fr-FR")} دج</span><progress value={travel.ticketsLeft} max={travel.ticketsTotal} /></div><b>{travel.ticketsLeft}/{travel.ticketsTotal}</b></article>)}</div>;
}

function EmployeeBoard({ reservations }: { reservations: Reservation[] }) {
  return <div className="employee-board">{getUsers().filter((item) => item.role === "employee").map((employee) => {
    const rows = reservations.filter((item) => item.employeeId === employee.id);
    return <article key={employee.id}><span>{employee.avatar}</span><strong>{employee.name}</strong><small>{rows.length} حجز</small><b>{rows.reduce((sum, item) => sum + item.total, 0).toLocaleString("fr-FR")} دج</b></article>;
  })}</div>;
}
