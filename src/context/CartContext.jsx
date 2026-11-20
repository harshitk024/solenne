import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { quoteCart } from "../data/checkout";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const CART_KEY = "solenne-cart";
const META_KEY = "solenne-cart-meta";
const ORDER_KEY = "solenne-last-order";
const HISTORY_KEY = "solenne-orders";

const read = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => read(CART_KEY, []));
  const [meta, setMeta] = useState(() => read(META_KEY, { coupon: "", method: "studio" }));
  const [order, setOrder] = useState(() => read(ORDER_KEY, null));
  const [orders, setOrders] = useState(() => {
    const saved = read(HISTORY_KEY, []);
    if (saved.length) return saved;
    const last = read(ORDER_KEY, null);
    return last ? [last] : [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [couponBook, setCouponBook] = useState(null);

  useEffect(() => {
    api("/api/coupons")
      .then((rows) => {
        if (!Array.isArray(rows) || !rows.length) return;
        setCouponBook(Object.fromEntries(rows.map((row) => [row.code, row])));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }, [meta]);

  useEffect(() => {
    if (order) localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (!user) return;
    api("/api/cart")
      .then((cart) => {
        setItems(cart.items);
        setMeta({ coupon: cart.coupon || "", method: cart.method || "studio" });
      })
      .catch(() => {});
    api("/api/orders")
      .then((rows) => {
        if (Array.isArray(rows)) setOrders(rows);
      })
      .catch(() => {});
  }, [user]);

  const addItem = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const note = product.note || existing?.note || "";
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, note: product.note || item.note || "" }
            : item,
        );
      }
      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          note,
        },
      ];
    });
    setIsOpen(true);
    if (user) {
      api("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity, note: product.note || "" }),
      }).catch(() => {});
    }
  };

  const syncItem = (id, body) => {
    if (!user) return;
    api(`/api/cart/items/${id}`, { method: "PATCH", body: JSON.stringify(body) }).catch(() => {});
  };

  const updateQuantity = (id, quantity) => {
    setItems((current) =>
      quantity < 1
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
    syncItem(id, { quantity });
  };

  const updateNote = (id, note) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, note } : item)));
    syncItem(id, { note });
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (user) api(`/api/cart/items/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const applyCoupon = (code) => {
    const quote = quoteCart({ subtotal: 1, couponCode: code, methodId: meta.method, couponBook: couponBook || undefined });
    if (!quote.coupon) return { ok: false, message: "That code is not in the book." };
    setMeta((current) => ({ ...current, coupon: quote.code }));
    if (user) api("/api/cart/coupon", { method: "POST", body: JSON.stringify({ code: quote.code }) }).catch(() => {});
    return { ok: true, message: quote.coupon.label };
  };

  const clearCoupon = () => {
    setMeta((current) => ({ ...current, coupon: "" }));
    if (user) api("/api/cart/coupon", { method: "DELETE" }).catch(() => {});
  };
  const setMethod = (method) => {
    setMeta((current) => ({ ...current, method }));
    if (user) api("/api/cart", { method: "PATCH", body: JSON.stringify({ method }) }).catch(() => {});
  };

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quote = quoteCart({ subtotal, couponCode: meta.coupon, methodId: meta.method, couponBook: couponBook || undefined });
  const { discount, shipping, total } = quote;

  const clear = () => {
    setItems([]);
    setMeta({ coupon: "", method: "studio" });
    if (user) api("/api/cart", { method: "DELETE" }).catch(() => {});
  };

  const rememberOrder = (saved) => {
    setOrder(saved);
    setOrders((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
    setItems([]);
    setMeta({ coupon: "", method: "studio" });
  };

  const getOrder = (id) => orders.find((entry) => entry.id === id) || (order?.id === id ? order : null);

  const reorder = (id) => {
    const previous = getOrder(id);
    if (!previous) return false;
    setItems((current) => {
      const next = [...current];
      previous.items.forEach((item) => {
        const existing = next.find((entry) => entry.id === item.id);
        if (existing) existing.quantity += item.quantity;
        else next.push({ ...item });
      });
      return next;
    });
    setIsOpen(true);
    return true;
  };

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      discount,
      shipping,
      total,
      coupon: quote.coupon,
      couponCode: quote.code,
      method: quote.method,
      order,
      orders,
      getOrder,
      reorder,
      isOpen,
      setIsOpen,
      addItem,
      updateQuantity,
      updateNote,
      removeItem,
      applyCoupon,
      clearCoupon,
      setMethod,
      clear,
      rememberOrder,
    }),
    [items, count, subtotal, discount, shipping, total, quote.coupon, quote.code, quote.method, order, orders, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
