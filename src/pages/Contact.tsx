import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { readStore, writeStore, type ContactMessage } from "../lib/data";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    destination: "",
    message: "",
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextMessage: ContactMessage = {
      id: crypto.randomUUID(),
      ...form,
      status: "Nouveau",
      createdAt: new Date().toISOString(),
    };
    const messages = readStore<ContactMessage[]>("hv-contact-messages", []);
    writeStore("hv-contact-messages", [nextMessage, ...messages]);
    setForm({ fullName: "", phone: "", email: "", destination: "", message: "" });
    setSent(true);
  }

  return (
    <main className="static-page contact-page">
      <Navbar />
      <section className="contact-hero">
        <div>
          <span className="label">Contact</span>
          <h1>Parlez-nous du prochain depart.</h1>
          <p>Un conseiller peut preparer une proposition, verifier les disponibilites ou accompagner une reservation en agence.</p>
        </div>
        <div className="contact-card">
          <ShieldCheck />
          <strong>Reponse rapide</strong>
          <span>Moins de 24h ouvrées pour les demandes completes.</span>
        </div>
      </section>

      <section className="contact-layout">
        <form className="contact-form" onSubmit={submit}>
          <div>
            <label>Nom complet<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Votre nom" /></label>
            <label>Telephone<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+33 ..." /></label>
          </div>
          <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="vous@email.com" /></label>
          <label>Destination souhaitee<input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} placeholder="Bali, Maldives, Japon..." /></label>
          <label>Message<textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Dates, nombre de voyageurs, budget, style de voyage..." /></label>
          <button><Send size={17} /> Envoyer la demande</button>
          {sent && <p className="contact-success"><CheckCircle size={17} /> Message envoye dans l'espace admin.</p>}
        </form>

        <aside className="contact-info">
          {[
            { icon: Phone, title: "Telephone", text: "+33 1 23 45 67 89" },
            { icon: Mail, title: "Email", text: "contact@hamdi-voyage.com" },
            { icon: MapPin, title: "Agence", text: "12 Av. des Champs-Elysees, Paris" },
            { icon: CalendarDays, title: "Horaires", text: "Lun - Sam, 09:00 - 19:00" },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}><Icon size={21} /><div><strong>{title}</strong><span>{text}</span></div></article>
          ))}
          <div className="whatsapp-box"><MessageCircle /><strong>Besoin d'une reponse directe ?</strong><p>Les employes peuvent finaliser une reservation depuis l'espace admin apres validation client.</p></div>
        </aside>
      </section>
      <Footer />
    </main>
  );
}
