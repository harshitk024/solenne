import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useCatalog } from "../context/CatalogContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const { ids, clear } = useWishlist();
  const { products } = useCatalog();
  const { addItem } = useCart();
  const saved = products.filter((product) => ids.includes(product.id));

  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / Wishlist
          </p>
          <span className="eyebrow">Saved for later</span>
          <h1>Your wishlist</h1>
          <p>
            {saved.length
              ? `${saved.length} piece${saved.length === 1 ? "" : "s"} kept on this browser, ready when the occasion is.`
              : "Nothing saved yet. Hearts on the shop will gather a private edit here."}
          </p>
        </header>
        {saved.length === 0 ? (
          <div className="empty">
            <Link to="/shop" className="btn btn-dark">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="toolbar">
              <button
                className="btn btn-dark"
                onClick={() => saved.forEach((product) => product.stock > 0 && addItem(product))}
              >
                Add all to bag
              </button>
              <button className="btn btn-line" onClick={clear}>
                Clear wishlist
              </button>
            </div>
            <div className="product-grid">
              {saved.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
