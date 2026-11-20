import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / Our story
          </p>
          <span className="eyebrow">The house</span>
          <h1>We wrap what we would give.</h1>
        </header>
        <div className="about-grid reading">
          <img
            src="https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80"
            alt="The Solenne wrapping table"
            style={{ width: "100%", height: "520px", objectFit: "cover", borderRadius: "28px" }}
          />
          <div>
            <p className="lede">
              Solenne began as a wrapping table in a Mercer Street studio — a place to slow down the last hour before a gift changed hands.
            </p>
            <p className="muted" style={{ marginTop: 18 }}>
              We still edit small. Candles poured nearby, paper we can fold without cracking, honey from groves we have visited, florals that do not ask for water. If it does not feel like a gesture, it does not stay.
            </p>
            <p className="muted" style={{ marginTop: 18 }}>
              Orders leave within two days. Notes are written in ink, from your words. Returns are simple for thirty days if a piece was not meant to be given. The ribbon, if they keep it, is the point.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <Link to="/shop" className="btn btn-dark">
                Shop the edit
              </Link>
              <Link to="/contact" className="btn btn-line">
                Write to the studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
