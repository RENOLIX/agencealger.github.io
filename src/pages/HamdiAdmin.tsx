import { FormEvent, useEffect, useMemo, useState, type WheelEvent } from "react";
import { LockKeyhole, LogOut, Mail, Save } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/providers/auth";
import {
  defaultGuideCostSettings,
  defaultHotelCostSettings,
  getGuideCostSettings,
  getHotelCostSettings,
  saveGuideCostSettings,
  saveGuideCostSettingsToSupabase,
  saveHotelCostSettings,
  saveHotelCostSettingsToSupabase,
  syncGuideCostSettingsFromSupabase,
  syncHotelCostSettingsFromSupabase,
  type GuideCostSettings,
  type HotelCostSettings,
} from "../lib/data";
import { withAppBase } from "../lib/app-base";

const roomRows = [
  { key: "quint", label: "سرير خماسية", occupancy: 5 },
  { key: "quad", label: "سرير رباعية", occupancy: 4 },
  { key: "triple", label: "سرير ثلاثية", occupancy: 3 },
  { key: "double", label: "ثنائية", occupancy: 2 },
  { key: "single", label: "أحادية", occupancy: 1 },
] as const;

export default function HamdiAdmin() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [guideSettings, setGuideSettings] = useState<GuideCostSettings>(() => getGuideCostSettings());
  const [hotelSettings, setHotelSettings] = useState<HotelCostSettings>(() => getHotelCostSettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    void Promise.all([
      syncGuideCostSettingsFromSupabase().catch(() => getGuideCostSettings()),
      syncHotelCostSettingsFromSupabase().catch(() => getHotelCostSettings()),
    ]).then(([nextGuideSettings, nextHotelSettings]) => {
      setGuideSettings(nextGuideSettings);
      setHotelSettings(nextHotelSettings);
    });
  }, [user]);

  const guideTotalCost = useMemo(() => (
    Number(guideSettings.guideTicketCost || 0) +
    Number(guideSettings.visaCost || 0) +
    Number(guideSettings.expenseCost || 0) +
    Number(guideSettings.medinaBedCost || 0) +
    Number(guideSettings.meccaBedCost || 0)
  ), [guideSettings]);

  const guideShareDzd = useMemo(() => {
    const seats = Number(hotelSettings.seatsCount || 0);
    if (seats <= 0) return 0;
    return guideTotalCost / seats;
  }, [guideTotalCost, hotelSettings.seatsCount]);

  const visaDzd = useMemo(() => (
    Number(hotelSettings.visaSar || 0) * Number(hotelSettings.exchangeRate || 0)
  ), [hotelSettings.exchangeRate, hotelSettings.visaSar]);

  const roomValues = useMemo(() => roomRows.map((room) => ({
    ...room,
    meccaDzd: (Number(hotelSettings.meccaSar || 0) * Number(hotelSettings.meccaNights || 0) * Number(hotelSettings.exchangeRate || 0)) / room.occupancy,
    medinaDzd: (Number(hotelSettings.medinaSar || 0) * Number(hotelSettings.medinaNights || 0) * Number(hotelSettings.exchangeRate || 0)) / room.occupancy,
  })), [hotelSettings.exchangeRate, hotelSettings.meccaNights, hotelSettings.meccaSar, hotelSettings.medinaNights, hotelSettings.medinaSar]);

  const roomTotals = useMemo(() => roomValues.map((room) => {
    const sharedBase =
      room.meccaDzd +
      room.medinaDzd +
      visaDzd +
      Number(hotelSettings.diwanDzd || 0) +
      Number(hotelSettings.ticketDzd || 0) +
      Number(hotelSettings.giftDzd || 0) +
      guideShareDzd;

    const totalWithFood = sharedBase + Number(hotelSettings.foodDzd || 0);
    const totalWithoutFood = sharedBase;

    return {
      ...room,
      totalCost: totalWithFood,
      totalWithoutFood,
      saleWithFood: totalWithFood,
    };
  }), [guideShareDzd, hotelSettings.diwanDzd, hotelSettings.foodDzd, hotelSettings.giftDzd, hotelSettings.ticketDzd, roomValues, visaDzd]);

  const profitDzd = useMemo(() => (
    Number(hotelSettings.salePrice || 0) - Number(hotelSettings.purchasePrice || 0)
  ), [hotelSettings.purchasePrice, hotelSettings.salePrice]);

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

  async function saveTables(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved("");
    try {
      const [nextGuideSettings, nextHotelSettings] = await Promise.all([
        saveGuideCostSettingsToSupabase(guideSettings),
        saveHotelCostSettingsToSupabase({ ...hotelSettings, guideDzd: guideShareDzd }),
      ]);
      setGuideSettings(nextGuideSettings);
      setHotelSettings(nextHotelSettings);
      saveGuideCostSettings(nextGuideSettings);
      saveHotelCostSettings(nextHotelSettings);
      setSaved("تم حفظ الجداول بنجاح.");
    } catch {
      saveGuideCostSettings(guideSettings);
      saveHotelCostSettings(hotelSettings);
      setSaved("تم حفظ التعديلات محليًا.");
    } finally {
      setSaving(false);
    }
  }

  function updateGuideField(field: keyof Omit<GuideCostSettings, "id">, value: string) {
    const nextValue = Number(value);
    setGuideSettings((current) => ({
      ...current,
      [field]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  }

  function updateHotelField(field: keyof Omit<HotelCostSettings, "id">, value: string | number) {
    setHotelSettings((current) => ({
      ...current,
      [field]: typeof value === "number" ? value : field === "title" ? value : Number(value) || 0,
    }));
  }

  function stopNumberScroll(event: WheelEvent<HTMLInputElement>) {
    event.currentTarget.blur();
    event.stopPropagation();
  }

  function formatAmount(value: number, digits = 0) {
    return value.toLocaleString("fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function formatRoomAmount(value: number) {
    return formatAmount(Math.round(value), 0);
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
          <button type="button" className="active">الجداول</button>
          <button type="button" onClick={logout}><LogOut size={15} /> خروج</button>
        </nav>
      </header>

      <section className="hamdi-admin-shell-page">
        <form onSubmit={saveTables} className="hamdi-admin-form">
          <div className="hamdi-admin-layout">
            <article className="hamdi-admin-card hotel-cost-card">
              <div className="hamdi-admin-card-head">
                <div>
                  <span className="label">الجدول الرئيسي</span>
                  <h2>تفاصيل الفندق</h2>
                </div>
              </div>

              <div className="hotel-cost-sheet">
                <div className="hotel-cost-title-row">
                  <input
                    className="hotel-cost-title-input"
                    value={hotelSettings.title}
                    onChange={(event) => updateHotelField("title", event.target.value)}
                  />
                </div>

                <table className="hotel-cost-table">
                  <tbody>
                    <tr>
                      <th className="hotel-side-header" />
                      <th>مكة</th>
                      <th>مدينة</th>
                      <th>فيزة</th>
                      <th>الديوان</th>
                      <th>تذكرة</th>
                      <th>الهدية</th>
                      <th>الأكل</th>
                      <th>المرشد</th>
                    </tr>
                    <tr>
                      <th className="hotel-side-header">القيمة</th>
                      <td><input type="number" value={hotelSettings.meccaSar} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("meccaSar", event.target.value)} /></td>
                      <td><input type="number" value={hotelSettings.medinaSar} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("medinaSar", event.target.value)} /></td>
                      <td><input type="number" value={hotelSettings.visaSar} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("visaSar", event.target.value)} /></td>
                      <td><input type="number" value={hotelSettings.diwanDzd} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("diwanDzd", event.target.value)} /></td>
                      <td><input type="number" value={hotelSettings.ticketDzd} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("ticketDzd", event.target.value)} /></td>
                      <td><input type="number" value={hotelSettings.giftDzd} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("giftDzd", event.target.value)} /></td>
                      <td><input type="number" value={hotelSettings.foodDzd} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("foodDzd", event.target.value)} /></td>
                      <td className="computed-cell">{formatRoomAmount(guideShareDzd)}</td>
                    </tr>
                    <tr>
                      <th className="hotel-side-header">عدد ليالي</th>
                      <td><input type="number" value={hotelSettings.meccaNights} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("meccaNights", event.target.value)} /></td>
                      <td><input type="number" value={hotelSettings.medinaNights} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("medinaNights", event.target.value)} /></td>
                      <td colSpan={6} />
                    </tr>
                    {roomValues.map((room, index) => (
                      <tr key={room.key}>
                        <th className="hotel-side-header">{room.label}</th>
                        <td className="computed-cell">{formatRoomAmount(room.meccaDzd)}</td>
                        <td className="computed-cell">{formatRoomAmount(room.medinaDzd)}</td>
                        <td className="computed-cell">{index === 0 ? formatRoomAmount(visaDzd) : ""}</td>
                        <td colSpan={5} />
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="hotel-cost-bottom-grid">
                  <div className="hotel-mini-table">
                    <div className="hotel-mini-row">
                      <span>تحويل</span>
                      <input type="number" value={hotelSettings.exchangeRate} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("exchangeRate", event.target.value)} />
                    </div>
                    <div className="hotel-mini-row">
                      <span>عدد مقاعد</span>
                      <input type="number" value={hotelSettings.seatsCount} onWheel={stopNumberScroll} onChange={(event) => updateHotelField("seatsCount", event.target.value)} />
                    </div>
                  </div>
                  <div className="hotel-cost-note">
                    <strong>فيزة بالدينار الجزائري</strong>
                    <span>{formatRoomAmount(visaDzd)} دج</span>
                  </div>
                </div>
              </div>
            </article>

            <aside className="hamdi-admin-card guide-cost-card compact">
              <div className="hamdi-admin-card-head">
                <div>
                  <span className="label">الجدول الجانبي</span>
                  <h2>تكلفة المرشد</h2>
                </div>
              </div>

              <div className="guide-cost-table">
                <div className="guide-cost-head">تكلفة المرشد</div>

                <div className="guide-cost-row">
                  <span>تدكرة مرشدة</span>
                  <input type="number" value={guideSettings.guideTicketCost} onWheel={stopNumberScroll} onChange={(event) => updateGuideField("guideTicketCost", event.target.value)} />
                </div>

                <div className="guide-cost-row">
                  <span>فيزة</span>
                  <input type="number" value={guideSettings.visaCost} onWheel={stopNumberScroll} onChange={(event) => updateGuideField("visaCost", event.target.value)} />
                </div>

                <div className="guide-cost-row">
                  <span>مصروف</span>
                  <input type="number" value={guideSettings.expenseCost} onWheel={stopNumberScroll} onChange={(event) => updateGuideField("expenseCost", event.target.value)} />
                </div>

                <div className="guide-cost-row">
                  <span>سرير مدينة</span>
                  <input type="number" value={guideSettings.medinaBedCost} onWheel={stopNumberScroll} onChange={(event) => updateGuideField("medinaBedCost", event.target.value)} />
                </div>

                <div className="guide-cost-row">
                  <span>سرير مكة</span>
                  <input type="number" value={guideSettings.meccaBedCost} onWheel={stopNumberScroll} onChange={(event) => updateGuideField("meccaBedCost", event.target.value)} />
                </div>

                <div className="guide-cost-row total">
                  <span>مجموعة تكلفة</span>
                  <strong>{formatAmount(guideTotalCost)}</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className="hamdi-admin-bottom-row">
            <article className="hamdi-admin-card pricing-summary-card">
              <div className="hamdi-admin-card-head compact-head">
                <div>
                  <span className="label">ملخص آلي</span>
                  <h2>جدول الأسعار</h2>
                </div>
              </div>

              <table className="pricing-summary-table">
                <thead>
                  <tr>
                    <th>تكلفة</th>
                    <th>السعر بدون الأكل</th>
                    <th>السعر بيع بالأكل</th>
                    <th>الغرفة</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTotals.map((room) => (
                    <tr key={`summary-${room.key}`}>
                      <td>{formatRoomAmount(room.totalCost)}</td>
                      <td>{formatRoomAmount(room.totalWithoutFood)}</td>
                      <td>{formatRoomAmount(room.saleWithFood)}</td>
                      <th>{room.label}</th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className="hamdi-admin-card profit-card">
              <div className="hamdi-admin-card-head compact-head">
                <div>
                  <span className="label">حساب آلي</span>
                  <h2>جدول الفائدة</h2>
                </div>
              </div>

              <table className="profit-table">
                <thead>
                  <tr>
                    <th>سعر الشراء</th>
                    <th>سعر البيع</th>
                    <th>فائدة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input
                        type="number"
                        value={hotelSettings.purchasePrice}
                        onWheel={stopNumberScroll}
                        onChange={(event) => updateHotelField("purchasePrice", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={hotelSettings.salePrice}
                        onWheel={stopNumberScroll}
                        onChange={(event) => updateHotelField("salePrice", event.target.value)}
                      />
                    </td>
                    <td className="computed-cell">{formatRoomAmount(profitDzd)} دج</td>
                  </tr>
                </tbody>
              </table>
            </article>
          </div>

          <div className="hamdi-admin-actions">
            <button type="submit" className="hamdi-admin-save" disabled={saving}>
              <Save size={16} /> {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </button>
            {saved && <p className="hamdi-admin-saved">{saved}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}
