(() => {
  const sandbox = "https://ebanking-openapi-sandbox.pagsmile.com.br";
  const authHeaders = ["x-client-id", "x-timestamp", "x-nonce", "x-content-hash", "x-signature"];
  const manualHeaders = new Set([...authHeaders, "x-ispb", "x-account-number"]);
  const endpointPattern = /^\/v3\/[a-z0-9_/-]+$/;
  const playground = '[role="dialog"][data-open]:has(#endpoints-menu-trigger)';
  const encoder = new TextEncoder();
  const hex = bytes => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");

  const selectedPath = dialog => {
    const path = dialog?.querySelector('#endpoints-menu-trigger + div [data-component-part="scroll-area-content"]')?.textContent.trim();
    return endpointPattern.test(path ?? "") ? path : null;
  };

  const credentialFor = path => {
    const saved = window.__pgsDocsCreds;
    if (!crypto.subtle || saved?.env !== "sandbox") return null;
    if (path.startsWith("/v3/onboarding/managed_accounts/")) return saved.user;
    if (path.startsWith("/v3/webhooks/")) return saved.user || saved.account;
    return saved.account;
  };

  const hasManualHeader = dialog => [...dialog.querySelectorAll('[data-testid^="api-input-"] input')].some(input => {
    const field = input.closest('[data-testid^="api-input-"]');
    const name = field.dataset.testid.slice("api-input-".length).toLowerCase();
    return manualHeaders.has(name) && input.value !== "";
  });

  const sign = async (path, contentType, body, { ak, sk }) => {
    const hash = hex(await crypto.subtle.digest("SHA-256", encoder.encode(body)));
    const key = await crypto.subtle.importKey("raw", encoder.encode(sk), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const timestamp = String(Date.now());
    const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
    const canonical = [
      `content-type:${contentType}`,
      `x-client-id:${ak}`,
      `x-content-hash:${hash}`,
      `x-nonce:${nonce}`,
      `x-timestamp:${timestamp}`,
    ].join("\n");
    const input = ["POST", path, "", canonical, hash, timestamp, nonce].join("\n");
    const signature = hex(await crypto.subtle.sign("HMAC", key, encoder.encode(input)));
    return [ak, timestamp, nonce, hash, signature];
  };

  // Mintlify's browser-direct Playground sends the final JSON through XMLHttpRequest.
  const xhr = XMLHttpRequest.prototype;
  const { open, setRequestHeader, send, abort } = xhr;
  const requests = new WeakMap();

  xhr.open = function (method, url, ...args) {
    const result = open.call(this, method, url, ...args);
    requests.delete(this);
    if (String(method).toUpperCase() !== "POST" || args[0] === false) return result;
    const target = new URL(url, document.baseURI);
    if (target.origin === sandbox && !target.username && !target.password && !target.search && !target.hash && endpointPattern.test(target.pathname)) {
      requests.set(this, { path: target.pathname, headers: new Map(), pending: false });
    }
    return result;
  };

  xhr.setRequestHeader = function (name, value) {
    setRequestHeader.call(this, name, value);
    const request = requests.get(this);
    if (!request) return;
    const header = String(name).toLowerCase();
    const previous = request.headers.get(header);
    request.headers.set(header, previous === undefined ? String(value).trim() : `${previous}, ${String(value).trim()}`);
  };

  xhr.abort = function () {
    requests.delete(this);
    return abort.call(this);
  };

  xhr.send = function (body) {
    const request = requests.get(this);
    if (!request) return send.call(this, body);
    if (request.pending) throw new DOMException("The request is already being sent.", "InvalidStateError");
    const { path, headers } = request;
    const contentType = headers.get("content-type");
    const dialog = document.querySelector(playground);
    const credential = selectedPath(dialog) === path ? credentialFor(path) : null;
    if (!credential || this.readyState !== XMLHttpRequest.OPENED || typeof body !== "string" || contentType !== "application/json"
      || [...headers.keys()].some(name => manualHeaders.has(name))) {
      return send.call(this, body);
    }

    request.pending = true;
    sign(path, contentType, body, credential).then(values => {
      if (requests.get(this) !== request || this.readyState !== XMLHttpRequest.OPENED) return;
      if (credentialFor(path) !== credential || !dialog.isConnected || selectedPath(dialog) !== path) {
        throw new Error("The Playground request changed while signing.");
      }
      authHeaders.forEach((header, index) => setRequestHeader.call(this, header, values[index]));
      send.call(this, body);
    }).catch(() => {
      if (requests.get(this) !== request) return;
      abort.call(this);
      this.dispatchEvent(new ProgressEvent("error"));
      this.dispatchEvent(new ProgressEvent("loadend"));
    }).finally(() => {
      if (requests.get(this) === request) requests.delete(this);
    });
  };

  const updateAuthorization = (dialog, state) => {
    const path = selectedPath(dialog);
    const section = dialog.querySelector('[data-testid="api-input-X-Client-ID"]')?.closest('[data-testid^="api-input-section-"]');
    const toggle = section?.querySelector(':scope > [role="button"]');
    const panel = toggle?.nextElementSibling;
    if (!path || !panel) return;

    const manual = hasManualHeader(dialog);
    const automatic = Boolean(credentialFor(path) && !manual);
    const collapsed = panel.classList.contains("hidden");
    const newOperation = state.path !== path || state.section !== section;
    if ((automatic && !collapsed && (newOperation || !state.automatic && !state.manual))
      || (!automatic && collapsed && state.automatic)) {
      toggle.click();
    }
    Object.assign(state, { path, section, automatic, manual });

    const existing = section.querySelector(":scope > .pgs-playground-auth-note");
    if (!automatic) {
      existing?.remove();
    } else if (!existing) {
      const note = document.createElement("p");
      note.className = "pgs-playground-auth-note";
      note.textContent = document.documentElement.lang.toLowerCase().startsWith("pt")
        ? "A requisição ao Sandbox é assinada ao enviar. Abra Autorização para informar cabeçalhos manualmente."
        : "This Sandbox request is signed when you select Send. Expand Authorization to enter headers manually.";
      section.prepend(note);
    }
  };

  // Watch the portal for a new Playground and observe its contents while it is open.
  let activeDialog;
  let stopWatching;
  const syncDialog = () => {
    const dialog = document.querySelector(playground);
    if (dialog === activeDialog) return;
    stopWatching?.();
    activeDialog = dialog;
    if (!dialog) return;
    const state = {};
    const update = () => updateAuthorization(dialog, state);
    const observer = new MutationObserver(update);
    observer.observe(dialog, { childList: true, subtree: true, characterData: true });
    dialog.addEventListener("input", update);
    window.addEventListener("pgs-creds", update);
    stopWatching = () => {
      observer.disconnect();
      dialog.removeEventListener("input", update);
      window.removeEventListener("pgs-creds", update);
      stopWatching = null;
    };
    update();
  };
  if (document.body) {
    new MutationObserver(syncDialog).observe(document.body, { childList: true });
    syncDialog();
  }
})();
