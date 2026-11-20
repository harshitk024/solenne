import { Link } from "react-router-dom";
import { formatPrice } from "../data/store";
import { useCart } from "../context/CartContext";
import OrderSummary from "../components/OrderSummary";

export default function Cart() {
  const { items, updateQuantity, updateNote, removeItem, clear } = useCart();

  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / Bag
          </p>
          <span className="eyebrow">Before it is wrapped</span>
          <h1>Your bag</h1>
        </header>

        {items.length === 0 ? (
          <div className="empty">
            <h2>Nothing waiting.</h2>
            <p className="muted">The table is clear. The shop is not.</p>
            <Link to="/shop" className="btn btn-dark">
              Find a gift
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="cart-list">
              {items.map((item) => (
                <article className="cart-line" key={item.id}>
                  <Link to={`/product/${item.id}`}>
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div>
                    <div className="price-row">
                      <h2>
                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                      </h2>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                    <p className="muted">{formatPrice(item.price)} each</p>
                    <label className="field" style={{ marginTop: 12 }}>
                      <span>Note for the card</span>
                      <input
                        value={item.note || ""}
                        onChange={(event) => updateNote(item.id, event.target.value)}
                        placeholder="A line we will write in ink"
                      />
                    </label>
                    <div className="line-actions">
                      <div className="qty">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                      <button className="remove" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              <button className="remove" onClick={clear}>
                Empty the bag
              </button>
            </div>
            <OrderSummary checkoutLink />
          </div>
        )}
      </div>
    </div>
  );
}
