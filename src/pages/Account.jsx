import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      if (mode === "register") await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  if (user) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 720 }}>
          <header className="page-hero">
            <p className="crumbs">
              <Link to="/">Home</Link> / Account
            </p>
            <span className="eyebrow">{user.role === "admin" ? "Studio" : "Your account"}</span>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </header>
          <div className="line-actions">
            {user.role === "admin" && (
              <Link to="/admin" className="btn btn-blush">
                Open the desk
              </Link>
            )}
            <Link to="/orders" className="btn btn-dark">
              Order history
            </Link>
            <button className="btn btn-line" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <header className="page-hero">
          <span className="eyebrow">The house book</span>
          <h1>{mode === "login" ? "Sign in" : "Create an account"}</h1>
          <p>Your bag and orders are kept with your account. Passwords are stored hashed.</p>
        </header>
        <form className="panel" onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" required value={form.name} onChange={set("name")} />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={set("email")} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" minLength={8} required value={form.password} onChange={set("password")} />
          </div>
          {error && <p className="form-note warn">{error}</p>}
          <button className="btn btn-dark" type="submit" disabled={pending}>
            {pending ? "One moment" : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <button
            className="remove"
            type="button"
            style={{ marginTop: 14 }}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
