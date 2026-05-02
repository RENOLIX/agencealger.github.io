import { Link } from "react-router-dom";

export default function NotFound() {
  return <main className="not-found"><h1>الصفحة غير موجودة</h1><Link to="/">العودة للرئيسية</Link></main>;
}
