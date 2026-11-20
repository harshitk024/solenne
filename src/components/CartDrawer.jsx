import { Link } from "react-router-dom";
import { formatPrice } from "../data/store";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={() => setIsOpen(false)} />
      <aside className="drawer" role="dialog" aria-label="Shopping bag">
        <div className="drawer-head">
          <h2 className="serif" style={{ margin: 0, fontSize: "2.2rem" }}>
            Your bag
          </h2>
          <button className="icon-btn" onClick={() => setIsOpen(false)} aria-label="Close bag">
            ×
          </button>
        </div>

        <div className="drawer-items">
          {items.length === 0 && (
            <div className="empty">
              <p>Your bag is waiting for something lovely.</p>
              <Link to="/shop" className="btn btn-line" onClick={() => setIsOpen(false)}>
                Browse the shop
              </Link>
            </div>
          )}
          {items.map((item) => (
            <div className="cart-row" key={item.id}>
              <img src={item.image} alt="" />
              <div className="info">
                <h3>{item.name}</h3>
                <p className="muted">{formatPrice(item.price)}</p>
                <div className="qty">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase">
                    +
                  </button>
                </div>
              </div>
              <div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
                <button className="remove" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="drawer-foot">
          <div className="price-row">
            <span>Subtotal</span>
            <strong className="price">{formatPrice(subtotal)}</strong>
          </div>
          <p className="muted">Complimentary wrapping. Review notes and a courtesy code in the bag.</p>
          <Link to="/cart" className="text-link" onClick={() => setIsOpen(false)}>
            View bag
          </Link>
          <Link
            to="/checkout"
            className="btn btn-dark"
            style={{ width: "100%", marginTop: 12, pointerEvents: items.length ? "auto" : "none", opacity: items.length ? 1 : 0.5 }}
            onClick={() => setIsOpen(false)}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
