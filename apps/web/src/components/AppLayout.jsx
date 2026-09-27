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
        <div className="container">
          <p>Almost — a museum of mistakes.</p>
        </div>
      </footer>
    </div>
  );
}