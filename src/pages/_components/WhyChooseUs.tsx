import { BadgeCheck, BellRing, Crown, Globe2, Route, ShieldCheck } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "رحلات آمنة", desc: "ملفات مضبوطة، حجوزات واضحة، ومتابعة حتى العودة.", color: "coral" },
  { icon: BellRing, title: "دعم دائم", desc: "فريق متاح لمرافقة كل عميل في الوقت المناسب.", color: "blue" },
  { icon: BadgeCheck, title: "مرشدون موثوقون", desc: "أسماء المرشدين تظهر في كل برنامج ويمكن تعديلها من الإدارة.", color: "green" },
  { icon: Globe2, title: "تنظيم كامل", desc: "فنادق، نقل، وجبات، ومرافقة داخل برنامج واحد.", color: "violet" },
  { icon: Route, title: "رحلة من 1 إلى 30", desc: "كل شهر برنامج واضح المدة وسهل الحجز.", color: "amber" },
  { icon: Crown, title: "خدمة مميزة", desc: "تفاصيل صغيرة تجعل الرحلة أكثر راحة واطمئنانا.", color: "rose" },
];

export default function WhyChooseUs() {
  return (
    <section id="why" className="why">
      <div className="feature-grid">
        {features.map(({ icon: Icon, title, desc, color }) => (
          <article key={title} className={`feature ${color}`}>
            <span><Icon size={23} /></span>
            <h3>{title}</h3>
            <p>{desc}</p>
          </article>
        ))}
      </div>

      <div className="why-left">
        <span className="label">لماذا نحن</span>
        <h2>تنظيم موثوق<br />لرحلات العمرة<br /><em>منذ 2006</em></h2>
        <p>وكالة تهتم بتفاصيل الرحلة من أول اتصال حتى عودة العميل، مع لوحة إدارة سهلة للحجوزات والبرامج.</p>
        <div className="why-stats">
          <div><strong>12K+</strong><span>عميل</span></div>
          <div><strong>6</strong><span>رحلات</span></div>
          <div><strong>4.9</strong><span>تقييم</span></div>
        </div>
      </div>
    </section>
  );
}
