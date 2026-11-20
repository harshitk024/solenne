import { Link } from "react-router-dom";
import { brand } from "../data/store";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand">
            {brand.name}
            <span>.</span>
          </Link>
          <p>{brand.tagline} A small house of objects chosen to be given, not merely bought.</p>
        </div>
        <div className="footer-col">
          <h4>Visit</h4>
          <Link to="/shop">The Shop</Link>
          <Link to="/occasions">Occasions</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Care</h4>
          <Link to="/account">Account</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Your bag</Link>
        </div>
        <div className="footer-col">
          <h4>Studio</h4>
          <p>{brand.address}</p>
          <p>{brand.phone}</p>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
        <span>Wrapped in New York · Sent anywhere</span>
      </div>
    </footer>
  );
}
