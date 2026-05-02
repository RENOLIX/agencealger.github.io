import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";

const links = [
  { label: "الرئيسية", href: "/#hero" },
  { label: "البرامج", href: "/#destinations" },
  { label: "الرحلات", href: "/#tours" },
  { label: "من نحن", href: "/about" },
  { label: "اتصل بنا", href: "/contact" },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const normalMode = scrolled || location.pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <Link to="/#hero" className="brand" aria-label="Hamdi Voyage">
        <img
          src={normalMode ? "/agencealger.github.io/logo-normal.png" : "/agencealger.github.io/logo-transparent.png"}
          alt="Hamdi Voyage"
        />
      </Link>
      <nav className="desktop-links">
        {links.map((link) => <Link key={link.label} to={link.href}>{link.label}</Link>)}
      </nav>
      <div className="nav-actions">
        <a href="tel:+33123456789"><Phone size={14} /> +33 1 23 45 67 89</a>
        <a className="nav-cta" href="/agencealger.github.io/#tours">استكشف</a>
      </div>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      {open && (
        <div className="mobile-menu">
          {links.map((link) => <Link key={link.label} onClick={() => setOpen(false)} to={link.href}>{link.label}</Link>)}
        </div>
      )}
    </header>
  );
}
