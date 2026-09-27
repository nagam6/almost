import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  function getLinkClass({ isActive }) {
    return isActive
      ? "navbar__link navbar__link--active"
      : "navbar__link";
  }

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link
          className="navbar__brand"
          to="/"
          aria-label="Almost home"
        >
          almost<span className="navbar__brand-dot">.</span>
        </Link>

        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/" end className={getLinkClass}>
            Home
          </NavLink>

          <NavLink to="/museum" className={getLinkClass}>
            Museum
          </NavLink>
        </nav>
      </div>
    </header>
  );
}