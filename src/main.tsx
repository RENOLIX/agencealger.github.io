import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/providers/auth";
import Index from "./pages/Index";
import SignIn from "./pages/auth/SignIn";
import Admin from "./pages/Admin";
import AdminReservationCatalog from "./pages/AdminReservationCatalog";
import ApprovalReservations from "./pages/ApprovalReservations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TravelDetail from "./pages/TravelDetail";
import ScrollToTop from "./components/ScrollToTop";
import { getAppBasePath, withAppBase } from "./lib/app-base";
import "./index.css";

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return user.role === "admin" ? children : <Navigate to="/admin" replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={getAppBasePath() || undefined}>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/voyages/:travelId" element={<TravelDetail />} />
          <Route path="/auth" element={<SignIn />} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />
          <Route path="/admin/reservations/new" element={<Protected><AdminReservationCatalog /></Protected>} />
          <Route path="/admin/reservations/new/:travelId" element={<Protected><TravelDetail /></Protected>} />
          <Route path="/admin/approvals" element={<AdminOnly><ApprovalReservations /></AdminOnly>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

document.documentElement.style.setProperty("--admin-pattern-image", `url("${withAppBase("/admin/admin-pattern.jpg")}")`);
