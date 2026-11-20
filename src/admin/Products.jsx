import { useState } from "react";
import { api } from "../lib/api";
import { money, useAdmin } from "./useAdmin";

const blank = {
  id: "",
  name: "",
  price: 48,
  category: "candles",
  stock: 10,
  sku: "",
  short: "",
  description: "",
  images: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
  bestseller: false,
  isNew: true,
};

export default function Products() {
  const { data, error, loading, reload } = useAdmin("/api/admin/products");
  const { data: categories } = useAdmin("/api/admin/categories");
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: String(form.images).split(",").map((item) => item.trim()).filter(Boolean),
      occasions: [],
      details: [],
    };
    try {
      await api(editing ? `/api/admin/products/${form.id}` : "/api/admin/products", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setForm(blank);
      setEditing(false);
      setMessage("Saved.");
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const edit = (product) => {
    setEditing(true);
    setForm({
      ...product,
      images: product.images.join(", "),
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this piece?")) return;
    try {
      await api(`/api/admin/products/${id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <header className="admin-top">
        <div>
          <p className="admin-label">The edit</p>
          <h1>Products</h1>
        </div>
      </header>
      {message && <p>{message}</p>}
      <form className="admin-card admin-form" onSubmit={submit} style={{ marginBottom: 18 }}>
        <input placeholder="ID" value={form.id} onChange={set("id")} required disabled={editing} />
        <input placeholder="Name" value={form.name} onChange={set("name")} required />
        <input placeholder="Price" type="number" value={form.price} onChange={set("price")} required />
        <input placeholder="Stock" type="number" value={form.stock} onChange={set("stock")} required />
        <input placeholder="SKU" value={form.sku} onChange={set("sku")} required />
        <select value={form.category} onChange={set("category")}>
          {(categories || []).map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input className="wide" placeholder="Short line" value={form.short} onChange={set("short")} required />
        <textarea className="wide" placeholder="Description" value={form.description} onChange={set("description")} required />
        <input className="wide" placeholder="Image URLs, comma separated" value={form.images} onChange={set("images")} required />
        <label><input type="checkbox" checked={form.bestseller} onChange={set("bestseller")} /> Bestseller</label>
        <label><input type="checkbox" checked={form.isNew} onChange={set("isNew")} /> New</label>
        <div className="admin-actions wide">
          <button className="btn btn-dark" type="submit">{editing ? "Update piece" : "Add piece"}</button>
          {editing && <button className="btn btn-line" type="button" onClick={() => { setEditing(false); setForm(blank); }}>Cancel</button>}
        </div>
      </form>
      {loading ? <p>Loading…</p> : error ? <p>{error}</p> : (
        <table className="admin-table">
          <thead>
            <tr><th>Piece</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr key={product.id}>
                <td>{product.name}<br /><span className="admin-label">{product.sku}</span></td>
                <td>{product.category}</td>
                <td>{money(product.price)}</td>
                <td className={product.stock <= 5 ? "low" : ""}>{product.stock}</td>
                <td className="admin-actions">
                  <button className="remove" onClick={() => edit(product)}>Edit</button>
                  <button className="danger" onClick={() => remove(product.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
