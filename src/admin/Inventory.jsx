import { useState } from "react";
import { api } from "../lib/api";
import { useAdmin } from "./useAdmin";

export default function Inventory() {
  const { data, error, loading, reload } = useAdmin("/api/admin/products");
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState("");

  const save = async (product) => {
    try {
      await api(`/api/admin/products/${product.id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stock: Number(drafts[product.id] ?? product.stock) }),
      });
      setMessage(`${product.name} updated.`);
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const rows = (data || []).slice().sort((a, b) => a.stock - b.stock);

  return (
    <>
      <header className="admin-top">
        <div>
          <p className="admin-label">On the shelf</p>
          <h1>Inventory</h1>
        </div>
      </header>
      {message && <p>{message}</p>}
      {loading ? <p>Counting…</p> : error ? <p>{error}</p> : (
        <table className="admin-table">
          <thead>
            <tr><th>Piece</th><th>SKU</th><th>On hand</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>
                  <input
                    className="admin-search"
                    style={{ maxWidth: 120 }}
                    type="number"
                    min="0"
                    value={drafts[product.id] ?? product.stock}
                    onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                  />
                </td>
                <td><button className="btn btn-line" onClick={() => save(product)}>Save</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
