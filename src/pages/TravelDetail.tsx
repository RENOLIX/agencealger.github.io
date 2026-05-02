import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, FileText, MapPin, Phone, Plane, ShieldCheck, Upload, UserPlus, Users } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { createReservationInSupabase, getTravels, reservationStatusLabels, syncTravelsFromSupabase, type PassengerType, type Reservation, type ReservationAttachment, type ReservationPassenger, type Travel } from "../lib/data";
import { useAuth } from "../components/providers/auth";

function createPassenger(type: PassengerType): ReservationPassenger {
  return {
    id: crypto.randomUUID(),
    type,
    firstName: "",
    lastName: "",
    phone: "",
    birthPlace: "",
    birthDate: "",
    passportNumber: "",
    passportExpiry: "",
    notes: "",
  };
}

export default function TravelDetail() {
  const { travelId } = useParams();
  const { user } = useAuth();
  const [travel, setTravel] = useState<Travel | null>(() => getTravels().find((item) => item.id === travelId) ?? null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [attachments, setAttachments] = useState<ReservationAttachment[]>([]);
  const [passengers, setPassengers] = useState<ReservationPassenger[]>([createPassenger("adult")]);
  const [submittedId, setSubmittedId] = useState("");

  const quantity = adults + children;
  const maxTickets = travel?.ticketsLeft ?? 0;

  useEffect(() => {
    void syncTravelsFromSupabase()
      .then((travels) => setTravel(travels.find((item) => item.id === travelId) ?? null))
      .catch(() => undefined);
  }, [travelId]);

  useEffect(() => {
    const total = adults + children;
    if (passengers.length > total) {
      setPassengers((current) => current.slice(0, total));
    }
  }, [adults, children, passengers.length]);

  const passengerSummary = useMemo(() => ({
    adultsReady: passengers.filter((passenger) => passenger.type === "adult").length,
    childrenReady: passengers.filter((passenger) => passenger.type === "child").length,
  }), [passengers]);

  const total = useMemo(() => {
    if (!travel) return 0;
    return adults * travel.price + children * travel.childPrice;
  }, [adults, children, travel]);

  if (!travel) return <Navigate to="/" replace />;
  const currentTravel = travel;

  async function readFiles(files: FileList | null) {
    if (!files?.length) return;
    const nextFiles = await Promise.all(Array.from(files).map((file) => new Promise<ReservationAttachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type,
        dataUrl: String(reader.result ?? ""),
      });
      reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
      reader.readAsDataURL(file);
    })));
    setAttachments((current) => [...current, ...nextFiles]);
  }

  function updatePassenger(passengerId: string, field: keyof ReservationPassenger, value: string) {
    setPassengers((current) => current.map((passenger) => passenger.id === passengerId ? { ...passenger, [field]: value } : passenger));
  }

  function getNextPassengerType(): PassengerType {
    const adultCount = passengers.filter((passenger) => passenger.type === "adult").length;
    return adultCount < adults ? "adult" : "child";
  }

  function addPassengerCard() {
    if (passengers.length >= quantity) return;
    setPassengers((current) => [...current, createPassenger(getNextPassengerType())]);
  }

  function removeAttachment(attachmentId: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  }

  function isPassengerComplete(passenger: ReservationPassenger) {
    return Boolean(
      passenger.firstName.trim() &&
      passenger.lastName.trim() &&
      passenger.phone.trim() &&
      passenger.birthPlace.trim() &&
      passenger.birthDate &&
      passenger.passportNumber.trim() &&
      passenger.passportExpiry,
    );
  }

  async function submitReservation(event: FormEvent) {
    event.preventDefault();
    if (quantity < 1 || quantity > currentTravel.ticketsLeft) return;
    if (passengers.length !== quantity || passengers.some((passenger) => !isPassengerComplete(passenger))) return;

    const nextReservation: Reservation = {
      id: crypto.randomUUID(),
      travelId: currentTravel.id,
      travelName: currentTravel.name,
      employeeId: user?.id ?? null,
      employeeName: user?.name ?? "Demande site",
      customerFirstName: customerFirstName.trim(),
      customerLastName: customerLastName.trim(),
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      adults,
      children,
      quantity,
      total,
      passengers,
      attachments,
      notes: generalNotes.trim(),
      status: "Nouvelle",
      createdAt: new Date().toISOString(),
    };

    await createReservationInSupabase(nextReservation);
    setSubmittedId(nextReservation.id);
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerAddress("");
    setCustomerPhone("");
    setGeneralNotes("");
    setAdults(1);
    setChildren(0);
    setPassengers([createPassenger("adult")]);
    setAttachments([]);
  }

  return (
    <main className="travel-page">
      <Navbar />

      <section className="travel-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(6, 13, 24, 0.82), rgba(6, 13, 24, 0.35)), url(${travel.banner})` }}>
        <div className="travel-hero-shell">
          <Link to="/#tours" className="travel-back"><ChevronLeft size={18} /> العودة إلى الرحلات</Link>
          <span className="label">طلب حجز</span>
          <h1>{travel.name}</h1>
          <p>{travel.longDescription}</p>
          <div className="travel-hero-meta">
            <span><MapPin size={16} /> {travel.destination}</span>
            <span><CalendarDays size={16} /> {travel.date}</span>
            <span><Users size={16} /> {travel.ticketsLeft} مكان متاح</span>
          </div>
        </div>
      </section>

      <section className="travel-overview">
        <div className="travel-media">
          <img src={travel.image} alt={travel.name} />
        </div>
        <div className="travel-summary">
          <div className="section-head compact-head">
            <div>
              <span className="label">البرنامج</span>
              <h2>تفاصيل الرحلة<br /><em>بشكل أوضح</em></h2>
            </div>
          </div>
          <p>{travel.description}</p>
          <div className="travel-chip-row">
            <span><Plane size={14} /> {travel.duration}</span>
            <span><ShieldCheck size={14} /> {travel.guides.join(" - ")}</span>
          </div>
          <div className="travel-tariffs">
            <article>
              <small>سعر البالغ</small>
              <strong>{travel.price.toLocaleString("fr-FR")} دج</strong>
            </article>
            <article>
              <small>سعر الطفل</small>
              <strong>{travel.childPrice.toLocaleString("fr-FR")} دج</strong>
            </article>
            <article>
              <small>الحالة الحالية</small>
              <strong>{reservationStatusLabels.Nouvelle}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="travel-divider">
        <div className="travel-divider-line" />
      </section>

      <section className="reservation-section">
        <div className="reservation-shell">
          <div className="reservation-copy">
            <span className="label">إتمام الطلب</span>
            <h2>إجراء حجز<br /><em>بأسلوب احترافي</em></h2>
            <p>أدخل معلومات المسافرين والوثائق الأساسية، ثم أرسل الطلب ليظهر مباشرة داخل لوحة الإدارة مع حالة واضحة ومرفقات محفوظة.</p>
          </div>

          <form className="reservation-form" onSubmit={submitReservation}>
            <div className="reservation-top-grid">
              <label>
                عدد البالغين
                <select value={adults} onChange={(event) => {
                  const nextAdults = Number(event.target.value);
                  setAdults(nextAdults);
                  if (nextAdults + children > maxTickets) setChildren(Math.max(0, maxTickets - nextAdults));
                }}>
                  {Array.from({ length: Math.max(1, maxTickets) }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>
              <label>
                عدد الأطفال
                <select value={children} onChange={(event) => setChildren(Number(event.target.value))}>
                  {Array.from({ length: Math.max(1, maxTickets - adults + 1) }, (_, index) => index).map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </label>
              <label>
                الاسم
                <input required value={customerFirstName} onChange={(event) => setCustomerFirstName(event.target.value)} placeholder="الاسم" />
              </label>
              <label>
                اللقب
                <input required value={customerLastName} onChange={(event) => setCustomerLastName(event.target.value)} placeholder="اللقب" />
              </label>
              <label className="span-two">
                العنوان
                <input required value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="العنوان الكامل" />
              </label>
              <label>
                رقم الهاتف
                <input required value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="+213 ..." />
              </label>
            </div>

            <div className="reservation-line" />

            <div className="traveler-header">
              <div>
                <h3>معلومات المسافرين</h3>
                <p>{passengers.length} / {quantity} مسافر مضاف</p>
              </div>
              <button type="button" className="secondary-button" onClick={addPassengerCard} disabled={passengers.length >= quantity}>
                <UserPlus size={16} /> إضافة مسافر
              </button>
            </div>

            <div className="traveler-card-list">
              {passengers.map((passenger, index) => (
                <article key={passenger.id} className="traveler-card">
                  <div className="traveler-card-head">
                    <strong>المسافر {index + 1}</strong>
                    <span>{passenger.type === "adult" ? "بالغ" : "طفل"}</span>
                  </div>
                  <div className="traveler-grid">
                    <label>
                      الاسم
                      <input required value={passenger.firstName} onChange={(event) => updatePassenger(passenger.id, "firstName", event.target.value)} />
                    </label>
                    <label>
                      اللقب
                      <input required value={passenger.lastName} onChange={(event) => updatePassenger(passenger.id, "lastName", event.target.value)} />
                    </label>
                    <label>
                      رقم الهاتف
                      <input required value={passenger.phone} onChange={(event) => updatePassenger(passenger.id, "phone", event.target.value)} />
                    </label>
                    <label>
                      مكان الميلاد
                      <input required value={passenger.birthPlace} onChange={(event) => updatePassenger(passenger.id, "birthPlace", event.target.value)} />
                    </label>
                    <label>
                      تاريخ الميلاد
                      <input required type="date" value={passenger.birthDate} onChange={(event) => updatePassenger(passenger.id, "birthDate", event.target.value)} />
                    </label>
                    <label>
                      رقم جواز السفر
                      <input required value={passenger.passportNumber} onChange={(event) => updatePassenger(passenger.id, "passportNumber", event.target.value)} />
                    </label>
                    <label>
                      انتهاء جواز السفر
                      <input required type="date" value={passenger.passportExpiry} onChange={(event) => updatePassenger(passenger.id, "passportExpiry", event.target.value)} />
                    </label>
                    <label className="span-two">
                      ملاحظة خاصة
                      <textarea value={passenger.notes} onChange={(event) => updatePassenger(passenger.id, "notes", event.target.value)} placeholder="معلومة مهمة عن هذا المسافر" />
                    </label>
                  </div>
                </article>
              ))}
            </div>

            <div className="reservation-line" />

            <div className="documents-block">
              <div className="traveler-header">
                <div>
                  <h3>الصور والوثائق</h3>
                  <p>يمكنك رفع صور أو ملفات داعمة لطلب الحجز.</p>
                </div>
                <label className="upload-cta">
                  <Upload size={16} /> رفع ملفات
                  <input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={(event) => void readFiles(event.target.files)} />
                </label>
              </div>
              <div className="attachment-list">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    <FileText size={16} />
                    <span>{attachment.name}</span>
                    <button type="button" onClick={() => removeAttachment(attachment.id)}>حذف</button>
                  </div>
                ))}
              </div>
            </div>

            <label className="span-two">
              ملاحظة عامة
              <textarea value={generalNotes} onChange={(event) => setGeneralNotes(event.target.value)} placeholder="أي تعليمات إضافية تخص هذه المجموعة" />
            </label>

            <div className="reservation-recap">
              <div>
                <span>الرحلة</span>
            <strong>{currentTravel.name}</strong>
              </div>
              <div>
                <span>المقاعد المطلوبة</span>
                <strong>{quantity}</strong>
              </div>
              <div>
                <span>الإجمالي</span>
                <strong>{total.toLocaleString("fr-FR")} دج</strong>
              </div>
              <div>
                <span>المرفقات</span>
                <strong>{attachments.length}</strong>
              </div>
            </div>

            <button className="primary-reservation-button" disabled={quantity > currentTravel.ticketsLeft}>
              <CheckCircle2 size={18} /> طلب الحجز
            </button>

            {submittedId && (
              <div className="reservation-success">
                <strong>تم إرسال الطلب بنجاح</strong>
                <span>رقم الطلب: {submittedId}</span>
              </div>
            )}

            {quantity > currentTravel.ticketsLeft && (
              <p className="reservation-warning">الكمية المطلوبة أكبر من الأماكن المتاحة حاليا.</p>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
