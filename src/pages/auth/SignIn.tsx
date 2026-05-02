import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Plane } from "lucide-react";
import { useAuth } from "../../components/providers/auth";

export default function SignIn() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@hamdi.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/admin" replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (login(email, password)) navigate("/admin");
    else setError("بيانات الدخول غير صحيحة.");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-visual">
          <Plane />
          <h1>Hamdi Back Office</h1>
          <p>العملاء يشاهدون برامج العمرة، والموظفون ينشئون الحجوزات، والمدير يتحكم في كل شيء.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <span className="label">تسجيل الدخول</span>
          <h2>مساحة الفريق</h2>
          <label><Mail size={16} /> Email<input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label><LockKeyhole size={16} /> كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <p className="form-error">{error}</p>}
          <button>الدخول إلى الإدارة</button>
          <p className="hint">Admin: admin@hamdi.local / admin123<br />موظف: sara@hamdi.local / voyage123</p>
        </form>
      </section>
    </main>
  );
}
