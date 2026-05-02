import { FormEvent, useMemo, useState } from "react";
import { LogOut, Mail, Plus, ReceiptText, ShieldCheck, Sparkles, Trash2, UserRound, Users, WalletCards } from "lucide-react";
import { useAuth } from "../components/providers/auth";
import { benefitIcons, benefitOptions, getUsers, readStore, saveUsers, seedTravels, writeStore, type BenefitKey, type ContactMessage, type Reservation, type Travel, type User } from "../lib/data";

type Tab = "reservations" | "voyages" | "historique" | "messages" | "users";

const emptyTravel: Omit<Travel, "id" | "ticketsLeft" | "rating"> = {
  name: "",
  destination: "",
  country: "",
  image: "",
  date: "",
  duration: "7 jours",
  price: 1200,
  description: "",
  category: "Culture",
  benefits: ["Vol", "Hotel"],
  ticketsTotal: 20,
};

export default function Admin() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("reservations");
  const [travels, setTravels] = useState<Travel[]>(() => readStore("hv-travels", seedTravels));
  const [reservations, setReservations] = useState<Reservation[]>(() => readStore("hv-reservations", []));
  const [messages, setMessages] = useState<ContactMessage[]>(() => readStore("hv-contact-messages", []));
  const [adminUsers, setAdminUsers] = useState<User[]>(() => getUsers());
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "employee" as User["role"] });
  const [travelForm, setTravelForm] = useState(emptyTravel);
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

  function addTravel(event: FormEvent) {
    event.preventDefault();
    const next: Travel = {
      ...travelForm,
      id: crypto.randomUUID(),
      ticketsLeft: Number(travelForm.ticketsTotal),
      ticketsTotal: Number(travelForm.ticketsTotal),
      price: Number(travelForm.price),
      rating: 4.8,
      image: travelForm.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    };
    persistTravels([next, ...travels]);
    setTravelForm(emptyTravel);
  }

  return (
    <main className="admin-shell">
      <aside className="admin-side">
        <div className="admin-logo"><Sparkles /> <span>Hamdi</span><strong>Admin</strong></div>
        <button className={tab === "reservations" ? "active" : ""} onClick={() => setTab("reservations")}><ReceiptText /> Reservations</button>
        <button className={tab === "voyages" ? "active" : ""} onClick={() => setTab("voyages")}><WalletCards /> Voyages</button>
        <button className={tab === "historique" ? "active" : ""} onClick={() => setTab("historique")}><UserRound /> Historique</button>
        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}><Mail /> Messages</button>
        {user?.role === "admin" && <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}><Users /> Utilisateurs</button>}
        <button onClick={logout}><LogOut /> Deconnexion</button>
      </aside>

      <section className="admin-main">
        <header className="admin-top">
          <div><span className="label">Back office</span><h1>{tab === "voyages" ? "Gestion des voyages" : tab === "historique" ? "Historique commercial" : tab === "messages" ? "Messages clients" : tab === "users" ? "Utilisateurs" : "Creer une reservation"}</h1></div>
          <div className="profile"><span>{user?.avatar}</span><div><strong>{user?.name}</strong><small>{user?.role === "admin" ? "Administrateur" : "Employe"}</small></div></div>
        </header>

        <div className="metric-grid">
          <article><span>Reservations visibles</span><strong>{visibleReservations.length}</strong></article>
          <article><span>Chiffre realise</span><strong>{totalSales.toLocaleString("fr-FR")} EUR</strong></article>
          <article><span>Billets disponibles</span><strong>{travels.reduce((sum, item) => sum + item.ticketsLeft, 0)}</strong></article>
          <article><span>Messages clients</span><strong>{messages.length}</strong></article>
        </div>

        {tab === "reservations" && (
          <div className="admin-grid">
            <form className="admin-card form-grid" onSubmit={createReservation}>
              <h2>Nouvelle reservation</h2>
              <label>Voyage<select value={reservationForm.travelId} onChange={(event) => setReservationForm({ ...reservationForm, travelId: event.target.value })}>{travels.map((travel) => <option key={travel.id} value={travel.id}>{travel.name} - {travel.ticketsLeft} billets</option>)}</select></label>
              <label>Nom client<input required value={reservationForm.clientName} onChange={(event) => setReservationForm({ ...reservationForm, clientName: event.target.value })} /></label>
              <label>Telephone client<input required value={reservationForm.clientPhone} onChange={(event) => setReservationForm({ ...reservationForm, clientPhone: event.target.value })} /></label>
              <label>Quantite<input type="number" min={1} value={reservationForm.quantity} onChange={(event) => setReservationForm({ ...reservationForm, quantity: Number(event.target.value) })} /></label>
              <button><ShieldCheck /> Valider la reservation</button>
            </form>
            <TravelInventory travels={travels} />
          </div>
        )}

        {tab === "voyages" && (
          <div className="admin-grid">
            {user?.role === "admin" ? (
              <form className="admin-card form-grid" onSubmit={addTravel}>
                <h2>Ajouter un voyage</h2>
                <label>Nom<input required value={travelForm.name} onChange={(event) => setTravelForm({ ...travelForm, name: event.target.value })} /></label>
                <label>Destination<input required value={travelForm.destination} onChange={(event) => setTravelForm({ ...travelForm, destination: event.target.value })} /></label>
                <label>Pays<input required value={travelForm.country} onChange={(event) => setTravelForm({ ...travelForm, country: event.target.value })} /></label>
                <label>Date<input type="date" required value={travelForm.date} onChange={(event) => setTravelForm({ ...travelForm, date: event.target.value })} /></label>
                <label>Prix EUR<input type="number" min={1} value={travelForm.price} onChange={(event) => setTravelForm({ ...travelForm, price: Number(event.target.value) })} /></label>
                <label>Billets disponibles<input type="number" min={1} value={travelForm.ticketsTotal} onChange={(event) => setTravelForm({ ...travelForm, ticketsTotal: Number(event.target.value) })} /></label>
                <label>Image URL<input value={travelForm.image} onChange={(event) => setTravelForm({ ...travelForm, image: event.target.value })} /></label>
                <label>Description<textarea required value={travelForm.description} onChange={(event) => setTravelForm({ ...travelForm, description: event.target.value })} /></label>
                <div className="check-grid">{benefitOptions.map((benefit) => {
                  const Icon = benefitIcons[benefit];
                  return <label key={benefit}><input type="checkbox" checked={travelForm.benefits.includes(benefit)} onChange={(event) => setTravelForm({ ...travelForm, benefits: event.target.checked ? [...travelForm.benefits, benefit] : travelForm.benefits.filter((x: BenefitKey) => x !== benefit) })} /><Icon size={14} /> {benefit}</label>;
                })}</div>
                <button><Plus /> Ajouter le voyage</button>
              </form>
            ) : <div className="admin-card"><h2>Acces limite</h2><p>Seul l'administrateur peut ajouter ou modifier les voyages.</p></div>}
            <TravelInventory travels={travels} />
          </div>
        )}

        {tab === "historique" && (
          <div className="history-list">
            {user?.role === "admin" && <EmployeeBoard reservations={reservations} />}
            {visibleReservations.map((reservation) => <article key={reservation.id} className="history-row"><div><strong>{reservation.clientName}</strong><span>{reservation.travelName} par {reservation.employeeName}</span></div><div><strong>{reservation.quantity} billet(s)</strong><span>{new Date(reservation.createdAt).toLocaleString("fr-FR")}</span></div><strong>{reservation.total.toLocaleString("fr-FR")} EUR</strong></article>)}
          </div>
        )}

        {tab === "messages" && (
          <div className="message-list">
            {messages.length === 0 ? (
              <div className="admin-card"><h2>Aucun message</h2><p>Les demandes envoyees depuis la page Contact apparaitront ici.</p></div>
            ) : messages.map((message) => (
              <article key={message.id} className="message-card">
                <div className="message-head">
                  <div><strong>{message.fullName}</strong><span>{message.email} · {message.phone}</span></div>
                  <button onClick={() => persistMessages(messages.map((item) => item.id === message.id ? { ...item, status: "Lu" } : item))}>{message.status}</button>
                </div>
                <p>{message.message}</p>
                <footer><span>{message.destination || "Destination non precisee"}</span><span>{new Date(message.createdAt).toLocaleString("fr-FR")}</span></footer>
              </article>
            ))}
          </div>
        )}

        {tab === "users" && user?.role === "admin" && (
          <div className="admin-grid">
            <form className="admin-card form-grid" onSubmit={createUser}>
              <h2>Ajouter un utilisateur</h2>
              <label>Nom complet<input required value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} /></label>
              <label>Email<input required type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} /></label>
              <label>Mot de passe<input required value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} /></label>
              <label>Role<select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as User["role"] })}><option value="employee">Employe</option><option value="admin">Administrateur</option></select></label>
              <button><Plus /> Ajouter</button>
            </form>
            <div className="admin-card user-list">
              <h2>Comptes</h2>
              {adminUsers.map((account) => (
                <article key={account.id}>
                  <span>{account.avatar}</span>
                  <div><strong>{account.name}</strong><small>{account.email} · {account.role === "admin" ? "Administrateur" : "Employe"}</small></div>
                  <button
                    disabled={account.id === user.id}
                    onClick={() => persistUsers(adminUsers.filter((item) => item.id !== account.id))}
                    title={account.id === user.id ? "Impossible de supprimer votre compte connecte" : "Supprimer"}
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
  return <div className="admin-card inventory"><h2>Stock voyages</h2>{travels.map((travel) => <article key={travel.id}><img src={travel.image} alt="" /><div><strong>{travel.name}</strong><span>{travel.date} - {travel.price.toLocaleString("fr-FR")} EUR</span><progress value={travel.ticketsLeft} max={travel.ticketsTotal} /></div><b>{travel.ticketsLeft}/{travel.ticketsTotal}</b></article>)}</div>;
}

function EmployeeBoard({ reservations }: { reservations: Reservation[] }) {
  return <div className="employee-board">{getUsers().filter((item) => item.role === "employee").map((employee) => {
    const rows = reservations.filter((item) => item.employeeId === employee.id);
    return <article key={employee.id}><span>{employee.avatar}</span><strong>{employee.name}</strong><small>{rows.length} reservations</small><b>{rows.reduce((sum, item) => sum + item.total, 0).toLocaleString("fr-FR")} EUR</b></article>;
  })}</div>;
}
