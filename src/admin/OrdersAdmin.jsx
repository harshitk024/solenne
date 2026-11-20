import { Fragment, useState } from "react";
import { money, useAdmin } from "./useAdmin";

export default function OrdersAdmin() {
  const { data, error, loading } = useAdmin("/api/admin/orders");
  const [open, setOpen] = useState(null);
  if (loading) return <p>Gathering orders…</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <header className="admin-top">
        <div>
          <p className="admin-label">What has left</p>
          <h1>Orders</h1>
        </div>
      </header>
      <table className="admin-table">
        <thead>
          <tr><th>Order</th><th>For</th><th>Customer</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          {data.map((order) => (
            <Fragment key={order.id}>
              <tr>
                <td>{order.id}<br /><span className="admin-label">{new Date(order.placedAt).toLocaleDateString()}</span></td>
                <td>{order.recipient}<br />{order.address.city}</td>
                <td>{order.customer?.name}<br />{order.customer?.email}</td>
                <td>{money(order.total)}<br /><span className="admin-label">{order.status || "paid"}</span></td>
                <td><button className="remove" onClick={() => setOpen(open === order.id ? null : order.id)}>Details</button></td>
              </tr>
              {open === order.id && (
                <tr>
                  <td colSpan="5">
                    {order.items.map((item) => (
                      <p key={item.id}>{item.name} × {item.quantity} · {money(item.price * item.quantity)}</p>
                    ))}
                    <p>{order.address.line1}, {order.address.city} {order.address.postal}</p>
                    <p>{order.method.label}{order.coupon ? ` · ${order.coupon}` : ""}</p>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p>No orders have been placed.</p>}
    </>
  );
}
