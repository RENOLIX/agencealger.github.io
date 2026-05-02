import { ArrowUpRight, Compass, Gem, Globe2, Plane, Sparkles, UsersRound } from "lucide-react";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";

const values = [
  { icon: Compass, title: "برنامج واضح", text: "كل رحلة تبدأ في اليوم 1 وتنتهي في اليوم 30 مع تفاصيل سهلة الفهم." },
  { icon: Gem, title: "اختيار مريح", text: "فنادق وخدمات نقل ووجبات مختارة لتناسب المعتمرين والعائلات." },
  { icon: UsersRound, title: "فريق قريب", text: "الموظفون يتابعون الحجوزات والمرشدون يرافقون المجموعة طوال الرحلة." },
];

export default function About() {
  return (
    <main className="static-page about-page">
      <Navbar />
      <section className="about-hero">
        <div className="about-copy">
          <span className="label">من نحن</span>
          <h1>وكالة تنظم رحلات العمرة إلى مكة باهتمام ووضوح.</h1>
          <p>Hamdi Voyage تجمع بين الخبرة، المتابعة الدقيقة، ولوحة إدارة حديثة لتسهيل الحجز وتنظيم الرحلات الشهرية.</p>
          <a href="/agencealger.github.io/#tours">عرض الرحلات <ArrowUpRight size={17} /></a>
        </div>
        <div className="about-collage">
          <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900" alt="مكة المكرمة" />
          <img src="https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700" alt="الحرم الشريف" />
          <div><Sparkles /><strong>18 سنة</strong><span>خبرة في السفر</span></div>
        </div>
      </section>

      <section className="about-values">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={26} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="about-story">
        <div>
          <span className="label">طريقتنا</span>
          <h2>من الطلب إلى الانطلاق، كل شيء منظم.</h2>
        </div>
        <div className="timeline">
          {[
            ["01", "الاستماع", "عدد المسافرين، الميزانية، الشهر المناسب، واحتياجات العائلة."],
            ["02", "تحضير البرنامج", "الطيران، الفندق، النقل، الوجبات، وأسماء المرشدين."],
            ["03", "المتابعة", "الحجز، الوثائق، المساعدة، وسجل واضح داخل الإدارة."],
          ].map(([n, title, text]) => (
            <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="about-band">
        <Plane />
        <div className="about-band-track">
          <h2>6 رحلات شهرية إلى مكة، وهدف واحد: أن يشعر العميل أن كل شيء تحت السيطرة.</h2>
          <h2 aria-hidden="true">6 رحلات شهرية إلى مكة، وهدف واحد: أن يشعر العميل أن كل شيء تحت السيطرة.</h2>
        </div>
        <Globe2 />
      </section>
      <Footer />
    </main>
  );
}
