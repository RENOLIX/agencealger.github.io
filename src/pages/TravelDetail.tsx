import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, FileText, Landmark, Luggage, MapPin, Plane, Ticket, Upload, UserPlus, Users } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import {
  benefitIcons,
  benefitLabels,
  categoryLabels,
  createReservationInSupabase,
  formatArabicDate,
  getTravels,
  syncTravelsFromSupabase,
  type PassengerType,
  type Reservation,
  type ReservationAttachment,
  type ReservationPassenger,
  type Travel,
} from "../lib/data";
import { useAuth } from "../components/providers/auth";

function createPassenger(type: PassengerType): ReservationPassenger {
  return {
    id: crypto.randomUUID(),
    type,
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    fatherName: "",
    motherName: "",
    birthPlace: "",
    birthDate: "",
    passportNumber: "",
    passportExpiry: "",
    notes: "",
  };
}

export default function TravelDetail() {
  const { travelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminFlow = location.pathname.startsWith("/admin/");
  const [travel, setTravel] = useState<Travel | null>(() => getTravels().find((item) => item.id === travelId) ?? null);
  const [activeImage, setActiveImage] = useState(0);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [generalNotes, setGeneralNotes] = useState("");
  const [attachments, setAttachments] = useState<ReservationAttachment[]>([]);
  const [passengers, setPassengers] = useState<ReservationPassenger[]>([createPassenger("adult")]);
  const [submittedId, setSubmittedId] = useState("");
  const [submitError, setSubmitError] = useState("");

  const quantity = adults + children;
  const maxTickets = travel?.ticketsLeft ?? 0;

  useEffect(() => {
    void syncTravelsFromSupabase()
      .then((travels) => setTravel(travels.find((item) => item.id === travelId) ?? null))
      .catch(() => undefined);
  }, [travelId]);

  useEffect(() => {
    setActiveImage(0);
  }, [travelId]);

  useEffect(() => {
    const total = adults + children;
    if (passengers.length > total) {
      setPassengers((current) => current.slice(0, total));
    }
  }, [adults, children, passengers.length]);

  const total = useMemo(() => {
    if (!travel) return 0;
    const childUnit = travel.hasChildPrice ? Number(travel.childPrice ?? 0) : travel.price;
    return adults * travel.price + children * childUnit;
  }, [adults, children, travel]);

  if (!travel) return <Navigate to="/" replace />;
  if (isAdminFlow && !user) return <Navigate to="/auth" replace />;
  const currentTravel = travel;

  const gallery = currentTravel.images.length > 0 ? currentTravel.images : [currentTravel.image];
  const currentImage = gallery[Math.min(activeImage, gallery.length - 1)] ?? currentTravel.image;

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
      passenger.address.trim() &&
      passenger.fatherName.trim() &&
      passenger.motherName.trim() &&
      passenger.birthPlace.trim() &&
      passenger.birthDate &&
      passenger.passportNumber.trim() &&
      passenger.passportExpiry,
    );
  }

  async function submitReservation(event: FormEvent) {
    event.preventDefault();
    setSubmitError("");
    if (quantity < 1 || quantity > currentTravel.ticketsLeft) return;
    if (passengers.length !== quantity || passengers.some((passenger) => !isPassengerComplete(passenger))) return;
    const primaryPassenger = passengers[0];

    const nextReservation: Reservation = {
      id: crypto.randomUUID(),
      travelId: currentTravel.id,
      travelName: currentTravel.name,
      employeeId: user?.id ?? null,
      employeeName: user?.name ?? "Demande interne",
      customerFirstName: primaryPassenger.firstName.trim(),
      customerLastName: primaryPassenger.lastName.trim(),
      customerAddress: primaryPassenger.address.trim(),
      customerPhone: primaryPassenger.phone.trim(),
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

    try {
      await createReservationInSupabase(nextReservation);
      setSubmittedId(nextReservation.id);
      setGeneralNotes("");
      setAdults(1);
      setChildren(0);
      setPassengers([createPassenger("adult")]);
      setAttachments([]);
    } catch {
      setSubmitError("تعذر إرسال الطلب حاليا، حاول مرة أخرى.");
    }
  }

  const travelInfoContent = (
    <section className="travel-booking-shell">
      <div className="travel-booking-card">
        <div className="travel-booking-gallery">
          <div className="travel-gallery-main">
            <img src={currentImage} alt={travel.name} />
          </div>
          {gallery.length > 1 && (
            <div className="travel-gallery-thumbs">
              {gallery.map((image, index) => (
                <button key={`${image.slice(0, 18)}-${index}`} type="button" className={index === activeImage ? "active" : ""} onClick={() => setActiveImage(index)}>
                  <img src={image} alt={`${travel.name}-${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="travel-booking-summary">
          <Link to={isAdminFlow ? "/admin/reservations/new" : "/#tours"} className="travel-back inline-back">
            <ChevronLeft size={18} /> {isAdminFlow ? "العودة إلى اختيار الرحلات" : "العودة إلى الرحلات"}
          </Link>

          <span className="label">{isAdminFlow ? "ملف داخلي" : "برنامج الرحلة"}</span>
          <h1>{travel.name}</h1>
          <p className="travel-summary-copy">{travel.description}</p>

          <div className="travel-meta-list">
            <span><MapPin size={15} /> {travel.destination} - {travel.country}</span>
            <span><CalendarDays size={15} /> {travel.departures?.length ? `${travel.departures.length} مواعيد انطلاق` : formatArabicDate(travel.date)}</span>
            <span><Users size={15} /> {travel.guides.length} مرشد</span>
          </div>

          <div className="travel-inline-facts vertical-facts">
            <div><CalendarDays size={16} /><small>المدة</small><strong>{travel.duration}</strong></div>
            <div><Landmark size={16} /><small>الفئة</small><strong>{categoryLabels[travel.category]}</strong></div>
            <div><Plane size={16} /><small>الرحلة الجوية</small><strong>{travel.flightMode === "escale" ? "مع توقف" : "مباشرة"}</strong></div>
            <div><Ticket size={16} /><small>الشركة</small><strong>{(travel.airlines ?? ["Air Algerie"]).join(" - ")}</strong></div>
            <div><Users size={16} /><small>سعر البالغ (ADT)</small><strong>{travel.price.toLocaleString("fr-FR")} دج</strong></div>
            {travel.hasChildPrice && <div><Users size={16} /><small>سعر الطفل (CLD)</small><strong>{Number(travel.childPrice ?? 0).toLocaleString("fr-FR")} دج</strong></div>}
            {travel.hasBabyPrice && <div><Users size={16} /><small>سعر الرضيع (INF)</small><strong>{Number(travel.babyPrice ?? 0).toLocaleString("fr-FR")} دج</strong></div>}
            <div><Luggage size={16} /><small>المقاعد المتوفرة</small><strong>{travel.ticketsLeft}</strong></div>
          </div>

          {travel.departures && travel.departures.length > 0 && (
            <div className="travel-subsection">
              <h2>مواعيد الانطلاق</h2>
              <div className="travel-chip-grid">
                {travel.departures.map((departure) => <span key={departure}>{formatArabicDate(departure)}</span>)}
              </div>
            </div>
          )}

          <div className="travel-subsection">
            <h2>الخدمات المشمولة</h2>
            <div className="travel-feature-list">
              {travel.benefits.map((benefit) => {
                const Icon = benefitIcons[benefit];
                if (!Icon) return null;
                return (
                  <div key={benefit} className="travel-feature-item">
                    <span><Icon size={16} /></span>
                    <strong>{benefitLabels[benefit] ?? benefit}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="travel-subsection">
            <h2>وصف الرحلة</h2>
            <p>{travel.longDescription}</p>
          </div>

          <div className="travel-subsection">
            <h2>فريق المرافقة</h2>
            <div className="travel-chip-grid">
              {travel.guides.map((guide) => <span key={guide}>{guide}</span>)}
            </div>
          </div>

          {travel.hotels && travel.hotels.length > 0 && (
            <div className="travel-subsection">
              <h2>الفنادق</h2>
              <div className="travel-hotels-grid">
                {travel.hotels.map((hotel) => (
                  <article key={hotel.id} className="travel-hotel-card">
                    <strong>{hotel.name}</strong>
                    {hotel.photos.length > 0 && (
                      <div className="travel-hotel-photos">
                        {hotel.photos.map((photo, index) => (
                          <img key={`${hotel.id}-${index}`} src={photo} alt={`${hotel.name}-${index + 1}`} />
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {!isAdminFlow && (
            <div className="travel-admin-only-note">
              الحجز يتم من مساحة الموظفين داخل الإدارة فقط. هذه الصفحة مخصصة لعرض البرنامج والتفاصيل.
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const reservationContent = isAdminFlow && (
    <section className="reservation-section reservation-section-admin">
      <div className="reservation-shell">
        <div className="reservation-copy">
          <span className="label">إتمام الحجز</span>
          <h2>ملف حجز داخلي</h2>
          <p>بعد الإرسال سيظهر الطلب مباشرة في صفحة الحجوزات للموافقة، ويُنقص المخزون فقط بعد موافقة المدير.</p>
        </div>

        <form className="reservation-form" onSubmit={submitReservation}>
          <div className="reservation-top-grid reservation-top-grid-simple">
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
                  <label>الاسم<input required value={passenger.firstName} onChange={(event) => updatePassenger(passenger.id, "firstName", event.target.value)} /></label>
                  <label>اللقب<input required value={passenger.lastName} onChange={(event) => updatePassenger(passenger.id, "lastName", event.target.value)} /></label>
                  <label>اسم الأب<input required value={passenger.fatherName} onChange={(event) => updatePassenger(passenger.id, "fatherName", event.target.value)} /></label>
                  <label>اسم الأم<input required value={passenger.motherName} onChange={(event) => updatePassenger(passenger.id, "motherName", event.target.value)} /></label>
                  <label>رقم الهاتف<input required value={passenger.phone} onChange={(event) => updatePassenger(passenger.id, "phone", event.target.value)} /></label>
                  <label className="span-two">العنوان<input required value={passenger.address} onChange={(event) => updatePassenger(passenger.id, "address", event.target.value)} /></label>
                  <label>مكان الميلاد<input required value={passenger.birthPlace} onChange={(event) => updatePassenger(passenger.id, "birthPlace", event.target.value)} /></label>
                  <label>تاريخ الميلاد<input required type="date" value={passenger.birthDate} onChange={(event) => updatePassenger(passenger.id, "birthDate", event.target.value)} /></label>
                  <label>رقم جواز السفر<input required value={passenger.passportNumber} onChange={(event) => updatePassenger(passenger.id, "passportNumber", event.target.value)} /></label>
                  <label>انتهاء جواز السفر<input required type="date" value={passenger.passportExpiry} onChange={(event) => updatePassenger(passenger.id, "passportExpiry", event.target.value)} /></label>
                  <label className="span-two">ملاحظة خاصة<textarea value={passenger.notes} onChange={(event) => updatePassenger(passenger.id, "notes", event.target.value)} /></label>
                </div>
              </article>
            ))}
          </div>

          <div className="reservation-line" />

          <div className="documents-block">
            <div className="traveler-header">
              <div>
                <h3>الصور والوثائق</h3>
                <p>رفع مباشر من الهاتف أو الحاسوب.</p>
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
            <textarea value={generalNotes} onChange={(event) => setGeneralNotes(event.target.value)} />
          </label>

          <div className="reservation-recap">
            <div><span>الرحلة</span><strong>{travel.name}</strong></div>
            <div><span>المقاعد المطلوبة</span><strong>{quantity}</strong></div>
            <div><span>الإجمالي</span><strong>{total.toLocaleString("fr-FR")} دج</strong></div>
            <div><span>المرفقات</span><strong>{attachments.length}</strong></div>
          </div>

          <button className="primary-reservation-button" disabled={quantity > travel.ticketsLeft}>
            <CheckCircle2 size={18} /> إرسال طلب الحجز
          </button>

          {submittedId && (
            <div className="reservation-success">
              <strong>تم إرسال الطلب بنجاح</strong>
              <span>رقم الطلب: {submittedId}</span>
              <button type="button" className="secondary-button" onClick={() => navigate("/admin")}>العودة إلى السجل</button>
            </div>
          )}

          {submitError && <p className="reservation-warning">{submitError}</p>}
          {quantity > travel.ticketsLeft && (
            <p className="reservation-warning">الكمية المطلوبة أكبر من الأماكن المتاحة حاليا.</p>
          )}
        </form>
      </div>
    </section>
  );

  const content = (
    <>
      <section className="travel-hero travel-hero-compact" style={{ backgroundImage: `linear-gradient(100deg, rgba(10, 17, 26, 0.88), rgba(10, 17, 26, 0.48)), url(${travel.banner || travel.image})` }}>
        <div className="travel-hero-shell">
          <span className="label">{isAdminFlow ? "إنشاء حجز داخلي" : "رحلة عمرة"}</span>
          <h1>{travel.name}</h1>
          <div className="travel-hero-meta">
            <span><MapPin size={16} /> {travel.destination}</span>
            <span><CalendarDays size={16} /> {formatArabicDate(travel.date)}</span>
            <span><Users size={16} /> {travel.ticketsLeft} مكان متاح</span>
          </div>
        </div>
      </section>
      {travelInfoContent}
      {reservationContent}
    </>
  );

  if (isAdminFlow) {
    return <main className="travel-page travel-page-admin">{content}</main>;
  }

  return (
    <main className="travel-page">
      <Navbar />
      {content}
      <Footer />
    </main>
  );
}
