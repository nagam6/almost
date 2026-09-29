import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authRequest } from "../services/authApi";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    authRequest("me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch((err) => {
        if (active) {
          setUser(null);
          if (err.status !== 401) setError("Unable to check your session.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  async function authenticate(mode, values) {
    const data = await authRequest(mode, values);
    setUser(data.user);
    setError("");
    return data.user;
  }
  async function logout() {
    await authRequest("logout", {});
    setUser(null);
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        authenticate,
        logout,
        retry: () => setRetry((n) => n + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
export function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading)
    return (
      <p className="container" role="status">
        Checking your session…
      </p>
    );
  if (auth.error)
    return (
      <div className="container">
        <p role="alert">{auth.error}</p>
        <button onClick={auth.retry}>Try again</button>
      </div>
    );
  return auth.user ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}
