import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="container navbar">
        <a className="navbar__brand" href="/" aria-label="Almost home">
          almost<span className="navbar__brand-dot">.</span>
        </a>

        <nav className="navbar__links" aria-label="Main navigation">
          <a
            className="navbar__link navbar__link--active"
            href="/"
            aria-current="page"
          >
            Museum
          </a>
        </nav>
      </div>
    </header>
  );
}