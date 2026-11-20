import { Link } from "react-router-dom";
import { money, useAdmin } from "./useAdmin";

export default function Dashboard() {
  const { data, error, loading } = useAdmin("/api/admin/stats");
  if (loading) return <p>Opening the books…</p>;
  if (error) return <p>{error}</p>;

  const stats = [
    ["Revenue", money(data.revenue)],
    ["Orders", data.orders],
    ["Customers", data.customers],
    ["Low stock", data.lowStock],
    ["Pieces", data.products],
    ["Units sent", data.units],
    ["Inventory value", money(data.inventoryValue)],
  ];

  return (
    <>
      <header className="admin-top">
        <div>
          <p className="admin-label">Today in the studio</p>
          <h1>Overview</h1>
        </div>
        <Link to="/" className="btn btn-line">View the shop</Link>
      </header>
      <section className="stat-grid">
        {stats.map(([label, value]) => (
          <article className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className="admin-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        <article className="admin-card">
          <h2 className="serif">Recent orders</h2>
          {data.recent.length === 0 && <p>No orders yet.</p>}
          {data.recent.map((order) => (
            <p key={order.id}>
              <Link to="/admin/orders">{order.id}</Link> · {order.recipient} · {money(order.total)}
            </p>
          ))}
        </article>
        <article className="admin-card">
          <h2 className="serif">By category</h2>
          {Object.entries(data.byCategory).map(([name, count]) => (
            <p key={name}>{name} · {count}</p>
          ))}
        </article>
      </section>
    </>
  );
}
