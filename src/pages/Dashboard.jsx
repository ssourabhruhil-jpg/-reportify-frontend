import { useEffect, useState } from "react";
import { api, clearToken } from "../api";

export default function Dashboard({ onLogout }) {
  const [accounts, setAccounts] = useState([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    tally_ledger_name: "",
  });
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAccounts() {
    try {
      const data = await api.listAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleAddAccount(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.addAccount(newAccount);
      setNewAccount({ bank_name: "", account_number: "", account_holder_name: "", tally_ledger_name: "" });
      setShowAddAccount(false);
      await loadAccounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploadResult(null);
    setBusy(true);
    try {
      const result = await api.uploadStatement(file);
      setUploadResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmAccount(bankAccountId) {
    setBusy(true);
    setError("");
    try {
      await api.confirmAccount(uploadResult.statement_id, bankAccountId);
      setUploadResult({ ...uploadResult, status: "matched" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload(format) {
    try {
      await api.downloadStatement(uploadResult.statement_id, format);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    onLogout();
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Reportify</h1>
        <button className="secondary" style={{ marginTop: 0, width: "auto", padding: "8px 16px" }} onClick={handleLogout}>
          Log out
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="section-title">Your bank accounts</div>
      {accounts.length === 0 && <div className="account-meta">No accounts registered yet.</div>}
      {accounts.map((acc) => (
        <div className="account-row" key={acc.id}>
          <div>
            <div className="account-name">{acc.bank_name}</div>
            <div className="account-meta">
              {acc.account_holder_name} &middot; ****{String(acc.account_number).slice(-4)} &middot; {acc.tally_ledger_name}
            </div>
          </div>
        </div>
      ))}

      {!showAddAccount ? (
        <button className="secondary" onClick={() => setShowAddAccount(true)}>
          + Add a bank account
        </button>
      ) : (
        <form onSubmit={handleAddAccount} className="card" style={{ marginTop: 12, padding: 20 }}>
          <label>Bank name</label>
          <input
            value={newAccount.bank_name}
            onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
            required
          />
          <label>Account number</label>
          <input
            value={newAccount.account_number}
            onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
            required
          />
          <label>Account holder name</label>
          <input
            value={newAccount.account_holder_name}
            onChange={(e) => setNewAccount({ ...newAccount, account_holder_name: e.target.value })}
            required
          />
          <label>Tally ledger name</label>
          <input
            value={newAccount.tally_ledger_name}
            onChange={(e) => setNewAccount({ ...newAccount, tally_ledger_name: e.target.value })}
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save account"}
          </button>
          <button type="button" className="secondary" onClick={() => setShowAddAccount(false)}>
            Cancel
          </button>
        </form>
      )}

      <div className="section-title">Upload a bank statement</div>
      <label className="file-drop">
        {busy ? "Reading the statement…" : "Click to choose a PDF bank statement"}
        <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
      </label>

      {uploadResult && (
        <div className="card" style={{ marginTop: 16, padding: 20 }}>
          <h2 style={{ fontSize: "1.1rem" }}>{uploadResult.original_filename || "Statement"}</h2>
          <div className="account-meta">
            Detected account: {uploadResult.detected_account_number || "unreadable"} &middot; Holder:{" "}
            {uploadResult.detected_holder_name || "unknown"}
          </div>

          {uploadResult.status === "needs_account_match" && (
            <>
              <p style={{ color: "var(--parchment-dim)" }}>
                This statement's account couldn't be matched automatically. Which of your accounts is it?
              </p>
              {(uploadResult.candidate_accounts || []).map((acc) => (
                <div className="account-row" key={acc.id}>
                  <div>
                    <div className="account-name">{acc.bank_name}</div>
                    <div className="account-meta">
                      ****{String(acc.account_number).slice(-4)} &middot; {acc.tally_ledger_name}
                    </div>
                  </div>
                  <button
                    className="download-btn"
                    style={{ background: "var(--blood)" }}
                    onClick={() => handleConfirmAccount(acc.id)}
                    disabled={busy}
                  >
                    This one
                  </button>
                </div>
              ))}
            </>
          )}

          {uploadResult.status === "matched" && (
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button className="download-btn" onClick={() => handleDownload("xml")}>
                Download Tally XML
              </button>
              <button className="download-btn secondary" onClick={() => handleDownload("excel")}>
                Download Excel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
