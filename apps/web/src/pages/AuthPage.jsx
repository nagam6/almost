import { useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../components/AuthProvider";
import { authRequest } from "../services/authApi";
import "./AuthPage.css";
const titles = { login: "Welcome back.", register: "A new way to learn.", "forgot-password": "Let's get you back in.", "reset-password": "A fresh start." };

function PasswordField({ label, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="auth-password-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password-control">
        <input {...inputProps} id={id} type={visible ? "text" : "password"} />
        <button
          className="auth-password-toggle"
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-controls={id}
          title={`${visible ? "Hide" : "Show"} password`}
          onClick={() => setVisible((current) => !current)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AuthPage({ mode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get("token") || "");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const isReset = mode === "reset-password";
  const isRegister = mode === "register";
  const hasPassword = mode !== "forgot-password";
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setMessage("");
    if ((isRegister || isReset) && password !== confirm) { toast.error("Passwords do not match."); return; }
    setBusy(true);
    try {
      if (mode === "login" || isRegister) {
        const user = await auth.authenticate(mode, isRegister ? { name, email, password, role } : { email, password });
        toast.success(isRegister ? "Your account is ready." : "Welcome back!");
        navigate(user.role === "teacher" ? "/teacher" : "/museum", { replace: true });
      } else {
        const data = await authRequest(mode, isReset ? { token, password } : { email });
        setMessage(data.message); setPassword(""); setConfirm("");
        toast.success(data.message);
        if (isReset) navigate("/reset-password", { replace: true });
      }
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  }
  return <section className="auth-page container">
    <aside className="auth-story"><p className="auth-eyebrow">ALMOST · MUSEUM OF MISTAKES</p><h1>Progress starts<br />with a rethink<span>.</span></h1><p>Explore a mistake. Follow the thinking. Discover something new.</p><div className="auth-art" aria-hidden="true">almost<span>→</span>aha!</div></aside>
    <div className="auth-card"><p className="auth-eyebrow">YOUR NEXT CHAPTER</p><h2>{titles[mode]}</h2>
      <p className="auth-muted">{mode === "login" ? "Log in to continue your learning journey." : isRegister ? "Choose how you want to explore or contribute to the museum." : isReset ? "Choose a new password for your account." : "Enter your email and we'll send a reset link if an account exists."}</p>
      {message && <p className="auth-success" role="status">{message}</p>}
      {isReset && !token && !message ? <p role="alert">Open the reset link from your email. <Link to="/forgot-password">Request a new link</Link>.</p> : !(isReset && message) && <form onSubmit={submit}>
        <fieldset disabled={busy} className="auth-fields">
          {isRegister && <>
            <label>Full name<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} /></label>
            <fieldset className="auth-role-options">
              <legend>I am joining as</legend>
              <label className={role === "student" ? "auth-role-option auth-role-option--selected" : "auth-role-option"}>
                <input type="radio" name="role" value="student" checked={role === "student"} onChange={() => setRole("student")} />
                <span><strong>Student</strong><small>Explore mistakes and learn from them.</small></span>
              </label>
              <label className={role === "teacher" ? "auth-role-option auth-role-option--selected" : "auth-role-option"}>
                <input type="radio" name="role" value="teacher" checked={role === "teacher"} onChange={() => setRole("teacher")} />
                <span><strong>Teacher</strong><small>Create exhibits and see anonymous results.</small></span>
              </label>
            </fieldset>
          </>}
          {!isReset && <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} /></label>}
          {hasPassword && <PasswordField label="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "login" ? 1 : 12} maxLength={72} aria-describedby={mode === "login" ? undefined : "password-help"} />}
          {(isRegister || isReset) && <><small id="password-help">At least 12 characters; at most 72 UTF-8 bytes.</small><PasswordField label="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required maxLength={72} /></>}
          {mode === "login" && <Link className="auth-forgot" to="/forgot-password">Forgot password?</Link>}
          <button className="auth-button" type="submit">{busy ? "Please wait…" : mode === "login" ? "Log in →" : isRegister ? "Create account →" : isReset ? "Save new password →" : "Send reset link →"}</button>
        </fieldset>
      </form>}
      <p className="auth-footer">{mode === "login" ? <>New here? <Link to="/register">Create an account</Link></> : <Link to="/login">Back to login</Link>}</p>
    </div>
  </section>;
}
