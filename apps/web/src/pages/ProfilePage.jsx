import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import "./AuthPage.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const isTeacher = user.role === "teacher";

  return (
    <section className="container auth-profile">
      <div className="auth-card">
        <p className="auth-eyebrow">YOUR PROFILE</p>
        <h1>Hello, {user.name}.</h1>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {isTeacher ? "Teacher" : "Student"}
        </p>
        <nav className="profile-actions" aria-label="Profile actions">
          <Link to={isTeacher ? "/teacher" : "/museum"}>
            {isTeacher ? "Open Teacher Studio →" : "Explore the museum →"}
          </Link>
          <Link to="/forgot-password">Reset password by email</Link>
        </nav>
      </div>
    </section>
  );
}
