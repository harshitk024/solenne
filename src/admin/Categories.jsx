import { useState } from "react";
import { api } from "../lib/api";
import { useAdmin } from "./useAdmin";

const blank = { id: "", name: "", blurb: "", image: "" };

export default function Categories() {
  const { data, error, loading, reload } = useAdmin("/api/admin/categories");
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api(editing ? `/api/admin/categories/${form.id}` : "/api/admin/categories", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setForm(blank);
      setEditing(false);
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/api/admin/categories/${id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <header className="admin-top">
        <div>
          <p className="admin-label">Rooms of the house</p>
          <h1>Categories</h1>
        </div>
      </header>
      {message && <p>{message}</p>}
      <form className="admin-card admin-form" onSubmit={submit} style={{ marginBottom: 18 }}>
        <input placeholder="ID" value={form.id} onChange={set("id")} required disabled={editing} />
        <input placeholder="Name" value={form.name} onChange={set("name")} required />
        <input className="wide" placeholder="Blurb" value={form.blurb} onChange={set("blurb")} required />
        <input className="wide" placeholder="Image URL" value={form.image} onChange={set("image")} required />
        <button className="btn btn-dark" type="submit">{editing ? "Update" : "Add category"}</button>
      </form>
      {loading ? <p>Loading…</p> : error ? <p>{error}</p> : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Pieces</th><th></th></tr></thead>
          <tbody>
            {data.map((category) => (
              <tr key={category.id}>
                <td>{category.name}<br /><span className="admin-label">{category.blurb}</span></td>
                <td>{category.count}</td>
                <td className="admin-actions">
                  <button className="remove" onClick={() => { setEditing(true); setForm(category); }}>Edit</button>
                  <button className="danger" onClick={() => remove(category.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
