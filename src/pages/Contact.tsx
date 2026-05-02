import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { createContactMessageInSupabase, type ContactMessage } from "../lib/data";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", destination: "", message: "" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextMessage: ContactMessage = {
      id: crypto.randomUUID(),
      ...form,
      status: "Nouveau",
      createdAt: new Date().toISOString(),
    };
    await createContactMessageInSupabase(nextMessage);
    setForm({ fullName: "", phone: "", email: "", destination: "", message: "" });
    setSent(true);
  }

  return (
    <main className="static-page contact-page">
      <Navbar />
      <section className="contact-hero">
        <div>
          <span className="label">اتصل بنا</span>
          <h1>أخبرنا عن رحلتك القادمة إلى مكة.</h1>
          <p>يمكن لمستشار من الوكالة تحضير العرض، التحقق من الأماكن، أو متابعة الحجز داخل الإدارة.</p>
        </div>
        <div className="contact-card">
          <ShieldCheck />
          <strong>رد سريع</strong>
          <span>أقل من 24 ساعة عمل للطلبات الكاملة.</span>
        </div>
      </section>

      <section className="contact-layout">
        <form className="contact-form" onSubmit={submit}>
          <div>
            <label>الاسم الكامل<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="اسمك" /></label>
            <label>الهاتف<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+213 ..." /></label>
          </div>
          <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@email.com" /></label>
          <label>الشهر المطلوب<input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} placeholder="يونيو، يوليو، أغسطس..." /></label>
          <label>الرسالة<textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="عدد المسافرين، الميزانية، نوع الغرفة، أي ملاحظات..." /></label>
          <button><Send size={17} /> إرسال الطلب</button>
          {sent && <p className="contact-success"><CheckCircle size={17} /> تم إرسال الرسالة إلى مساحة الإدارة.</p>}
        </form>

        <aside className="contact-info">
          {[
            { icon: Phone, title: "الهاتف", text: "+33 1 23 45 67 89" },
            { icon: Mail, title: "Email", text: "contact@hamdi-voyage.com" },
            { icon: MapPin, title: "الوكالة", text: "12 Av. des Champs-Elysees, Paris" },
            { icon: CalendarDays, title: "الأوقات", text: "الاثنين - السبت، 09:00 - 19:00" },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}><Icon size={21} /><div><strong>{title}</strong><span>{text}</span></div></article>
          ))}
          <div className="whatsapp-box"><MessageCircle /><strong>تحتاج ردا مباشرا؟</strong><p>يمكن للموظفين تأكيد الحجز من مساحة الإدارة بعد موافقة العميل.</p></div>
        </aside>
      </section>
      <Footer />
    </main>
  );
}
