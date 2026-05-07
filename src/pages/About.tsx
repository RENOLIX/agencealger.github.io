import { ArrowUpRight, Compass, Gem, Globe2, Plane, UsersRound } from "lucide-react";
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
          <a href="/#tours">عرض الرحلات <ArrowUpRight size={17} /></a>
        </div>
        <div className="about-collage about-photo-story">
          <img className="about-photo-wide" src="/about/team-airport.jpeg" alt="فريق الوكالة في المطار" />
          <img className="about-photo-portrait" src="/about/award-portrait.jpeg" alt="تكريم في منتدى العمرة والزيارة" />
          <img className="about-photo-soft" src="/about/umrah-forum.jpeg" alt="مشاركة في منتدى العمرة والزيارة" />
          <img className="about-photo-soft" src="/about/field-team.jpeg" alt="فريق مرافقة ميداني" />
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
          <h2 className="mobile-loop-copy" aria-hidden="true">6 رحلات شهرية إلى مكة، وهدف واحد: أن يشعر العميل أن كل شيء تحت السيطرة.</h2>
        </div>
        <Globe2 />
      </section>
      <Footer />
    </main>
  );
}
