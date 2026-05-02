import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const testimonials = [
  ["أمينة بن سالم", "الجزائر", "عمرة شهر يونيو", "تنظيم ممتاز من أول يوم. المرشد كان حاضرا معنا في كل التفاصيل.", "AB"],
  ["محمد قادري", "وهران", "عمرة شهر يوليو", "الإقامة قريبة والخدمة واضحة. الحجز من الوكالة كان سهلا ومطمئنا.", "MQ"],
  ["سارة حميدي", "قسنطينة", "عمرة شهر سبتمبر", "رحلة هادئة ومناسبة للعائلة. كل شيء كان منظما من 1 إلى 30.", "SH"],
  ["ياسين مرابط", "عنابة", "عمرة شهر نوفمبر", "أعجبني وضوح البرنامج وأسماء المرشدين قبل السفر. تجربة موثوقة.", "YM"],
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const item = testimonials[current];
  return (
    <section className="testimonials">
      <div className="section-head">
        <div><span className="label">آراء العملاء</span><h2>ماذا يقول<br /><em>المعتمرون</em></h2></div>
        <div className="testimonial-nav">
          <button onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)}><ChevronLeft /></button>
          <span>{current + 1} / {testimonials.length}</span>
          <button onClick={() => setCurrent((current + 1) % testimonials.length)}><ChevronRight /></button>
        </div>
      </div>
      <div className="quote">
        <div className="quote-mark"><Quote size={26} /></div>
        <div className="quote-stars">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={18} />)}</div>
        <blockquote>"{item[3]}"</blockquote>
        <div className="traveler">
          <span>{item[4]}</span>
          <div><strong>{item[0]}</strong><small>{item[1]} - {item[2]}</small></div>
        </div>
        <div className="testimonial-rail">
          {testimonials.map((entry, index) => <button key={entry[0]} className={index === current ? "active" : ""} onClick={() => setCurrent(index)}>{entry[4]}</button>)}
        </div>
      </div>
    </section>
  );
}
