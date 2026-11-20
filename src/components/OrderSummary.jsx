import { Link } from "react-router-dom";
import { formatPrice } from "../data/store";
import { FREE_SHIPPING_AT } from "../data/checkout";
import { useCart } from "../context/CartContext";
import CouponForm from "./CouponForm";

export default function OrderSummary({ showCoupon = true, showItems = true, checkoutLink = false }) {
  const { items, subtotal, discount, shipping, total, coupon, method } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);

  return (
    <aside className="panel checkout-summary">
      <h2 className="serif" style={{ marginTop: 0 }}>
        Order summary
      </h2>
      {showItems &&
        items.map((item) => (
          <div className="summary-item" key={item.id}>
            <img src={item.image} alt="" />
            <div>
              <strong>{item.name}</strong>
              <p className="muted">Qty {item.quantity}</p>
              {item.note && <p className="muted">“{item.note}”</p>}
            </div>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      {showCoupon && <CouponForm />}
      <div className="row">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="row">
        <span>Shipping · {method.label}</span>
        <span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
      </div>
      {discount > 0 && (
        <div className="row">
          <span>Courtesy · {coupon?.label}</span>
          <span>−{formatPrice(discount)}</span>
        </div>
      )}
      <div className="row total-row">
        <strong>Total</strong>
        <strong className="price">{formatPrice(total)}</strong>
      </div>
      <p className="muted">
        {remaining > 0
          ? `${formatPrice(remaining)} away from complimentary studio post.`
          : "Studio post is complimentary on this order."}{" "}
        Linen wrap included.
      </p>
      {checkoutLink && items.length > 0 && (
        <Link to="/checkout" className="btn btn-dark" style={{ width: "100%", marginTop: 8 }}>
          Continue to checkout
        </Link>
      )}
    </aside>
  );
}
