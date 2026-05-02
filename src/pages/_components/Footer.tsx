import { Camera, Globe, Mail, MapPin, MessageCircle, Phone, Plane, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="contact-strip">
        <span><Phone size={14} /> +33 1 23 45 67 89</span>
        <span><Mail size={14} /> contact@hamdi-voyage.com</span>
        <span><MapPin size={14} /> 12 Av. des Champs-Elysees, Paris</span>
      </div>
      <div className="footer-grid">
        <div>
          <img className="footer-logo" src="/agencealger.github.io/logo-transparent.png" alt="Hamdi Voyage" />
          <p>منذ 2006، ننظم رحلات عمرة مريحة وواضحة إلى مكة المكرمة.</p>
          <div className="socials"><Share2 /><Camera /><MessageCircle /><Globe /></div>
        </div>
        <div><h4>البرامج</h4>{["عمرة يونيو", "عمرة يوليو", "عمرة أغسطس", "عمرة سبتمبر", "عمرة أكتوبر", "عمرة نوفمبر"].map((x) => <a href="#destinations" key={x}>{x}</a>)}</div>
        <div><h4>الخدمات</h4>{["تذاكر الطيران", "الفندق", "النقل", "الوجبات", "المرشدون", "متابعة الحجز"].map((x) => <a href="#tours" key={x}>{x}</a>)}</div>
        <div><h4>الثقة</h4><p><Plane size={15} /> تنظيم رحلات شهرية</p><p><Globe size={15} /> مرافقة للمعتمرين</p><strong>98% رضا العملاء</strong></div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Hamdi Voyage. كل الحقوق محفوظة.</div>
    </footer>
  );
}
