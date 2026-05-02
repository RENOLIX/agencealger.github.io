import { useState } from "react";
import { Calendar, MapPin, Search, Users } from "lucide-react";

const slides = [
  { image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920", label: "مكة المكرمة", title: "عمرة كل شهر", sub: "رحلات منظمة من 1 إلى 30 مع مرشدين وخدمة كاملة" },
  { image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920", label: "الحرم الشريف", title: "رحلة مطمئنة", sub: "إقامة، نقل، متابعة، وبرنامج واضح من البداية إلى العودة" },
  { image: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920", label: "السعودية", title: "مرافقة موثوقة", sub: "مرشدون معكم في كل خطوة وخدمة مناسبة للعائلات" },
];

export default function HeroSection() {
  const [slide, setSlide] = useState(0);
  const item = slides[slide];

  return (
    <section id="hero" className="hero">
      {slides.map((s, index) => <img key={s.title} src={s.image} alt="" className={`hero-bg ${index === slide ? "active" : ""}`} />)}
      <div className="hero-overlay" />
      <div className="hero-dots">{slides.map((_, index) => <button key={index} className={index === slide ? "active" : ""} onClick={() => setSlide(index)} />)}</div>
      <div className="hero-content">
        <span className="eyebrow">{item.label}</span>
        <h1>{item.title}</h1>
        <p>{item.sub}</p>
        <div className="stats">
          <div><strong>6</strong><span>رحلات شهرية</span></div>
          <div><strong>1-30</strong><span>برنامج كامل</span></div>
          <div><strong>18 سنة</strong><span>خبرة</span></div>
        </div>
        <form className="search-bar">
          <label><MapPin size={17} /><span>الوجهة<input placeholder="مكة المكرمة" /></span></label>
          <label><Calendar size={17} /><span>تاريخ الانطلاق<input type="date" aria-label="تاريخ الانطلاق" /></span></label>
          <label><Users size={17} /><span>المسافرون<select defaultValue="2"><option>1 شخص</option><option value="2">2 أشخاص</option><option>3 أشخاص</option><option>4+ أشخاص</option></select></span></label>
          <button type="button"><Search size={17} /> بحث</button>
        </form>
      </div>
    </section>
  );
}
