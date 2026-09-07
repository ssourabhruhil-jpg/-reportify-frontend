import { useState } from "react";
import { getToken } from "./api";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [view, setView] = useState("login"); // "login" | "signup"

  return (
    <div className="app-shell">
      {!authed && (
        <>
          <h1 className="brand">Reportify</h1>
          <p className="tagline">Your statements, exhumed and converted.</p>
        </>
      )}

      {authed ? (
        <Dashboard onLogout={() => setAuthed(false)} />
      ) : view === "signup" ? (
        <Signup onAuthed={() => setAuthed(true)} goToLogin={() => setView("login")} />
      ) : (
        <Login onAuthed={() => setAuthed(true)} goToSignup={() => setView("signup")} />
      )}

      <Footer />
    </div>
  );
}
