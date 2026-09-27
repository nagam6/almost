import { useAuth } from "../components/AuthProvider";
import { Link } from "react-router-dom";
import "./AuthPage.css";
export default function ProfilePage() {
  const { user } = useAuth();
  return <section className="container auth-profile"><div className="auth-card"><p className="auth-eyebrow">YOUR PROFILE</p><h1>Hello, {user.name}.</h1><p>{user.email}</p><p>Role: {user.role}</p><Link to="/museum">Explore the museum →</Link></div></section>;
}
