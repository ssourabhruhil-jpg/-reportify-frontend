import { useState } from "react";
import { api, setToken } from "../api";

export default function Signup({ onAuthed, goToLogin }) {
  const [step, setStep] = useState("start"); // "start" | "verify"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleStart(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.signupStart(email, password);
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api.signupVerify(email, code);
      setToken(data.access_token);
      onAuthed();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (step === "verify") {
    return (
      <div className="card">
        <h2>Enter the code sent to your grave&hellip; err, email</h2>
        <form onSubmit={handleVerify}>
          <label htmlFor="code">Verification code</label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            required
          />
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" disabled={busy}>
            {busy ? "Verifying…" : "Verify & enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Summon a new account</h2>
      <form onSubmit={handleStart}>
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
          {busy ? "Sending…" : "Send verification code"}
        </button>
      </form>
      <div className="switch-link">
        Already have an account? <a onClick={goToLogin}>Log in</a>
      </div>
    </div>
  );
}
