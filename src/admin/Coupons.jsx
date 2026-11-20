import { useState } from "react";
import { api } from "../lib/api";
import { useAdmin } from "./useAdmin";

const blank = { code: "", label: "", type: "percent", amount: 10, active: true };

export default function Coupons() {
  const { data, error, loading, reload } = useAdmin("/api/admin/coupons");
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api(editing ? `/api/admin/coupons/${form.code}` : "/api/admin/coupons", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({ ...form, amount: Number(form.amount), active: Boolean(form.active) }),
      });
      setForm(blank);
      setEditing(false);
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <header className="admin-top">
        <div>
          <p className="admin-label">Courtesy</p>
          <h1>Coupons</h1>
        </div>
      </header>
      {message && <p>{message}</p>}
      <form className="admin-card admin-form" onSubmit={submit} style={{ marginBottom: 18 }}>
        <input placeholder="CODE" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} required disabled={editing} />
        <input placeholder="Label" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} required />
        <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
          <option value="percent">Percent</option>
          <option value="fixed">Fixed amount</option>
          <option value="shipping">Free shipping</option>
        </select>
        <input type="number" min="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        <label><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Active</label>
        <button className="btn btn-dark" type="submit">{editing ? "Update" : "Add coupon"}</button>
      </form>
      {loading ? <p>Loading…</p> : error ? <p>{error}</p> : (
        <table className="admin-table">
          <thead><tr><th>Code</th><th>Offer</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.map((coupon) => (
              <tr key={coupon.code}>
                <td>{coupon.code}</td>
                <td>{coupon.label} · {coupon.type} {coupon.amount || ""}</td>
                <td>{coupon.active ? "Active" : "Paused"}</td>
                <td className="admin-actions">
                  <button className="remove" onClick={() => { setEditing(true); setForm(coupon); }}>Edit</button>
                  <button className="danger" onClick={async () => { await api(`/api/admin/coupons/${coupon.code}`, { method: "DELETE" }); reload(); }}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
