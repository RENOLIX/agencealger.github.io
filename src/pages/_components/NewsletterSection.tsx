import { useState } from "react";
import { CheckCircle, Send } from "lucide-react";

export default function NewsletterSection() {
  const [done, setDone] = useState(false);
  return (
    <section className="newsletter">
      <div>
        <span className="label">النشرة</span>
        <h2>عروض العمرة<br /><em>قبل الجميع</em></h2>
        <p>تواريخ الرحلات، الأماكن المتاحة، والعروض الخاصة مباشرة في بريدك.</p>
        {!done ? (
          <form onSubmit={(event) => { event.preventDefault(); setDone(true); }}>
            <input type="email" required placeholder="you@email.com" />
            <button><Send size={15} /> تسجيل</button>
          </form>
        ) : <div className="success"><CheckCircle /> تم التسجيل، شكرا لك!</div>}
      </div>
    </section>
  );
}
