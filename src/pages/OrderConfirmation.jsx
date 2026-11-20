import { Link, useParams } from "react-router-dom";
import { formatPrice } from "../data/store";
import { useCart } from "../context/CartContext";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { getOrder } = useCart();
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="page container empty">
        <h2>We cannot find that order.</h2>
        <p className="muted">It may have been placed on another browser.</p>
        <Link to="/shop" className="btn btn-dark">
          Return to the shop
        </Link>
      </div>
    );
  }

  const placed = new Date(order.placedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="page">
      <div className="container confirmation">
        <div className="success-mark">✓</div>
        <span className="eyebrow">Order received</span>
        <h1>It is on the table.</h1>
        <p className="lede">
          {order.id} · {placed}. A note is on its way to {order.email}.
          {order.paymentId ? ` Razorpay payment ${order.paymentId} is verified.` : ""}
        </p>

        <div className="checkout-layout" style={{ marginTop: 36 }}>
          <section className="panel">
            <h2 className="serif">For</h2>
            <p>{order.recipient}</p>
            <p>{order.address.line1}</p>
            {order.address.line2 && <p>{order.address.line2}</p>}
            <p>
              {order.address.city}, {order.address.region} {order.address.postal}
            </p>
            <p>{order.address.country}</p>
            <p className="muted" style={{ marginTop: 12 }}>
              {order.method.label} · {order.method.detail}
            </p>
            {order.note && <p style={{ marginTop: 16 }}>“{order.note}”</p>}
          </section>
          <section className="panel">
            <h2 className="serif">In the box</h2>
            {order.items.map((item) => (
              <div className="row" key={item.id} style={{ marginBottom: 12 }}>
                <span>
                  {item.name} × {item.quantity}
                  {item.note ? <em className="muted"> — {item.note}</em> : null}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="row">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="row">
                <span>Courtesy {order.coupon}</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="row">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping)}</span>
            </div>
            <div className="row total-row">
              <strong>Total</strong>
              <strong className="price">{formatPrice(order.total)}</strong>
            </div>
          </section>
        </div>
        <div className="line-actions" style={{ marginTop: 28 }}>
          <Link to="/orders" className="btn btn-line">
            Order history
          </Link>
          <Link to="/shop" className="btn btn-dark">
            Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
