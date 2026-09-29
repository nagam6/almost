import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { toast } from "react-toastify";
import "./Navbar.css";
export default function Navbar() {
  const { user, loading, error: sessionError, retry, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const linkClass = ({ isActive }) => `navbar__link${isActive ? " navbar__link--active" : ""}`;
  async function signOut() {
    setBusy(true);
    try { await logout(); toast.success("Signed out."); navigate("/login"); } catch { toast.error("Could not log out. Try again."); }
    finally { setBusy(false); }
  }
  return <header className="site-header"><div className="container navbar">
    <Link className="navbar__brand" to="/" aria-label="Almost home">almost<span className="navbar__brand-dot">.</span></Link>
    <nav className="navbar__links" aria-label="Main navigation">
      <NavLink to="/" end className={linkClass}>Home</NavLink>
      <NavLink to="/museum" className={linkClass}>Museum</NavLink>
      {user?.role === "teacher" && <NavLink to="/teacher" className={linkClass}>Teacher Studio</NavLink>}
      {loading ? <span role="status">Loading…</span> : sessionError ? <button className="navbar__link" onClick={retry}>Retry session</button> : user ? <><NavLink to="/profile" className={linkClass}>Profile</NavLink><button className="navbar__link" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button></> : <><NavLink to="/login" className={linkClass}>Log in</NavLink><NavLink to="/register" className="navbar__link navbar__register">Join Almost</NavLink></>}
    </nav>
  </div></header>;
}
