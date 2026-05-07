import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Edit3, Search, XCircle } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth";
import AdminTopbar from "./_components/AdminTopbar";
import {
  buildReservationNumberMap,
  getReservations,
  getTravels,
  passengerTypeLabels,
  reservationStatusLabels,
  syncReservationsFromSupabase,
  syncTravelsFromSupabase,
  type Reservation,
  type ReservationStatus,
  type Travel,
  updateReservationStatusInSupabase,
} from "../lib/data";

export default function ApprovalReservations() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations());
  const [travels, setTravels] = useState<Travel[]>(() => getTravels());
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    void syncReservationsFromSupabase().then(setReservations).catch(() => undefined);
    void syncTravelsFromSupabase().then(setTravels).catch(() => undefined);
  }, []);

  const pendingReservations = useMemo(() => {
    const filtered = reservations.filter((reservation) => reservation.status === "Nouvelle" || reservation.status === "En etude");
    const needle = query.trim().toLowerCase();
    if (!needle) return filtered;
    const reservationNumberMap = buildReservationNumberMap(reservations);

    return filtered.filter((reservation) => [
      reservationNumberMap.get(reservation.id) ?? "",
      reservation.travelName,
      reservation.customerFirstName,
      reservation.customerLastName,
      reservation.customerPhone,
      reservation.employeeName,
    ].some((value) => value.toLowerCase().includes(needle)));
  }, [query, reservations]);
  const reservationNumberMap = useMemo(() => buildReservationNumberMap(reservations), [reservations]);

  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/admin" replace />;

  async function changeStatus(reservationId: string, status: ReservationStatus) {
    setBusyId(reservationId);
    try {
      const [nextReservations, nextTravels] = await Promise.all([
        updateReservationStatusInSupabase(reservationId, status),
        syncTravelsFromSupabase(),
      ]);
      setReservations(nextReservations);
      setTravels(nextTravels);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="admin-shell admin-shell-modern">
      <section className="admin-main admin-main-modern">
        <AdminTopbar
          user={user}
          items={[
            { key: "dashboard", label: "لوحة الإدارة", onClick: () => navigate("/admin") },
            { key: "approvals", label: "الحجوزات للموافقة", badge: pendingReservations.length, active: true, onClick: () => navigate("/admin/approvals") },
          ]}
          onCreateReservation={() => navigate("/admin/reservations/new")}
          onOpenApprovals={() => navigate("/admin/approvals")}
          approvalsBadge={pendingReservations.length}
          onLogout={logout}
        />

        <header className="admin-top admin-top-modern">
          <div>
            <span className="label">صفحة منفصلة</span>
            <h1>الحجوزات في انتظار الموافقة</h1>
          </div>
        </header>

        <div className="metric-grid">
          <article><span>طلبات تنتظر القرار</span><strong>{pendingReservations.length}</strong></article>
          <article><span>أماكن متاحة</span><strong>{travels.reduce((sum, travel) => sum + travel.ticketsLeft, 0)}</strong></article>
          <article><span>طلبات مؤكدة</span><strong>{reservations.filter((reservation) => reservation.status === "Confirmee").length}</strong></article>
          <article><span>طلبات ملغاة</span><strong>{reservations.filter((reservation) => reservation.status === "Annulee").length}</strong></article>
        </div>

        <div className="reservation-admin-shell">
          <div className="reservation-admin-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم العميل أو الرحلة أو الموظف" />
          </div>

          <div className="reservation-admin-list">
            {pendingReservations.length === 0 ? (
              <article className="admin-card">
                <h2>لا توجد حجوزات تنتظر الموافقة</h2>
                <p>كل الطلبات الجديدة ستظهر هنا مباشرة بعد أن يرسلها الموظف.</p>
              </article>
            ) : pendingReservations.map((reservation) => (
              <article key={reservation.id} className="admin-card reservation-request-card">
                <div className="reservation-request-top">
                  <div>
                    <span className={`status-pill status-${reservation.status.replace(/\s+/g, "-").toLowerCase()}`}>{reservationStatusLabels[reservation.status]}</span>
                    <h2>{reservation.travelName}</h2>
                    <p>رقم الحجز: {reservationNumberMap.get(reservation.id) ?? "00001"}</p>
                    <p>{reservation.customerFirstName} {reservation.customerLastName} - {reservation.customerPhone}</p>
                  </div>
                  <div className="approval-actions">
                    <button type="button" className="secondary-button compact-button" onClick={() => navigate(`/admin/reservations/edit/${reservation.id}`)}>
                      <Edit3 size={16} /> تعديل
                    </button>
                    <button type="button" className="approve-button" disabled={busyId === reservation.id} onClick={() => void changeStatus(reservation.id, "Confirmee")}>
                      <CheckCircle2 size={16} /> تأكيد
                    </button>
                    <button type="button" className="reject-button" disabled={busyId === reservation.id} onClick={() => void changeStatus(reservation.id, "Annulee")}>
                      <XCircle size={16} /> رفض
                    </button>
                  </div>
                </div>

                <div className="reservation-request-metrics">
                  <div><small>الموظف</small><strong>{reservation.employeeName}</strong></div>
                  <div><small>المقاعد</small><strong>{reservation.quantity}</strong></div>
                  <div><small>الإجمالي</small><strong>{reservation.total.toLocaleString("fr-FR")} دج</strong></div>
                  <div><small>تاريخ الطلب</small><strong><Clock3 size={16} /> {new Date(reservation.createdAt).toLocaleDateString("fr-FR")}</strong></div>
                </div>

                <div className="reservation-request-grid">
                  <div>
                    <h3>صاحب الطلب</h3>
                    <p><strong>الاسم:</strong> {reservation.customerFirstName} {reservation.customerLastName}</p>
                    <p><strong>العنوان:</strong> {reservation.customerAddress}</p>
                    <p><strong>الهاتف:</strong> {reservation.customerPhone}</p>
                    {reservation.notes && <p><strong>ملاحظة:</strong> {reservation.notes}</p>}
                  </div>
                  <div>
                    <h3>المسافرون</h3>
                    <div className="reservation-passenger-list">
                      {reservation.passengers.map((passenger) => (
                        <div key={passenger.id} className="reservation-passenger-item">
                          <strong>{passenger.firstName} {passenger.lastName}</strong>
                          <small>{passengerTypeLabels[passenger.type]} - {passenger.passportNumber}</small>
                          <small>{passenger.firstNameLatin} {passenger.lastNameLatin}</small>
                          <small>{passenger.sex === "female" ? "امرأة" : "رجل"} - {passenger.profession}</small>
                          <small>{passenger.birthPlace} - {passenger.birthDate}</small>
                          <small>صدور الجواز: {passenger.passportIssueDate} - انتهاءه: {passenger.passportExpiry}</small>
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
      </section>
    </main>
  );
}
