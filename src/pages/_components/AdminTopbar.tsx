import { LogOut, Menu, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { User } from "../../lib/data";
import { withAppBase } from "../../lib/app-base";

type NavItem = {
  key: string;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
  visible?: boolean;
};

type AdminTopbarProps = {
  user: User;
  items: NavItem[];
  onCreateReservation: () => void;
  onLogout: () => void;
  onOpenApprovals?: () => void;
  approvalsBadge?: number;
};

export default function AdminTopbar({ user, items, onCreateReservation, onLogout, onOpenApprovals, approvalsBadge = 0 }: AdminTopbarProps) {
  const [open, setOpen] = useState(false);
  const visibleItems = items.filter((item) => item.visible !== false);

  function run(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <header className={`admin-appbar ${open ? "menu-open" : ""}`}>
      {open && <button type="button" className="admin-menu-backdrop" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} />}
      <div className="admin-appbar-brand">
        <button type="button" className="admin-menu-toggle" onClick={() => setOpen((current) => !current)} aria-label="القائمة">
          <Menu size={19} />
        </button>
        <img src={withAppBase("/logo-normal.png")} alt="Hamdi Voyage" />
      </div>

      <nav className={`admin-topnav ${open ? "open" : ""}`}>
        {visibleItems.map((item) => (
          <button key={item.key} type="button" className={item.active ? "active" : ""} onClick={() => run(item.onClick)}>
            {item.label}
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </button>
        ))}

        <button type="button" className="admin-topnav-cta" onClick={() => run(onCreateReservation)}>
          <Plus size={15} /> إنشاء حجز جديد
        </button>

        {onOpenApprovals && (
          <button type="button" onClick={() => run(onOpenApprovals)}>
            <ShieldCheck size={15} /> الحجوزات للموافقة
            {approvalsBadge ? <span className="nav-badge">{approvalsBadge}</span> : null}
          </button>
        )}

        <button type="button" onClick={() => run(onLogout)}>
          <LogOut size={15} /> تسجيل الخروج
        </button>
      </nav>

      <div className="profile">
        <span>{user.avatar}</span>
        <div>
          <strong>{user.name}</strong>
          <small>{user.role === "admin" ? "مدير" : "موظف حجوزات"}</small>
        </div>
      </div>
    </header>
  );
}
