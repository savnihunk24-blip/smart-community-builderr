// Add this file to your website repo, then put this before </body> in index.html:
// <script src="auth.js"></script>

// CHANGE THIS after you deploy the backend (no slash at the end)
const API_URL = "https://community-backend-zhu0.onrender.com";

(function () {
  // ---------- styles ----------
  const style = document.createElement("style");
  style.textContent = `
    #auth-bar { position: fixed; top: 10px; right: 10px; z-index: 9999; display: flex; gap: 8px; align-items: center;
      background: #fff; padding: 6px 10px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.2); font-family: sans-serif; font-size: 14px; color: #222; }
    #auth-bar button, #auth-submit { background: #2563eb; color: #fff; border: 0; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 14px; }
    #auth-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 10000; align-items: center; justify-content: center; font-family: sans-serif; }
    .auth-box { background: #fff; color: #222; padding: 22px; border-radius: 14px; width: 90%; max-width: 340px; display: flex; flex-direction: column; gap: 10px; }
    .auth-box input { padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px; }
    #auth-msg { color: #c00; font-size: 13px; margin: 0; min-height: 16px; }
    .auth-link { color: #2563eb; font-size: 13px; text-align: center; cursor: pointer; margin: 0; }
  `;
  document.head.appendChild(style);

  // ---------- elements ----------
  const bar = document.createElement("div");
  bar.id = "auth-bar";
  document.body.appendChild(bar);

  const modal = document.createElement("div");
  modal.id = "auth-modal";
  modal.innerHTML = `
    <div class="auth-box">
      <h3 id="auth-title" style="margin:0">Login</h3>
      <input id="auth-name" placeholder="Full name" style="display:none">
      <input id="auth-email" type="email" placeholder="Email">
      <input id="auth-password" type="password" placeholder="Password (min 6 characters)">
      <p id="auth-msg"></p>
      <button id="auth-submit">Login</button>
      <p class="auth-link" id="auth-switch"></p>
      <p class="auth-link" id="auth-close" style="color:#666">Close</p>
    </div>`;
  document.body.appendChild(modal);

  const $ = (id) => document.getElementById(id);
  let mode = "login";

  function setMode(m) {
    mode = m;
    $("auth-title").textContent = m === "login" ? "Login" : "Create account";
    $("auth-submit").textContent = m === "login" ? "Login" : "Sign up";
    $("auth-name").style.display = m === "login" ? "none" : "block";
    $("auth-switch").textContent =
      m === "login" ? "New here? Create an account" : "Already have an account? Login";
    $("auth-msg").textContent = "";
  }

  function openModal(m) {
    setMode(m);
    modal.style.display = "flex";
  }

  // ---------- API helper ----------
  async function api(path, options) {
    const res = await fetch(API_URL + path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.msg || "Something went wrong");
    return data;
  }

  const jsonPost = (body) => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // ---------- login / register ----------
  async function submit() {
    const name = $("auth-name").value.trim();
    const email = $("auth-email").value.trim();
    const password = $("auth-password").value;
    $("auth-msg").style.color = "#555";
    $("auth-msg").textContent = "Please wait... (the first try can take a few seconds)";
    try {
      if (mode === "register") {
        await api("/register", jsonPost({ name, email, password }));
      }
      const data = await api("/login", jsonPost({ email, password }));
      localStorage.setItem("scb_token", data.token);
      modal.style.display = "none";
      $("auth-password").value = "";
      refresh();
    } catch (e) {
      $("auth-msg").style.color = "#c00";
      $("auth-msg").textContent = e.message === "Failed to fetch"
        ? "Cannot reach the server. Please try again."
        : e.message;
    }
  }

  // ---------- show logged-in / logged-out state ----------
  async function refresh() {
    bar.textContent = "";
    const token = localStorage.getItem("scb_token");

    if (token) {
      try {
        const user = await api("/me", { headers: { Authorization: "Bearer " + token } });

        const hello = document.createElement("span");
        hello.textContent = "Hi, " + user.name + " (" + user.email + ")";
        const out = document.createElement("button");
        out.textContent = "Logout";
        out.onclick = () => {
          localStorage.removeItem("scb_token");
          location.reload();
        };
        bar.append(hello, out);

        // Replace "Welcome back, ..." heading with the real user's name
        document.querySelectorAll("h1, h2, h3").forEach((h) => {
          if (h.textContent.includes("Welcome back")) {
            h.textContent = "Welcome back, " + user.name + ".";
            const initials = user.name.slice(0, 2).toUpperCase();
document.querySelectorAll("*").forEach((el) => {
  if (el.children.length === 0) {
    const t = el.textContent.trim();
    if (t === "Savni Sawant") el.textContent = user.name;
    if (t === "AD") el.textContent = initials;
  }
});
          }
        });
        return;
      } catch (e) {
        localStorage.removeItem("scb_token"); // token expired or invalid
      }
    }

    const login = document.createElement("button");
    login.textContent = "Login / Sign up";
    login.onclick = () => openModal("login");
    bar.appendChild(login);
    openModal("login");
  }

  $("auth-submit").onclick = submit;
  $("auth-switch").onclick = () => setMode(mode === "login" ? "register" : "login");
  $("auth-close").onclick = () => (modal.style.display = "none");

  refresh();
})();
