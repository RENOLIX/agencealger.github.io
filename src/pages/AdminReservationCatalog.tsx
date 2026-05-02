import { useEffect, useState } from "react";
import { CalendarDays, Clock, LogOut, MapPin, Plus, Star, Users } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth";
import { benefitIcons, benefitLabels, categoryLabels, getTravels, syncTravelsFromSupabase, type Travel } from "../lib/data";

export default function AdminReservationCatalog() {
  const { user, logout } = useAuth();
  const [travels, setTravels] = useState<Travel[]>(() => getTravels());

  useEffect(() => {
    void syncTravelsFromSupabase().then(setTravels).catch(() => undefined);
  }, []);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <main className="admin-shell admin-shell-modern">
      <aside className="admin-side admin-side-modern">
        <div className="admin-logo">
          <img src="/agencealger.github.io/logo-normal.png" alt="Hamdi Voyage" />
        </div>
        <Link className="admin-side-link" to="/admin">لوحة الإدارة</Link>
        <Link className="admin-side-link active" to="/admin/reservations/new">إنشاء حجز</Link>
        {user.role === "admin" && <Link className="admin-side-link" to="/admin/approvals">الحجوزات للموافقة</Link>}
        <button onClick={logout}><LogOut /> تسجيل الخروج</button>
      </aside>

      <section className="admin-main admin-main-modern">
        <header className="admin-top admin-top-modern">
          <div>
            <span className="label">مساحة الموظف</span>
            <h1>اختر الرحلة ثم أنشئ الحجز</h1>
          </div>
          <div className="profile">
            <span>{user.avatar}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.role === "admin" ? "مدير" : "موظف"}</small>
            </div>
          </div>
        </header>

        <div className="metric-grid">
          <article><span>الرحلات المتاحة</span><strong>{travels.length}</strong></article>
          <article><span>إجمالي المقاعد</span><strong>{travels.reduce((sum, travel) => sum + travel.ticketsLeft, 0)}</strong></article>
          <article><span>برامج عمرة</span><strong>{travels.filter((travel) => travel.category === "Culture").length}</strong></article>
          <article><span>رحلات مميزة</span><strong>{travels.filter((travel) => travel.category === "Luxe").length}</strong></article>
        </div>

        <div className="tour-grid admin-tour-grid">
          {travels.map((tour) => (
            <article className="tour-card" key={tour.id}>
              <div className="tour-image">
                <img src={tour.image} alt={tour.name} />
                <span className="duration"><Clock size={12} /> {tour.duration}</span>
                <span className="place"><MapPin size={13} /> {tour.country}</span>
              </div>
              <div className="tour-body">
                <div className="tour-title"><div><h3>{tour.name}</h3><p>{tour.destination}</p></div><strong><Star size={13} /> {tour.rating}</strong></div>
                <p className="tour-desc">{tour.description}</p>
                <div className="benefits">
                  {tour.benefits.map((benefit) => {
                    const Icon = benefitIcons[benefit];
                    if (!Icon) return null;
                    return <span key={benefit}><Icon size={12} /> {benefitLabels[benefit] ?? benefit}</span>;
                  })}
                </div>
                <p className="tour-desc">الفئة: {categoryLabels[tour.category]} - المرشدون: {tour.guides.join(" - ")}</p>
                <div className="tour-foot">
                  <div><strong>{tour.price.toLocaleString("fr-FR")} دج</strong><span>للشخص</span></div>
                  <span className={tour.ticketsLeft < 8 ? "low-stock" : ""}><Users size={13} /> {tour.ticketsLeft}/{tour.ticketsTotal} مكان</span>
                </div>
                <Link className="reserve-link" to={`/admin/reservations/new/${tour.id}`}>
                  <span><Plus size={15} /> إنشاء حجز على هذه الرحلة</span>
                  <small><CalendarDays size={13} /> فتح ملف الحجز الداخلي</small>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
