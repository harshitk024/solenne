import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
  };

  return (
    <section className="section">
      <div className="container">
        <div className="newsletter">
          <div>
            <span className="eyebrow" style={{ color: "#f6efe6" }}>
              The Sunday note
            </span>
            <h2>A letter, not a catalogue.</h2>
            <p>
              Occasional notes on what we are wrapping, which flowers are in season, and gifts worth waiting for.
            </p>
            {done ? (
              <p className="form-note">You are on the list. We will write when there is something worth saying.</p>
            ) : (
              <form onSubmit={submit}>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-label="Email address"
                />
                <button className="btn btn-blush" type="submit">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
