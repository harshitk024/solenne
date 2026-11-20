import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { IconHeart } from "../components/Icons";
import { formatPrice, getCategory, getOccasion } from "../data/store";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Product() {
  const { id } = useParams();
  const { products, getProduct } = useCatalog();
  const product = getProduct(id);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [tab, setTab] = useState("story");

  useEffect(() => {
    setQty(1);
    setActive(0);
    setNote("");
    setSavedNote("");
    setTab("story");
  }, [id]);

  if (!product) {
    return (
      <div className="page container empty">
        <h2>This piece has left the table.</h2>
        <Link to="/shop" className="btn btn-dark">
          Return to the shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image, product.hover];
  const category = getCategory(product.category);
  const saved = has(product.id);
  const related = products
    .filter((item) => item.id !== product.id && (item.category === product.category || item.occasions.some((occasion) => product.occasions.includes(occasion))))
    .slice(0, 3);

  const add = () => addItem({ ...product, note: savedNote }, qty);

  return (
    <div className="page">
      <div className="container">
        <p className="crumbs">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{" "}
          <Link to={`/shop?category=${product.category}`}>{category?.name}</Link> / {product.name}
        </p>
        <div className="detail">
          <div className="detail-gallery">
            <div className="gallery-stage">
              <img src={images[active]} alt={`${product.name} — view ${active + 1}`} />
              {images.length > 1 && (
                <>
                  <button
                    className="gallery-nav prev"
                    aria-label="Previous image"
                    onClick={() => setActive((index) => (index - 1 + images.length) % images.length)}
                  >
                    ‹
                  </button>
                  <button
                    className="gallery-nav next"
                    aria-label="Next image"
                    onClick={() => setActive((index) => (index + 1) % images.length)}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            <div className="thumbs">
              {images.map((src, index) => (
                <button key={`${src}-${index}`} className={index === active ? "active" : ""} onClick={() => setActive(index)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow">{category?.name}</span>
            <h1>{product.name}</h1>
            <div className="detail-top">
              <span className="price">
                {formatPrice(product.price)}
                {product.compareAt && <s className="compare">{formatPrice(product.compareAt)}</s>}
              </span>
              <span className="stars">
                ★ {product.rating} <span className="muted">({product.reviews} notes)</span>
              </span>
            </div>
            <p className="lede" style={{ marginTop: 18 }}>
              {product.description}
            </p>
            <p className="muted" style={{ marginTop: 10 }}>
              {product.stock > 0 ? `${product.stock} in the studio` : "Currently with a waitlist"} · SKU {product.sku}
            </p>
            <div className="occasion-pills">
              {product.occasions.map((occasionId) => {
                const occasion = getOccasion(occasionId);
                return (
                  <Link key={occasionId} to={`/shop?occasion=${occasionId}`} className="chip">
                    {occasion?.name || occasionId}
                  </Link>
                );
              })}
            </div>
            <div className="detail-actions">
              <div className="qty">
                <button onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                  −
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty((value) => value + 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button className="btn btn-dark" onClick={add} disabled={product.stock === 0}>
                {product.stock === 0 ? "Sold out" : `Add to bag · ${formatPrice(product.price * qty)}`}
              </button>
              <button
                className={`icon-btn wish-inline ${saved ? "saved" : ""}`}
                aria-pressed={saved}
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                onClick={() => toggle(product.id)}
              >
                <IconHeart filled={saved} />
              </button>
            </div>
            <form
              className="note-box"
              onSubmit={(event) => {
                event.preventDefault();
                setSavedNote(note.trim());
              }}
            >
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="A line for the card — we will write it in ink."
                aria-label="Gift note"
              />
              <button className="btn btn-line" type="submit">
                Save note
              </button>
            </form>
            {savedNote && <p className="form-note">“{savedNote}” will travel with this gift.</p>}

            <div className="tabs" role="tablist">
              {[
                ["story", "Story"],
                ["details", "Details"],
                ["care", "Care"],
                ["notes", "Notes"],
              ].map(([key, label]) => (
                <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="tab-panel">
              {tab === "story" && <p>{product.story}</p>}
              {tab === "details" && (
                <ul>
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                  <li>{product.materials}</li>
                  <li>{product.made}</li>
                </ul>
              )}
              {tab === "care" && <p>{product.care}</p>}
              {tab === "notes" && (
                <div className="review-list">
                  {(product.reviewsList || []).map((review) => (
                    <blockquote key={review.name}>
                      <p>“{review.text}”</p>
                      <footer>
                        {review.name} · {review.place} · {"★".repeat(review.rating)}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related">
            <div className="section-head">
              <h2>Alongside it</h2>
              <Link to={`/shop?category=${product.category}`} className="text-link">
                More in {category?.name}
              </Link>
            </div>
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
