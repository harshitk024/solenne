import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./admin.css";

const links = [
  ["Overview", "/admin"],
  ["Products", "/admin/products"],
  ["Inventory", "/admin/inventory"],
  ["Orders", "/admin/orders"],
  ["Customers", "/admin/customers"],
  ["Categories", "/admin/categories"],
  ["Coupons", "/admin/coupons"],
];

export default function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();

  if (!ready) return null;
  if (!user || user.role !== "admin") {
    return (
      <div className="admin-login">
        <form className="admin-card" onSubmit={(event) => event.preventDefault()}>
          <p className="admin-label">Studio only</p>
          <h1 className="serif" style={{ fontSize: "3rem", margin: "8px 0" }}>
            The desk is locked.
          </h1>
          <p>Sign in with a studio account to manage the house.</p>
          <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={() => navigate("/account")}>
            {user ? "Back to the shop" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">Solenne desk</div>
        {links.map(([label, to]) => (
          <NavLink key={to} to={to} end={to === "/admin"}>
            {label}
          </NavLink>
        ))}
        <button
          className="btn btn-light"
          style={{ marginTop: "auto" }}
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
