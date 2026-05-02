import { ArrowUpRight } from "lucide-react";
import { destinations } from "../../lib/data";

export default function DestinationsSection() {
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
