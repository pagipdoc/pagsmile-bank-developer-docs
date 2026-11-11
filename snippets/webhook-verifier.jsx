export const WebhookVerifier = ({ lang = "en" }) => {
  const T = lang === "pt" ? {
    intro: "Confira uma notificação recebida. O cálculo acontece só neste navegador: a SK não é enviada nem armazenada.",
    sk: "SK (chave secreta)", path: "Caminho do callback", query: "Query string (opcional)", body: "Corpo bruto recebido",
    verify: "Verificar", sample: "Carregar exemplo", hash: "X-Content-Hash corresponde ao corpo", sig: "X-Signature confere",
    nonce: "X-Nonce tem 32 caracteres hexadecimais minúsculos", age: "Idade do X-Timestamp", sts: "StringToSign",
    yes: "Sim", no: "Não", note: "Cole o corpo exatamente como recebido, sem reformatar o JSON.", minutes: "min",
    need: "Informe a SK para verificar a assinatura.", headers: "Preencha todos os cabeçalhos recebidos.",
    changed: "Os dados mudaram. Verifique novamente.", error: "Não foi possível calcular a assinatura neste navegador. Confira os dados e tente novamente.",
    pathNote: "Esta ferramenta aceita apenas URLs de callback com caminho ASCII sem escapes percentuais. Cole o caminho como recebido, sem domínio, query string ou fragmento. Use / se não houver caminho.",
    pathError: "Caminho não suportado. Use um caminho ASCII sem escapes percentuais, como /pagsmile/webhooks. Para URLs com escapes, verifique no servidor conforme o tipo de callback.",
    sigFormat: "X-Signature tem 64 caracteres hexadecimais minúsculos",
  } : {
    intro: "Check a callback you received. Everything is computed in this browser: your SK is never sent or stored.",
    sk: "SK (secret key)", path: "Callback path", query: "Query string (optional)", body: "Raw body received",
    verify: "Verify", sample: "Load sample", hash: "X-Content-Hash matches the body", sig: "X-Signature matches",
    nonce: "X-Nonce is 32 lowercase hex characters", age: "X-Timestamp age", sts: "StringToSign",
    yes: "Yes", no: "No", note: "Paste the body exactly as received. Do not reformat the JSON.", minutes: "min",
    need: "Enter your SK to verify the signature.", headers: "Fill in all received headers.",
    changed: "Inputs changed. Verify again.", error: "Could not calculate the signature in this browser. Check the inputs and try again.",
    pathNote: "This tool accepts only callback URLs with an ASCII path without percent escapes. Paste the received path without the domain, query or fragment. Use / for no path.",
    pathError: "Unsupported path. Use an ASCII path without percent escapes, such as /pagsmile/webhooks. For escaped URLs, verify on your server using the callback type's path rule.",
    sigFormat: "X-Signature is 64 lowercase hex characters",
  };
  const H = ["content-type", "x-client-id", "x-content-hash", "x-nonce", "x-timestamp", "x-signature"];
  const [sk, setSk] = useState("");
  const [path, setPath] = useState("/pagsmile/webhooks");
  const [query, setQuery] = useState("");
  const [hdr, setHdr] = useState({ "content-type": "application/json", "x-client-id": "", "x-content-hash": "", "x-nonce": "", "x-timestamp": "", "x-signature": "" });
  const [raw, setRaw] = useState("");
  const [res, setRes] = useState(null);
  const [msg, setMsg] = useState("");
  const revision = useRef(0);

  const invalidate = () => {
    revision.current += 1;
    setRes(null);
    setMsg(T.changed);
  };
  const enc = (s) => new TextEncoder().encode(s);
  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc(s)));
  const hmac = async (key, s) => {
    const k = await crypto.subtle.importKey("raw", enc(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return hex(await crypto.subtle.sign("HMAC", k, enc(s)));
  };
  // Binary strings preserve Go's byte ordering and even non-UTF-8 escaped bytes.
  const qDec = (s) => {
    const bytes = enc(s);
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b === 37) {
        const pair = String.fromCharCode(bytes[i + 1], bytes[i + 2]);
        if (i + 2 >= bytes.length || !/^[0-9a-f]{2}$/i.test(pair)) throw new Error("query escape");
        out += String.fromCharCode(parseInt(pair, 16));
        i += 2;
      } else out += String.fromCharCode(b === 43 ? 32 : b);
    }
    return out;
  };
  const qEsc = (s) => Array.from(s).map((c) => {
    const b = c.charCodeAt(0);
    if (/[A-Za-z0-9_.~-]/.test(c)) return c;
    return b === 32 ? "+" : "%" + b.toString(16).padStart(2, "0").toUpperCase();
  }).join("");
  const canonQuery = (q) => {
    if (!q) return "";
    try {
      const pairs = q.split("&").filter(Boolean).map((part) => {
        if (part.includes(";")) throw new Error("query separator");
        const i = part.indexOf("=");
        return i < 0 ? [qDec(part), ""] : [qDec(part.slice(0, i)), qDec(part.slice(i + 1))];
      });
      const order = pairs.map((_, i) => i).sort((a, b) => (pairs[a][0] < pairs[b][0] ? -1 : pairs[a][0] > pairs[b][0] ? 1 : a - b));
      return order.map((i) => `${qEsc(pairs[i][0])}=${qEsc(pairs[i][1])}`).join("&");
    } catch (e) { return q; }
  };
  const buildSts = (h, p, q) => {
    const canon = H.slice(0, 5).map((n) => `${n}:${String(h[n]).trim()}`).join("\n");
    return ["POST", p || "/", canonQuery(q), canon, String(h["x-content-hash"]).trim(), String(h["x-timestamp"]).trim(), String(h["x-nonce"]).trim()].join("\n");
  };
  const safeEqual = (a, b) => {
    if (a.length !== b.length) return false;
    let d = 0;
    for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return d === 0;
  };

  const verify = async (h = hdr, body = raw, key = sk, p = path, q = query, token = ++revision.current) => {
    setRes(null);
    setMsg("");
    if (!key) { setMsg(T.need); return; }
    if (H.some((n) => !String(h[n] || "").trim())) { setMsg(T.headers); return; }
    if (p && (p !== p.trim() || !/^\/[A-Za-z0-9/_.~!$&'()*+,;=:@-]*$/.test(p))) { setMsg(T.pathError); return; }
    try {
      const bodyHash = await sha256(body);
      const sts = buildSts(h, p, q);
      const expected = await hmac(key, sts);
      const ageMs = Date.now() - Number(h["x-timestamp"]);
      if (token !== revision.current) return;
      setRes({
        hashOk: bodyHash === String(h["x-content-hash"]).trim(),
        sigOk: safeEqual(expected, String(h["x-signature"]).trim()),
        sigFormatOk: /^[0-9a-f]{64}$/.test(String(h["x-signature"]).trim()),
        nonceOk: /^[0-9a-f]{32}$/.test(String(h["x-nonce"]).trim()),
        age: Number.isFinite(ageMs) ? (ageMs / 60000).toFixed(1) : "?",
        sts, token,
      });
    } catch (e) {
      if (token === revision.current) { setRes(null); setMsg(T.error); }
    }
  };

  const loadSample = async () => {
    const token = ++revision.current;
    setRes(null);
    setMsg("");
    try {
      const body = '{"sample":"Replace with the raw body you received"}';
      const h = { "content-type": "application/json", "x-client-id": "ak_doc_test", "x-content-hash": await sha256(body), "x-nonce": hex(crypto.getRandomValues(new Uint8Array(16))), "x-timestamp": String(Date.now()), "x-signature": "" };
      h["x-signature"] = await hmac("sk_doc_test_only", buildSts(h, "/pagsmile/webhooks", ""));
      if (token !== revision.current) return;
      setSk("sk_doc_test_only"); setPath("/pagsmile/webhooks"); setQuery(""); setHdr(h); setRaw(body);
      await verify(h, body, "sk_doc_test_only", "/pagsmile/webhooks", "", token);
    } catch (e) {
      if (token === revision.current) { setRes(null); setMsg(T.error); }
    }
  };

  const input = (id, label, value, onChange, type = "text") => (
    <label htmlFor={`whv-${id}`} className="pgs-field" key={id}>
      <span className="pgs-label">{label}</span>
      <input id={`whv-${id}`} type={type} value={value} onChange={(e) => { invalidate(); onChange(e.target.value); }} autoComplete="off" spellCheck={false} className="pgs-input pgs-mono" />
    </label>
  );
  const check = (ok, label) => (
    <li className={ok ? "pgs-check pgs-ok" : "pgs-check pgs-fail"}><span aria-hidden="true">{ok ? "✓" : "✕"}</span> {label}: {ok ? T.yes : T.no}</li>
  );
  const titles = { "content-type": "Content-Type", "x-client-id": "X-Client-ID", "x-content-hash": "X-Content-Hash", "x-nonce": "X-Nonce", "x-timestamp": "X-Timestamp", "x-signature": "X-Signature" };

  return (
    <div className="pgs not-prose">
      <p className="pgs-intro">{T.intro}</p>
      <div className="pgs-grid">
        {input("sk", T.sk, sk, setSk, "password")}
        {input("path", T.path, path, setPath)}
        {input("query", T.query, query, setQuery)}
        {H.map((n) => input(n, titles[n], hdr[n], (v) => setHdr({ ...hdr, [n]: v })))}
      </div>
      <p className="pgs-note">{T.pathNote}</p>
      <label htmlFor="whv-body" className="pgs-field">
        <span className="pgs-label">{T.body}</span>
        <textarea id="whv-body" rows={4} value={raw} onChange={(e) => { invalidate(); setRaw(e.target.value); }} spellCheck={false} className="pgs-input pgs-mono pgs-area" />
      </label>
      <p className="pgs-note">{T.note}</p>
      <div className="pgs-actions">
        <button type="button" onClick={() => verify()} className="pgs-btn pgs-primary">{T.verify}</button>
        <button type="button" onClick={loadSample} className="pgs-btn">{T.sample}</button>
      </div>
      {msg ? <p role="status" aria-live="polite" className="pgs-msg">{msg}</p> : null}
      {res && res.token === revision.current ? (
        <div className="pgs-out" aria-live="polite">
          <ul className="pgs-checks">
            {check(res.hashOk, T.hash)}
            {check(res.sigFormatOk, T.sigFormat)}
            {check(res.sigOk, T.sig)}
            {check(res.nonceOk, T.nonce)}
            <li className="pgs-check">{T.age}: {res.age} {T.minutes}</li>
          </ul>
          <details className="pgs-details">
            <summary>{T.sts}</summary>
            <pre className="pgs-pre">{res.sts}</pre>
          </details>
        </div>
      ) : null}
    </div>
  );
};
