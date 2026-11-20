import { useState } from "react";
import { Link } from "react-router-dom";
import { brand } from "../data/store";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="page">
      <div className="container">
        <header className="page-hero">
          <p className="crumbs">
            <Link to="/">Home</Link> / Contact
          </p>
          <span className="eyebrow">The studio</span>
          <h1>Write to us.</h1>
          <p>For orders already wrapped, bespoke tables, or a gift you cannot quite name.</p>
        </header>
        <div className="contact-grid reading">
          <form
            className="panel"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
              event.currentTarget.reset();
            }}
          >
            <div className="split">
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" required placeholder="Your name" />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required placeholder="you@domain.com" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="topic">Regarding</label>
              <select id="topic" name="topic" defaultValue="order">
                <option value="order">An order</option>
                <option value="bespoke">Something bespoke</option>
                <option value="studio">A studio visit</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="6" required placeholder="Tell us the occasion." />
            </div>
            <button className="btn btn-dark" type="submit">
              Send the note
            </button>
            {sent && <p className="form-note">Received. A person at the studio will reply within a day.</p>}
          </form>
          <aside className="panel">
            <h2 className="serif" style={{ marginTop: 0, fontSize: "2.4rem" }}>
              Visit, or call.
            </h2>
            <p>{brand.address}</p>
            <p style={{ marginTop: 8 }}>{brand.phone}</p>
            <p style={{ marginTop: 8 }}>
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </p>
            <p className="muted" style={{ marginTop: 18 }}>
              The studio is open Tuesday to Saturday, late morning until the light goes. Appointments are kinder than walk-ins when you are choosing for a wedding.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
