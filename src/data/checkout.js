export const FREE_SHIPPING_AT = 150;

export const shippingMethods = [
  {
    id: "studio",
    label: "Studio post",
    detail: "Wrapped within two days, arrives in 5–7",
    price: 12,
  },
  {
    id: "courier",
    label: "Courier",
    detail: "Leaves tomorrow, arrives in 2–3",
    price: 24,
  },
  {
    id: "hand",
    label: "By hand, in the city",
    detail: "Manhattan & Brooklyn, next afternoon",
    price: 18,
  },
];

export const coupons = {
  SOLENNE10: { label: "10% off the edit", type: "percent", amount: 10, active: true },
  GIFT25: { label: "$25 toward the gift", type: "fixed", amount: 25, active: true },
  WRAP: { label: "Complimentary shipping", type: "shipping", amount: 0, active: true },
};

export const quoteCart = ({ subtotal, methodId = "studio", couponCode = "", couponBook = coupons }) => {
  const method = shippingMethods.find((item) => item.id === methodId) || shippingMethods[0];
  const code = couponCode.trim().toUpperCase();
  const coupon = couponBook[code]?.active === false ? null : couponBook[code] || null;
  let discount = 0;
  let shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : method.price;

  if (coupon?.type === "percent") discount = Math.round(subtotal * (coupon.amount / 100));
  if (coupon?.type === "fixed") discount = Math.min(coupon.amount, subtotal);
  if (coupon?.type === "shipping") shipping = 0;

  const total = Math.max(0, subtotal - discount) + shipping;
  return { method, coupon, code: coupon ? code : "", discount, shipping, total, subtotal };
};

export const createOrderNumber = () => {
  const stamp = new Date();
  const day = `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, "0")}${String(stamp.getDate()).padStart(2, "0")}`;
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SL-${day}-${tail}`;
};
