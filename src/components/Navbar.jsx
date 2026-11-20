import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { brand, navLinks } from "../data/store";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { IconBag, IconHeart, IconMenu, IconSearch } from "./Icons";

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { count: savedCount } = useWishlist();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  return (
    <header>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <button
            className="icon-btn menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            <IconMenu open={menuOpen} />
          </button>

          <div className="nav-links">
            {navLinks.map((link) => (
              <NavLink key={link.label} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            {brand.name}
            <span>.</span>
          </Link>

          <div className="nav-actions">
            <button
              className={`icon-btn ${searchOpen ? "active" : ""}`}
              aria-label="Search"
              onClick={() => {
                setSearchOpen((open) => !open);
                setMenuOpen(false);
              }}
            >
              <IconSearch />
            </button>
            <Link to="/account" className="nav-account">
              {user ? user.name.split(" ")[0] : "Sign in"}
            </Link>
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <IconHeart filled={savedCount > 0} />
              {savedCount > 0 && <span className="badge">{savedCount}</span>}
            </Link>
            <button className="icon-btn" aria-label="Open bag" onClick={() => setIsOpen(true)}>
              <IconBag />
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className="search-panel">
          <form className="container" onSubmit={submitSearch}>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search candles, florals, occasions…"
              aria-label="Search the shop"
            />
            <button className="btn btn-dark" type="submit">
              Search
            </button>
          </form>
        </div>
      )}

      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link to="/account" onClick={() => setMenuOpen(false)}>
          {user ? "Account" : "Sign in"}
        </Link>
        <Link to="/orders" onClick={() => setMenuOpen(false)}>
          Orders
        </Link>
      </div>
    </header>
  );
}
