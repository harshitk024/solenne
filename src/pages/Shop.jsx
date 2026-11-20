import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  categories,
  filterCatalog,
  formatPrice,
  occasions,
  priceBounds,
  sortCatalog,
  sortOptions,
} from "../data/store";
import { useCatalog } from "../context/CatalogContext";

const defaults = {
  category: "all",
  occasion: "all",
  filter: "all",
  sort: "featured",
  min: String(priceBounds.min),
  max: String(priceBounds.max),
};

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { products } = useCatalog();
  const category = params.get("category") || defaults.category;
  const occasion = params.get("occasion") || defaults.occasion;
  const filter = params.get("filter") || defaults.filter;
  const query = params.get("q") || "";
  const sort = params.get("sort") || defaults.sort;
  const min = Number(params.get("min") ?? priceBounds.min);
  const max = Number(params.get("max") ?? priceBounds.max);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === defaults[key] || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const setMany = (entries) => {
    const next = new URLSearchParams(params);
    Object.entries(entries).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === defaults[key] || value === "all") next.delete(key);
      else next.set(key, String(value));
    });
    setParams(next);
  };

  const visible = useMemo(() => {
    const filtered = filterCatalog(products, { category, occasion, filter, min, max, query });
    return sortCatalog(filtered, sort);
  }, [category, occasion, filter, min, max, query, sort]);

  const activeCategory = categories.find((item) => item.id === category);
  const title = query.trim()
    ? `Results for “${query.trim()}”`
    : activeCategory
      ? activeCategory.name
      : filter === "new"
        ? "New arrivals"
        : filter === "best"
          ? "Bestsellers"
          : "The shop";

  const clearAll = () => setParams(new URLSearchParams());

  const chips = [
    query.trim() && { key: "q", label: `“${query.trim()}”` },
    activeCategory && { key: "category", label: activeCategory.name },
    occasion !== "all" && { key: "occasion", label: occasions.find((item) => item.id === occasion)?.name },
    filter === "new" && { key: "filter", label: "New" },
    filter === "best" && { key: "filter", label: "Bestsellers" },
    (min > priceBounds.min || max < priceBounds.max) && {
      key: "price",
      label: `${formatPrice(min)} – ${formatPrice(max)}`,
    },
  ].filter(Boolean);

  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / Shop
            {activeCategory ? ` / ${activeCategory.name}` : ""}
          </p>
          <span className="eyebrow">The collection</span>
          <h1>{title}</h1>
          <p>
            {visible.length} piece{visible.length === 1 ? "" : "s"} currently on the table.
            {activeCategory ? ` ${activeCategory.blurb}.` : " Every one leaves wrapped, with room for a note."}
          </p>
        </header>

        <div className="shop-layout">
          <aside className={`filter-panel ${filtersOpen ? "open" : ""}`}>
            <div className="filter-head">
              <h2>Refine</h2>
              <button className="remove" onClick={() => setFiltersOpen(false)}>
                Close
              </button>
            </div>

            <form
              className="shop-search"
              onSubmit={(event) => {
                event.preventDefault();
                const value = new FormData(event.currentTarget).get("q");
                setParam("q", String(value || "").trim());
              }}
            >
              <label htmlFor="shop-q">Search</label>
              <input id="shop-q" name="q" defaultValue={query} placeholder="Candle, linen, peony…" />
            </form>

            <fieldset>
              <legend>Category</legend>
              <label className="check">
                <input type="radio" name="category" checked={category === "all"} onChange={() => setParam("category", "all")} />
                All pieces
              </label>
              {categories.map((item) => (
                <label className="check" key={item.id}>
                  <input
                    type="radio"
                    name="category"
                    checked={category === item.id}
                    onChange={() => setParam("category", item.id)}
                  />
                  {item.name}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>Occasion</legend>
              <select value={occasion} onChange={(event) => setParam("occasion", event.target.value)} aria-label="Occasion">
                <option value="all">Any occasion</option>
                {occasions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <legend>Price</legend>
              <div className="price-sliders">
                <label>
                  Min {formatPrice(min)}
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={Math.min(min, max)}
                    onChange={(event) => setMany({ min: Math.min(Number(event.target.value), max) })}
                  />
                </label>
                <label>
                  Max {formatPrice(max)}
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={Math.max(max, min)}
                    onChange={(event) => setMany({ max: Math.max(Number(event.target.value), min) })}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Edit</legend>
              <label className="check">
                <input type="checkbox" checked={filter === "new"} onChange={() => setParam("filter", filter === "new" ? "all" : "new")} />
                New arrivals
              </label>
              <label className="check">
                <input type="checkbox" checked={filter === "best"} onChange={() => setParam("filter", filter === "best" ? "all" : "best")} />
                Bestsellers
              </label>
            </fieldset>

            <button className="btn btn-line" type="button" onClick={clearAll}>
              Clear all
            </button>
          </aside>

          <div>
            <div className="toolbar">
              <button className="btn btn-line filter-toggle" type="button" onClick={() => setFiltersOpen(true)}>
                Filters
              </button>
              <p className="muted">{visible.length} shown</p>
              <label className="muted sort-label">
                Sort{" "}
                <select value={sort} onChange={(event) => setParam("sort", event.target.value)}>
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {chips.length > 0 && (
              <div className="filters active-filters">
                {chips.map((chip) => (
                  <button
                    key={chip.label}
                    className="chip active"
                    onClick={() => {
                      if (chip.key === "price") setMany({ min: priceBounds.min, max: priceBounds.max });
                      else setParam(chip.key, "");
                    }}
                  >
                    {chip.label} ×
                  </button>
                ))}
              </div>
            )}

            {visible.length === 0 ? (
              <div className="empty">
                <h2>Nothing in this edit.</h2>
                <p className="muted">Widen the price, or clear the filters and begin again.</p>
                <button className="btn btn-line" onClick={clearAll}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="product-grid shop-grid">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {filtersOpen && <div className="drawer-backdrop filter-backdrop" onClick={() => setFiltersOpen(false)} />}
    </div>
  );
}
