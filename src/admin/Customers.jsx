import { useState } from "react";
import { api } from "../lib/api";
import { money, useAdmin } from "./useAdmin";

export default function Customers() {
  const { data, error, loading, reload } = useAdmin("/api/admin/customers");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [message, setMessage] = useState("");

  const create = async (event) => {
    event.preventDefault();
    try {
      await api("/api/admin/customers", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", password: "", role: "customer" });
      setMessage("Account created.");
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const setRole = async (id, role) => {
    try {
      await api(`/api/admin/customers/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <header className="admin-top">
        <div>
          <p className="admin-label">The house book</p>
          <h1>Customers</h1>
        </div>
      </header>
      {message && <p>{message}</p>}
      <form className="admin-card admin-form" onSubmit={create} style={{ marginBottom: 18 }}>
        <input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input placeholder="Temporary password" type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-dark" type="submit">Create account</button>
      </form>
      {loading ? <p>Loading…</p> : error ? <p>{error}</p> : (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Orders</th><th>Spent</th><th>Role</th></tr>
          </thead>
          <tbody>
            {data.map((person) => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>{person.email}</td>
                <td>{person.orders}</td>
                <td>{money(person.spent)}</td>
                <td>
                  <select value={person.role} onChange={(event) => setRole(person.id, event.target.value)}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
