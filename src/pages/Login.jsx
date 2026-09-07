import { useState } from "react";
import { api, setToken } from "../api";

export default function Login({ onAuthed, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      onAuthed();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Enter, if you dare</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" disabled={busy}>
          {busy ? "Entering…" : "Log in"}
        </button>
      </form>
      <div className="switch-link">
        New here? <a onClick={goToSignup}>Create an account</a>
      </div>
    </div>
  );
}
