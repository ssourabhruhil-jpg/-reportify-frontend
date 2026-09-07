const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getToken() {
  return localStorage.getItem("reportify_token");
}

export function setToken(token) {
  localStorage.setItem("reportify_token", token);
}

export function clearToken() {
  localStorage.removeItem("reportify_token");
}

async function request(path, { method = "GET", body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some endpoints (like file downloads) don't return JSON
  }

  if (!res.ok) {
    const message = data?.detail || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export const api = {
  signupStart: (email, password) =>
    request("/auth/signup/start", { method: "POST", body: { email, password } }),

  signupVerify: (email, code) =>
    request("/auth/signup/verify", { method: "POST", body: { email, code } }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  listAccounts: () => request("/accounts", { auth: true }),

  addAccount: (account) =>
    request("/accounts", { method: "POST", body: account, auth: true }),

  uploadStatement: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/statements/upload", { method: "POST", body: form, auth: true, isForm: true });
  },

  confirmAccount: (statementId, bankAccountId) =>
    request(`/statements/${statementId}/confirm-account`, {
      method: "POST",
      body: { bank_account_id: bankAccountId },
      auth: true,
    }),

  // Downloads require the auth header, so we fetch as a blob and trigger
  // the save ourselves rather than linking straight to the URL.
  downloadStatement: async (statementId, format) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/statements/${statementId}/download/${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement_${statementId}.${format === "excel" ? "xlsx" : "xml"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

export { getToken };
