import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import { IconArrow } from "../components/Icons";
import {
  categories,
  gallery,
  occasions,
  reasons,
  testimonials,
} from "../data/store";
import { useCatalog } from "../context/CatalogContext";

export default function Home() {
  const { products } = useCatalog();
  const bestsellers = products.filter((product) => product.bestseller).slice(0, 6);
  const arrivals = products.filter((product) => product.isNew).slice(0, 6);
  const [quote, setQuote] = useState(0);
  const active = testimonials[quote];

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A house of gifts</span>
          <h1>
            Given slowly.
            <br />
            <em>Remembered longer.</em>
          </h1>
          <p className="lede">
            Solenne is a small edit of candles, florals, table pieces, and handwritten gestures — wrapped by hand for the people you refuse to rush.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-dark">
              Shop the edit <IconArrow />
            </Link>
            <Link to="/occasions" className="btn btn-line">
              Gifts by occasion
            </Link>
          </div>
          <div className="hero-meta">
            <div>
              <strong>48h</strong>
              Wrapped & sent
            </div>
            <div>
              <strong>Ink</strong>
              Notes, handwritten
            </div>
            <div>
              <strong>0</strong>
              Plastic in the box
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1400&q=80"
            alt="Hands wrapping a gift in ivory paper and blush ribbon"
          />
          <Link to="/product/blush-peony-box" className="hero-card">
            <img
              src="https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=600&q=80"
              alt="Preserved blush peonies"
            />
            <span>This week’s gesture</span>
            <strong>Blush Peony Keepsake</strong>
          </Link>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, index) => (
            <span key={index}>
              Hand-wrapped · Complimentary notes · Preserved florals · Scented rituals · The table · Pantry gifts · Written words · Quiet home ·
            </span>
          ))}
        </div>
      </div>

      <section className="section" id="categories">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">The edit</span>
              <h2>Featured categories</h2>
            </div>
            <p>Six rooms of the house. Begin wherever the occasion is pulling you.</p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="category-card"
              >
                <img src={category.image} alt={category.name} />
                <figcaption>
                  <h3>{category.name}</h3>
                  <p>
                    {category.blurb} · {category.count} pieces
                  </p>
                </figcaption>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft" id="bestsellers">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Most given</span>
              <h2>Bestsellers</h2>
            </div>
            <Link to="/shop" className="text-link">
              View all <IconArrow />
            </Link>
          </div>
          <div className="product-grid">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="arrivals">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Just unwrapped</span>
              <h2>New arrivals</h2>
            </div>
            <Link to="/shop?filter=new" className="text-link">
              See what is new <IconArrow />
            </Link>
          </div>
          <div className="product-grid">
            {arrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section soft" id="occasions">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">The reason</span>
              <h2>Gifts by occasion</h2>
            </div>
            <p>Tell us the moment. We will narrow the house to what belongs there.</p>
          </div>
          <div className="occasion-grid">
            {occasions.map((occasion) => (
              <Link
                key={occasion.id}
                to={`/occasions/${occasion.id}`}
                className="occasion-card"
              >
                <img src={occasion.image} alt={occasion.name} />
                <figcaption>
                  <p>{occasion.season}</p>
                  <h3>{occasion.name}</h3>
                </figcaption>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="why">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">The house rules</span>
              <h2>Why Solenne</h2>
            </div>
          </div>
          <div className="reasons">
            {reasons.map((reason, index) => (
              <article className="reason" key={reason.title}>
                <div className="num">0{index + 1}</div>
                <h3>{reason.title}</h3>
                <p className="muted">{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container quote-wrap">
          <div>
            <span className="eyebrow">In their words</span>
            <h2 style={{ fontSize: "clamp(2.6rem, 5vw, 4.4rem)", margin: "10px 0 0" }}>
              Notes we kept.
            </h2>
            <div className="quote-nav">
              {testimonials.map((item, index) => (
                <button
                  key={item.name}
                  className={index === quote ? "active" : ""}
                  onClick={() => setQuote(index)}
                  aria-label={`Show note from ${item.name}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <article className="quote-card">
            <blockquote>“{active.quote}”</blockquote>
            <div>
              <strong>{active.name}</strong>
              <p className="muted">
                {active.place} · {active.gift}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">@solenne.gift</span>
              <h2>From the studio</h2>
            </div>
            <p>A glimpse of what left the table this week. Follow along — the grid is the journal.</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((shot) => (
              <a
                key={shot.src}
                className="gallery-card"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
              >
                <img src={shot.src} alt={shot.alt} />
                <span>View</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
