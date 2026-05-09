import { FormEvent, useEffect, useMemo, useState } from "react";
import { LockKeyhole, LogOut, Mail, Save } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth";
import {
  defaultGuideCostSettings,
  getGuideCostSettings,
  saveGuideCostSettings,
  saveGuideCostSettingsToSupabase,
  syncGuideCostSettingsFromSupabase,
  type GuideCostSettings,
} from "../lib/data";
import { withAppBase } from "../lib/app-base";

export default function HamdiAdmin() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<GuideCostSettings>(() => getGuideCostSettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    void syncGuideCostSettingsFromSupabase()
      .then(setSettings)
      .catch(() => setSettings(getGuideCostSettings()));
  }, [user]);

  const totalCost = useMemo(() => (
    Number(settings.guideTicketCost || 0) +
    Number(settings.visaCost || 0) +
    Number(settings.expenseCost || 0) +
    Number(settings.medinaBedCost || 0) +
    Number(settings.meccaBedCost || 0)
  ), [settings]);

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    const success = await login(email, password);
    if (!success) {
      setError("بيانات الدخول غير صحيحة.");
      return;
    }
    setSaved("");
  }

  async function saveTable(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved("");
    try {
      const nextSettings = await saveGuideCostSettingsToSupabase(settings);
      setSettings(nextSettings);
      saveGuideCostSettings(nextSettings);
      setSaved("تم حفظ الجدول بنجاح.");
    } catch {
      saveGuideCostSettings(settings);
      setSaved("تم حفظ التعديل محليًا.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof Omit<GuideCostSettings, "id">, value: string) {
    const nextValue = Number(value);
    setSettings((current) => ({
      ...current,
      [field]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  }

  if (user && user.role !== "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (!user) {
    return (
      <main className="hamdi-admin-auth-page">
        <section className="hamdi-admin-auth-card">
          <div className="hamdi-admin-auth-brand">
            <img src={withAppBase("/logo-normal.png")} alt="Hamdi Voyage" />
            <span className="label">بوابة خاصة</span>
            <h1>Hamdi Admin</h1>
            <p>تسجيل دخول منفصل لإدارة الجداول الخاصة والبيانات الداخلية.</p>
          </div>

          <form className="hamdi-admin-auth-form" onSubmit={submitLogin}>
            <label>
              <Mail size={16} /> البريد الإلكتروني
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@..." />
            </label>
            <label>
              <LockKeyhole size={16} /> كلمة المرور
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit">الدخول إلى الصفحة</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="hamdi-admin-page">
      <header className="hamdi-admin-nav">
        <div className="hamdi-admin-nav-brand">
          <img src={withAppBase("/logo-normal.png")} alt="Hamdi Voyage" />
          <div>
            <strong>Hamdi Admin</strong>
            <small>لوحة الجداول الخاصة</small>
          </div>
        </div>

        <nav className="hamdi-admin-nav-links">
          <button type="button" className="active">تكلفة المرشد</button>
          <button type="button" onClick={logout}><LogOut size={15} /> خروج</button>
        </nav>
      </header>

      <section className="hamdi-admin-shell-page">
        <article className="hamdi-admin-card">
          <div className="hamdi-admin-card-head">
            <div>
              <span className="label">الجدول الأول</span>
              <h2>تكلفة المرشد</h2>
            </div>
          </div>

          <form onSubmit={saveTable} className="hamdi-admin-form">
            <div className="guide-cost-table">
              <div className="guide-cost-head">تكلفة المرشد</div>

              <div className="guide-cost-row">
                <span>تدكرة مرشدة</span>
                <input type="number" value={settings.guideTicketCost} onChange={(event) => updateField("guideTicketCost", event.target.value)} />
              </div>

              <div className="guide-cost-row">
                <span>فيزة</span>
                <input type="number" value={settings.visaCost} onChange={(event) => updateField("visaCost", event.target.value)} />
              </div>

              <div className="guide-cost-row">
                <span>مصروف</span>
                <input type="number" value={settings.expenseCost} onChange={(event) => updateField("expenseCost", event.target.value)} />
              </div>

              <div className="guide-cost-row">
                <span>سرير مدينة</span>
                <input type="number" value={settings.medinaBedCost} onChange={(event) => updateField("medinaBedCost", event.target.value)} />
              </div>

              <div className="guide-cost-row">
                <span>سرير مكة</span>
                <input type="number" value={settings.meccaBedCost} onChange={(event) => updateField("meccaBedCost", event.target.value)} />
              </div>

              <div className="guide-cost-row total">
                <span>مجموعة تكلفة</span>
                <strong>{totalCost.toLocaleString("fr-FR")}</strong>
              </div>
            </div>

            <div className="hamdi-admin-actions">
              <button type="submit" className="hamdi-admin-save" disabled={saving}>
                <Save size={16} /> {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </button>
              {saved && <p className="hamdi-admin-saved">{saved}</p>}
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}
