import Navbar from "./Navbar";
import "./AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" className="app-main" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p>
            <strong>Almost.</strong> A museum of mistakes.
          </p>
          <small>© 2026 Almost. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
}