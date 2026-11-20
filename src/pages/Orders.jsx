import { Link } from "react-router-dom";
import { formatPrice } from "../data/store";
import { useCart } from "../context/CartContext";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function Orders() {
  const { orders, reorder } = useCart();

  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / Orders
          </p>
          <span className="eyebrow">Already given</span>
          <h1>Order history</h1>
          <p>
            {orders.length
              ? `${orders.length} gift${orders.length === 1 ? "" : "s"} placed on this browser. Nothing here was charged.`
              : "No gifts have left the table yet. When you place one, it will be kept here."}
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="empty">
            <Link to="/shop" className="btn btn-dark">
              Find a gift
            </Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((entry) => (
              <article className="panel order-card" key={entry.id}>
                <div className="order-card-head">
                  <div>
                    <p className="muted">{formatDate(entry.placedAt)}</p>
                    <h2>{entry.id}</h2>
                    <p>
                      For {entry.recipient} · {entry.address.city}
                    </p>
                  </div>
                  <strong className="price">{formatPrice(entry.total)}</strong>
                </div>
                <div className="order-thumbs">
                  {entry.items.map((item) => (
                    <img key={item.id} src={item.image} alt={item.name} title={`${item.name} × ${item.quantity}`} />
                  ))}
                </div>
                <p className="muted">
                  {entry.items.map((item) => `${item.name} × ${item.quantity}`).join(" · ")}
                </p>
                <div className="line-actions">
                  <Link to={`/order/${entry.id}`} className="btn btn-line">
                    View order
                  </Link>
                  <button className="btn btn-dark" onClick={() => reorder(entry.id)}>
                    Order again
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
