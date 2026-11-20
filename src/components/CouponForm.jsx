import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function CouponForm() {
  const { couponCode, applyCoupon, clearCoupon } = useCart();
  const [code, setCode] = useState(couponCode || "");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(Boolean(couponCode));

  const submit = (event) => {
    event.preventDefault();
    const result = applyCoupon(code);
    setOk(result.ok);
    setMessage(result.ok ? result.message : result.message);
    if (result.ok) setCode(code.trim().toUpperCase());
  };

  return (
    <form className="coupon" onSubmit={submit}>
      <label htmlFor="coupon">Courtesy code</label>
      <div className="coupon-row">
        <input
          id="coupon"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="SOLENNE10, GIFT25, WRAP"
          aria-label="Coupon code"
        />
        <button className="btn btn-line" type="submit">
          Apply
        </button>
      </div>
      {couponCode && (
        <button className="remove" type="button" onClick={() => { clearCoupon(); setCode(""); setMessage(""); setOk(false); }}>
          Remove {couponCode}
        </button>
      )}
      {message && <p className={`form-note ${ok ? "" : "warn"}`}>{message}</p>}
    </form>
  );
}
