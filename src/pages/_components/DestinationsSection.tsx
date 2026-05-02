import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTravels, syncTravelsFromSupabase, type Travel } from "../../lib/data";

export default function DestinationsSection() {
  const [travels, setTravels] = useState<Travel[]>(() => getTravels());

  useEffect(() => {
    void syncTravelsFromSupabase().then(setTravels).catch(() => undefined);
  }, []);

  const destinations = useMemo(() => travels.map((travel, index) => ({
    name: travel.name,
    country: travel.destination,
    image: travel.image,
    trips: travel.ticketsLeft,
    tag: `${travel.date} - ${travel.duration}`,
    tall: index === 0 || index === travels.length - 1,
  })), [travels]);

  return (
    <section id="destinations" className="section pale">
      <div className="section-head">
        <div><span className="label">البرامج</span><h2>رحلات شهرية<br /><em>إلى مكة</em></h2></div>
        <p>كل برنامج يمتد من اليوم 1 إلى اليوم 30، مع تنظيم واضح ومرافقة مخصصة طوال الرحلة.</p>
      </div>
      <div className="destination-grid">
        {destinations.map((dest) => (
          <article key={dest.name} className={`destination-card ${dest.tall ? "tall" : ""}`}>
            <img src={dest.image} alt={dest.name} />
            <div className="card-shade" />
            <span className="tag">{dest.tag}</span>
            <ArrowUpRight className="corner" size={18} />
            <div><small>{dest.country}</small><h3>{dest.name}</h3><p>{dest.trips} مكان متاح</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
