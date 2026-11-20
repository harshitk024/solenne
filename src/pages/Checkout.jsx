import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { shippingMethods } from "../data/checkout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import OrderSummary from "../components/OrderSummary";

const empty = {
  email: "",
  first: "",
  last: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postal: "",
  country: "India",
  note: "",
};

export default function Checkout() {
  const { items, method, setMethod, rememberOrder } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  if (items.length === 0) {
    return (
      <div className="page container empty">
        <h2>Your bag is empty.</h2>
        <p className="muted">Add a gift before we can wrap it.</p>
        <Link to="/shop" className="btn btn-dark">
          Find a gift
        </Link>
      </div>
    );
  }

  const openRazorpay = (session) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay could not be loaded."));
        return;
      }
      const checkout = new window.Razorpay({
        key: session.key,
        amount: session.amount,
        currency: session.currency,
        name: session.name,
        description: session.description,
        order_id: session.razorpayOrderId,
        prefill: { name: `${form.first} ${form.last}`.trim(), email: form.email, contact: form.phone },
        theme: { color: "#3c2a24" },
        handler: resolve,
        modal: { ondismiss: () => reject(new Error("Payment was closed before it completed.")) },
      });
      checkout.on("payment.failed", (response) => reject(new Error(response?.error?.description || "Payment failed.")));
      checkout.open();
    });

  const submit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/account");
      return;
    }
    setPending(true);
    setError("");
    try {
      const session = await api("/api/payments/order", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          recipient: `${form.first} ${form.last}`.trim(),
          address: {
            phone: form.phone,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            region: form.region,
            postal: form.postal,
            country: form.country,
          },
          note: form.note,
        }),
      });
      const payment = await openRazorpay(session);
      const order = await api("/api/payments/verify", { method: "POST", body: JSON.stringify(payment) });
      rememberOrder(order);
      navigate(`/order/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / <Link to="/cart">Bag</Link> / Checkout
          </p>
          <span className="eyebrow">Almost given</span>
          <h1>Checkout</h1>
        </header>
        <form className="checkout-layout" onSubmit={submit}>
          <div>
            <section className="panel">
              <h2 className="serif">Where it should arrive</h2>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={form.email} onChange={set("email")} />
              </div>
              <div className="split">
                <div className="field">
                  <label htmlFor="first">First name</label>
                  <input id="first" required value={form.first} onChange={set("first")} />
                </div>
                <div className="field">
                  <label htmlFor="last">Last name</label>
                  <input id="last" required value={form.last} onChange={set("last")} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" required value={form.phone} onChange={set("phone")} placeholder="For the courier, if the bell is missed" />
              </div>
              <div className="field">
                <label htmlFor="line1">Street address</label>
                <input id="line1" required value={form.line1} onChange={set("line1")} />
              </div>
              <div className="field">
                <label htmlFor="line2">Apartment, floor</label>
                <input id="line2" value={form.line2} onChange={set("line2")} />
              </div>
              <div className="split">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" required value={form.city} onChange={set("city")} />
                </div>
                <div className="field">
                  <label htmlFor="region">State</label>
                  <input id="region" required value={form.region} onChange={set("region")} />
                </div>
              </div>
              <div className="split">
                <div className="field">
                  <label htmlFor="postal">Postal code</label>
                  <input id="postal" required value={form.postal} onChange={set("postal")} />
                </div>
                <div className="field">
                  <label htmlFor="country">Country</label>
                  <input id="country" required value={form.country} onChange={set("country")} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="note">Card message</label>
                <textarea id="note" rows="4" value={form.note} onChange={set("note")} placeholder="We will write this by hand if a piece has no note of its own." />
              </div>
            </section>

            <section className="panel" style={{ marginTop: 18 }}>
              <h2 className="serif">How it should travel</h2>
              <div className="ship-options">
                {shippingMethods.map((option) => (
                  <label key={option.id} className={`ship-option ${method.id === option.id ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={method.id === option.id}
                      onChange={() => setMethod(option.id)}
                    />
                    <span>
                      <strong>{option.label}</strong>
                      <p className="muted">{option.detail}</p>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="panel" style={{ marginTop: 18 }}>
              <h2 className="serif">Payment</h2>
              <p className="muted">
                {user
                  ? "You will pay in Razorpay. The order is confirmed only after the server verifies the signature."
                  : "Sign in before paying, so the order can be kept with your account."}
              </p>
              {error && <p className="form-note warn">{error}</p>}
              <button className="btn btn-dark" type="submit" disabled={pending}>
                {pending ? "Opening Razorpay" : user ? "Pay with Razorpay" : "Sign in to pay"}
              </button>
            </section>
          </div>
          <OrderSummary />
        </form>
      </div>
    </div>
  );
}
