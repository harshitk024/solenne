import { Link } from "react-router-dom";
import { formatPrice } from "../data/store";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { IconHeart } from "./Icons";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const saved = has(product.id);

  return (
    <article className="product-card">
      <div className="product-media">
        {product.badge && <span className="pill">{product.badge}</span>}
        <button
          className={`wish-btn ${saved ? "saved" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          onClick={() => toggle(product.id)}
        >
          <IconHeart filled={saved} />
        </button>
        <Link to={`/product/${product.id}`} aria-label={product.name}>
          <img className="primary" src={product.image} alt={product.name} />
          <img className="hover" src={product.hover} alt="" />
        </Link>
        <button className="btn btn-dark quick-add" onClick={() => addItem(product)} disabled={product.stock === 0}>
          {product.stock === 0 ? "Sold out" : "Add to bag"}
        </button>
      </div>
      <div className="product-meta">
        <div>
          <h3>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="short">{product.short}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="price">{formatPrice(product.price)}</div>
          {product.compareAt && <div className="compare">{formatPrice(product.compareAt)}</div>}
          <div className="stars" aria-label={`${product.rating} stars`}>
            {"★★★★★".slice(0, Math.round(product.rating))}
            <span className="muted"> {product.rating}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
