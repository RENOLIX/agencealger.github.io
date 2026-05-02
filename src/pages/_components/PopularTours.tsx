import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { benefitIcons, benefitLabels, categoryLabels, formatArabicMonthRange, getTravels, syncTravelsFromSupabase, type Travel } from "../../lib/data";

const categories = ["Tous", "Plage", "Aventure", "Culture", "Luxe"] as const;

export default function PopularTours() {
  const [active, setActive] = useState<(typeof categories)[number]>("Tous");
  const [travels, setTravels] = useState<Travel[]>(() => getTravels());
  const filtered = useMemo(() => active === "Tous" ? travels : travels.filter((tour) => tour.category === active), [active, travels]);

  useEffect(() => {
    void syncTravelsFromSupabase().then(setTravels).catch(() => undefined);
  }, []);

  return (
    <section id="tours" className="section pale">
      <div className="section-head tours-head">
        <div><span className="label">رحلاتنا</span><h2>برامج العمرة<br /><em>المتاحة</em></h2></div>
        <div className="filters">{categories.map((cat) => <button className={active === cat ? "active" : ""} onClick={() => setActive(cat)} key={cat}>{categoryLabels[cat]}</button>)}</div>
      </div>
      <div className="tour-grid">
        {filtered.map((tour) => (
          <article className="tour-card" key={tour.id}>
            <div className="tour-image">
              <img src={tour.image} alt={tour.name} />
              <span className="duration"><Clock size={12} /> {tour.duration}</span>
              <span className="place"><MapPin size={13} /> {formatArabicMonthRange(tour.date, tour.duration)}</span>
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
              <p className="tour-desc">المرشدون: {tour.guides.join(" - ")}</p>
              <div className="tour-foot">
                <div><strong>{tour.price.toLocaleString("fr-FR")} دج</strong><span>للبالغ</span></div>
                <span className={tour.ticketsLeft < 8 ? "low-stock" : ""}><Users size={13} /> {tour.ticketsLeft}/{tour.ticketsTotal} مكان</span>
              </div>
              <Link className="reserve-link" to={`/voyages/${tour.id}`}>
                <span>عرض تفاصيل الرحلة</span>
                <small><CalendarDays size={13} /> فتح صفحة البرنامج الكاملة</small>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
