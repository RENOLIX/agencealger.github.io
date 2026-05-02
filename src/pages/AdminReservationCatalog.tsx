import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, Plus, Star, Users } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth";
import AdminTopbar from "./_components/AdminTopbar";
import {
  benefitIcons,
  benefitLabels,
  categoryLabels,
  formatArabicMonthRange,
  getReservations,
  getTravels,
  syncReservationsFromSupabase,
  syncTravelsFromSupabase,
  type Reservation,
  type Travel,
} from "../lib/data";

export default function AdminReservationCatalog() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [travels, setTravels] = useState<Travel[]>(() => getTravels());
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations());

  useEffect(() => {
    void syncTravelsFromSupabase().then(setTravels).catch(() => undefined);
    void syncReservationsFromSupabase().then(setReservations).catch(() => undefined);
  }, []);

  const employeeReservations = useMemo(() => (
    reservations.filter((reservation) => reservation.employeeId === user?.id || reservation.employeeName === user?.name)
  ), [reservations, user]);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <main className="admin-shell admin-shell-modern">
      <section className="admin-main admin-main-modern">
        <AdminTopbar
          user={user}
          items={[
            { key: "dashboard", label: "لوحة الإدارة", onClick: () => navigate("/admin") },
            { key: "catalog", label: "كتالوج الرحلات", active: true, onClick: () => navigate("/admin/reservations/new") },
          ]}
          onCreateReservation={() => navigate("/admin/reservations/new")}
          onOpenApprovals={user.role === "admin" ? () => navigate("/admin/approvals") : undefined}
          onLogout={logout}
        />

        <header className="admin-top admin-top-modern">
          <div>
            <span className="label">مساحة الموظف</span>
            <h1>اختر الرحلة ثم أنشئ الحجز</h1>
          </div>
        </header>

        <div className="metric-grid">
          <article><span>الرحلات المتاحة</span><strong>{travels.length}</strong></article>
          <article><span>المقاعد المتبقية</span><strong>{travels.reduce((sum, travel) => sum + travel.ticketsLeft, 0)}</strong></article>
          <article><span>حجوزاتي</span><strong>{employeeReservations.length}</strong></article>
          <article><span>الموافق عليها</span><strong>{employeeReservations.filter((reservation) => reservation.status === "Confirmee").length}</strong></article>
        </div>

        <section className="section pale admin-catalog-public">
        <div className="section-head tours-head admin-catalog-head">
          <div><span className="label">رحلاتنا</span><h2>برامج العمرة<br /><em>المتاحة</em></h2></div>
        </div>
        <div className="tour-grid">
          {travels.map((tour) => (
            <article className="tour-card" key={tour.id}>
              <div className="tour-image">
                <img src={tour.image} alt={tour.name} />
                <span className="duration"><Clock size={12} /> {tour.duration}</span>
                <span className="place"><MapPin size={13} /> {formatArabicMonthRange(tour.date, tour.duration)}</span>
              </div>
              <div className="tour-body">
                <div className="tour-title">
                  <div>
                    <h3>{tour.name}</h3>
                    <p>{tour.destination}</p>
                  </div>
                  <strong><Star size={13} /> {tour.rating}</strong>
                </div>
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
                  <div><strong>{tour.price.toLocaleString("fr-FR")} دج</strong><span>للبالغ</span></div>
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
      </section>
    </main>
  );
}
