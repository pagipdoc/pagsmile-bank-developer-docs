export const PlaygroundSigner = ({ method = "POST", path = "/v3/bank_account", body = {}, lang = "en", editable = false, scope = "account" }) => {
  const T = lang === "pt" ? {
    intro: "Use apenas AK/SK do Sandbox para gerar os cabeçalhos e um comando cURL (bash). A assinatura é calculada neste navegador: a SK não é enviada. Não informe credenciais de Produção.",
    method: "Método", path: "Caminho", ak: "AK (X-Client-ID)", sk: "SK (chave secreta)", ispb: "X-ISPB (opcional)", acct: "X-Account-Number (opcional)",
    body: "Corpo JSON", gen: "Gerar cabeçalhos e cURL", vec: "Conferir com o vetor de teste", copy: "Copiar", copied: "Copiado", copyFail: "Não foi possível copiar. Selecione o texto e copie manualmente.", shell: "Sintaxe bash. No Windows, execute no Git Bash ou no WSL.", akFmt: "A AK deve começar com ak_acct_ ou ak_user_.", charset: "As chaves têm só letras, dígitos, sublinhados e hifens. Remova espaços, aspas e outros caracteres.",
    src: "Credencial", manual: "Informar manualmente", acctCred: "Credenciais da conta bancária (salvas)", userCred: "Credenciais do usuário (salvas)", rowsTitle: "Cabeçalhos individuais para o Playground",
    noSaved: "Nenhuma credencial salva nesta aba. Informe-as aqui ou use a página Configurar acesso à API para preenchê-las em todas as páginas.", noUser: "Nenhuma credencial do usuário salva nesta aba. Informe-a aqui ou na página Configurar acesso à API.",
    userScope: "Esta operação aceita só credenciais do usuário e não usa X-ISPB nem X-Account-Number.", ownerScope: "Esta operação aceita as duas credenciais e não usa X-ISPB nem X-Account-Number.",
    swap: "A AK e a SK parecem estar invertidas. Corrija antes de assinar: uma SK no campo AK seria enviada no cabeçalho X-Client-ID.",
    out: "No Playground, cole X-Client-ID, X-Timestamp, X-Nonce e X-Signature em Authorization; X-Content-Hash (e X-ISPB e X-Account-Number, se usados) em Header; e o corpo compacto no modo JSON. A assinatura inclui todos esses cabeçalhos, então envie todos.",
    valid: "Válido por 5 minutos e para uma única requisição. Gere novamente a cada tentativa.", sts: "StringToSign", bad: "O corpo não é um JSON válido.", need: "Informe AK e SK.", pair: "Envie X-ISPB e X-Account-Number juntos.",
    vok: "O vetor de teste confere: a implementação local está correta.", vbad: "O vetor de teste não confere.", changed: "Os dados mudaram. Gere os cabeçalhos novamente.", error: "Não foi possível calcular a assinatura neste navegador. Tente novamente.",
    pathNote: "Use um caminho ASCII sem escapes percentuais, query string ou fragmento, como /v3/bank_account.", pathError: "Caminho não suportado. Use um caminho ASCII sem escapes percentuais, segmentos . ou .., query string ou fragmento. Para outros caminhos, assine no servidor conforme as regras de assinatura.",
    send: "Enviar ao Sandbox", sending: "Enviando…", sent: "Resposta do Sandbox", net: "O navegador não recebeu uma resposta completa (rede, extensão ou CORS). A requisição pode ter chegado à API. Confira o resultado com uma consulta antes de qualquer nova tentativa de escrita.", timeout: "Sem resposta em 30 segundos. A requisição pode ter chegado à API. Confira o resultado com uma consulta antes de qualquer nova tentativa de escrita.", userOnly: "Esta operação aceita só credenciais do usuário: a AK deve começar com ak_user_.", userHdr: "Credenciais do usuário precisam de X-ISPB e X-Account-Number em operações de conta. Informe os dois ou adicione uma conta padrão em Configurar acesso à API.", ispbReq: "X-ISPB (obrigatório com credenciais do usuário)", acctReq: "X-Account-Number (obrigatório com credenciais do usuário)",
    cors: "Navegadores não podem enviar X-ISPB e X-Account-Number para esta API (CORS). Execute o cURL no servidor.", cut: "Mostrando os primeiros 8.000 caracteres; a resposta é maior.", copyFull: "Copiar resposta completa",
    srv5xx: "O servidor retornou um erro, e uma escrita pode ter sido aplicada. Confira o resultado com uma consulta antes de qualquer nova tentativa de escrita.", unrec: "A resposta não é um resultado reconhecível da API, então uma escrita pode ter sido aplicada. Confira o resultado com uma consulta antes de qualquer nova tentativa de escrita.", prevPending: (x) => `Uma requisição enviada de outra página (POST ${x}) ainda não tinha retornado quando você saiu dela. Sair da página não cancela a requisição. Confira o resultado com uma consulta antes de qualquer nova tentativa de escrita.`, prevDone: (x, h, c) => `Uma requisição enviada de outra página (POST ${x}) retornou HTTP ${h}${c === null ? "" : `, code ${c}`} depois que você saiu dela.`, prevUnknown: (x) => `Uma requisição enviada de outra página (POST ${x}) terminou sem resultado claro depois que você saiu dela. Confira o resultado com uma consulta antes de qualquer nova tentativa de escrita.`, dismiss: "Dispensar",
    prod: "Esta ferramenta só envia requisições ao Sandbox.", sendNote: "Envia desta aba, então a API vê o IP deste computador. Operações de escrita alteram dados do Sandbox.",
  } : {
    intro: "Use Sandbox AK/SK only to generate authentication headers and a cURL command (bash). Signing happens in this browser: your SK is never sent. Do not enter Production credentials.",
    method: "Method", path: "Path", ak: "AK (X-Client-ID)", sk: "SK (secret key)", ispb: "X-ISPB (optional)", acct: "X-Account-Number (optional)",
    body: "JSON body", gen: "Generate headers and cURL", vec: "Check against the test vector", copy: "Copy", copied: "Copied", copyFail: "Couldn't copy. Select the text and copy it manually.", shell: "Bash syntax. On Windows, run it in Git Bash or WSL.", akFmt: "The AK must start with ak_acct_ or ak_user_.", charset: "Keys contain only letters, digits, underscores, and hyphens. Remove spaces, quotes, and other characters.",
    src: "Credential", manual: "Enter manually", acctCred: "Bank Account Level Credentials (saved)", userCred: "User Level Credentials (saved)", rowsTitle: "Individual headers for the API playground",
    noSaved: "No credentials saved in this tab. Enter them here, or use the Set up API access page to fill them in on every page.", noUser: "No user-level credentials saved in this tab. Enter them here or on the Set up API access page.",
    userScope: "This operation accepts only user-level credentials and uses no X-ISPB or X-Account-Number.", ownerScope: "This operation accepts either credential and uses no X-ISPB or X-Account-Number.",
    swap: "The AK and SK look swapped. Fix them before signing: an SK in the AK field would be sent in the X-Client-ID header.",
    out: "In the Playground, paste X-Client-ID, X-Timestamp, X-Nonce, and X-Signature under Authorization; X-Content-Hash (and X-ISPB and X-Account-Number if used) under Header; and the compact body in JSON mode. The signature covers all of these headers, so send every one.",
    valid: "Valid for 5 minutes and for one request only. Generate new values for every attempt.", sts: "StringToSign", bad: "The body is not valid JSON.", need: "Enter both AK and SK.", pair: "Send X-ISPB and X-Account-Number together.",
    vok: "The test vector matches: the local implementation is correct.", vbad: "The test vector does not match.", changed: "Inputs changed. Generate headers again.", error: "Could not calculate the signature in this browser. Try again.",
    pathNote: "Use an ASCII path without percent escapes, query, or fragment, such as /v3/bank_account.", pathError: "Unsupported path. Use an ASCII path without percent escapes, . or .. segments, query, or fragment. For other paths, sign on your server using the signing rules.",
    send: "Send to Sandbox", sending: "Sending…", sent: "Sandbox response", net: "This browser didn't receive a complete response (network, extension, or CORS). The request may still have reached the API. Check the result with a read request before any new write attempt.", timeout: "No response within 30 seconds. The request may still have reached the API. Check the result with a read request before any new write attempt.", userOnly: "This operation accepts only user-level credentials: the AK must start with ak_user_.", userHdr: "User-level credentials need X-ISPB and X-Account-Number for account operations. Enter both, or add a default account in Set up API access.", ispbReq: "X-ISPB (required with user-level credentials)", acctReq: "X-Account-Number (required with user-level credentials)",
    cors: "Browsers can't send X-ISPB and X-Account-Number to this API (CORS). Run the cURL command on your server.", cut: "Showing the first 8,000 characters; the response is longer.", copyFull: "Copy full response",
    srv5xx: "The server returned an error, and a write may still have been applied. Check the result with a read request before any new write attempt.", unrec: "The response isn't a recognizable API result, so a write may still have been applied. Check the result with a read request before any new write attempt.", prevPending: (x) => `A request sent from another page (POST ${x}) hadn't returned when you left that page. Leaving a page doesn't cancel a request. Check its result with a read request before any new write attempt.`, prevDone: (x, h, c) => `A request sent from another page (POST ${x}) returned HTTP ${h}${c === null ? "" : `, code ${c}`} after you left that page.`, prevUnknown: (x) => `A request sent from another page (POST ${x}) ended without a clear result after you left that page. Check its result with a read request before any new write attempt.`, dismiss: "Dismiss",
    prod: "This tool sends requests to Sandbox only.", sendNote: "Sends from this tab, so the API sees this computer's IP. Write operations change Sandbox data.",
  };
  const SANDBOX_URL = "https://ebanking-openapi-sandbox.pagsmile.com.br";
  const uid = String(path).replace(/[^a-z0-9]/gi, "-");
  const m = "POST";
  const [p, setP] = useState(path);
  const [cred, setCred] = useState({ ak: "", sk: "", ispb: "", acct: "" });
  const { ak, sk, ispb, acct } = cred;
  const setC = (k) => (v) => setCred((c) => ({ ...c, [k]: v }));
  const [text, setText] = useState(JSON.stringify(body, null, 2));
  const [out, setOut] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [invalidFields, setInvalidFields] = useState([]);
  const [copied, setCopied] = useState("");
  const [store, setStore] = useState({ env: "sandbox", account: null, user: null });
  const [src, setSrc] = useState("manual");
  const [resp, setResp] = useState(null);
  const [prev, setPrev] = useState([]);
  const revision = useRef(0);
  const inflight = useRef(null);
  const me = useRef(Math.random().toString(36).slice(2));
  const mounted = useRef(true);
  const headerScope = scope === "account";
  const kinds = scope === "user" ? ["user"] : (scope === "owner" ? ["user", "account"] : ["account", "user"]);
  const message = (note, type = "info") => { setMsg(note); setMsgType(type); };
  const reset = (note = "") => { setOut(null); setResp(null); setCopied(""); setInvalidFields([]); message(note); };
  const fail = (note, fields = []) => { message(note, "error"); setInvalidFields(fields); };
  useEffect(() => {
    // Focus after the error text and its ARIA association have rendered.
    if (!invalidFields.length) return;
    const el = document.getElementById(`${uid}-${invalidFields[0]}`);
    if (el) el.focus();
  }, [invalidFields]);
  const fill = (s, choice) => {
    const c = choice === "manual" ? null : s[choice];
    const h = choice === "user" && headerScope && c;
    setCred({ ak: c ? c.ak : "", sk: c ? c.sk : "", ispb: h ? c.ispb || "" : "", acct: h ? c.acct || "" : "" });
  };
  useEffect(() => {
    const load = () => {
      // Never import credentials saved for another environment by an older page.
      if (window.__pgsDocsCreds && window.__pgsDocsCreds.env !== "sandbox") window.__pgsDocsCreds = { env: "sandbox", account: null, user: null };
      const s = { env: "sandbox", account: null, user: null, ...(window.__pgsDocsCreds || {}) };
      const choice = kinds.find((k) => s[k]) || "manual";
      setStore(s);
      setSrc(choice);
      fill(s, choice);
      revision.current += 1;
      reset();
    };
    load();
    window.addEventListener("pgs-creds", load);
    return () => window.removeEventListener("pgs-creds", load);
  }, []);
  useEffect(() => {
    mounted.current = true;
    const sync = () => setPrev((window.__pgsSignerLog || []).filter((g) => g.unseen && g.owner !== me.current).map((g) => ({ ...g })));
    sync();
    window.addEventListener("pgs-signer", sync);
    return () => {
      mounted.current = false;
      window.removeEventListener("pgs-signer", sync);
      (window.__pgsSignerLog || []).forEach((g) => { if (g.owner === me.current && g.status === "pending") g.unseen = true; });
      window.dispatchEvent(new Event("pgs-signer"));
    };
  }, []);
  const dismiss = () => {
    (window.__pgsSignerLog || []).forEach((g) => { if (g.owner !== me.current) g.unseen = false; });
    window.dispatchEvent(new Event("pgs-signer"));
  };
  const invalidate = () => {
    revision.current += 1;
    if (inflight.current) { inflight.current.abort(); inflight.current = null; }
    reset(T.changed);
  };

  const enc = (s) => new TextEncoder().encode(s);
  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc(s)));
  const hmac = async (key, s) => {
    const k = await crypto.subtle.importKey("raw", enc(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return hex(await crypto.subtle.sign("HMAC", k, enc(s)));
  };
  const stringToSign = (verb, reqPath, headers, hash, ts, nonce) => {
    const names = Object.keys(headers).filter((n) => headers[n] !== "").sort();
    const canon = names.map((n) => `${n}:${String(headers[n]).trim()}`).join("\n");
    return [verb.toUpperCase(), reqPath, "", canon, hash, ts, nonce].join("\n");
  };
  const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;
  // Removes JSON whitespace outside strings only, so numbers and strings keep their exact characters.
  const compactJson = (s) => {
    let res = "", str = false, esc = false;
    for (const ch of s) {
      if (str) { res += ch; if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === "\"") str = false; }
      else if (!" \t\n\r".includes(ch)) { res += ch; if (ch === "\"") str = true; }
    }
    return res;
  };

  const generate = async () => {
    const token = ++revision.current;
    reset();
    if (p !== p.trim() || !/^\/[A-Za-z0-9/_.~!$&'()*+,;=:@-]*$/.test(p) || p.split("/").some((s) => s === "." || s === "..")) { fail(T.pathError, editable ? ["p"] : []); return; }
    if (!ak || !sk) { fail(T.need, ["ak", "sk"].filter((k) => !cred[k])); return; }
    if (ak.includes("sk_") || sk.includes("ak_")) { fail(T.swap, ["ak", "sk"]); return; }
    if (!/^ak_(acct|user)_/.test(ak)) { fail(T.akFmt, ["ak"]); return; }
    const badKeys = ["ak", "sk"].filter((k) => !/^[A-Za-z0-9_-]+$/.test(cred[k]));
    if (badKeys.length) { fail(T.charset, badKeys); return; }
    if (scope === "user" && !ak.startsWith("ak_user_")) { fail(T.userOnly, ["ak"]); return; }
    const userHdr = headerScope && ak.startsWith("ak_user_");
    if (userHdr && (ispb === "") !== (acct === "")) { fail(T.pair, [ispb === "" ? "ispb" : "acct"]); return; }
    if (userHdr && (!ispb || !acct)) { fail(T.userHdr, ["ispb", "acct"].filter((k) => !cred[k])); return; }
    try { JSON.parse(text); } catch (e) { fail(T.bad, ["body"]); return; }
    const compact = compactJson(text);
    try {
      const ts = String(Date.now());
      const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await sha256(compact);
      const hIspb = userHdr ? ispb : "";
      const hAcct = userHdr ? acct : "";
      const headers = { "content-type": "application/json", "x-client-id": ak, "x-content-hash": hash, "x-nonce": nonce, "x-timestamp": ts, "x-ispb": hIspb, "x-account-number": hAcct };
      const sts = stringToSign(m, p, headers, hash, ts, nonce);
      const sig = await hmac(sk, sts);
      const rows = [["X-Client-ID", ak], ["X-Timestamp", ts], ["X-Nonce", nonce], ["X-Content-Hash", hash], ["X-Signature", sig]];
      if (hIspb) rows.push(["X-ISPB", hIspb], ["X-Account-Number", hAcct]);
      const base = SANDBOX_URL;
      const curl = [`curl -sS -X POST ${q(base + p)}`, `-H 'Content-Type: application/json'`, `-H 'User-Agent: your-app/1.0'`, ...rows.map(([k, v]) => `-H ${q(`${k}: ${v}`)}`), `--data-raw ${q(compact)}`].join(" \\\n  ");
      const send = { url: base + p, compact, headers: Object.fromEntries([["Content-Type", "application/json"], ...rows]) };
      rows.push(["Body", compact]);
      if (token === revision.current) setOut({ rows, sts, curl, send, token, sandbox: true, cors: Boolean(hIspb) });
    } catch (e) {
      if (token === revision.current) { setOut(null); fail(T.error); }
    }
  };

  const sendNow = async () => {
    if (!out || out.used) return;
    // Enforce the destination at the send boundary as well as in the UI.
    if (new URL(out.send.url).origin !== SANDBOX_URL) { fail(T.prod); return; }
    const token = out.token;
    setOut((o) => (o && o.token === token ? { ...o, used: true } : o));
    setResp({ busy: true });
    const rec = { owner: me.current, path: p, status: "pending", unseen: false, http: null, code: null };
    const log = (window.__pgsSignerLog = window.__pgsSignerLog || []);
    log.push(rec);
    for (let i; log.length > 5 && (i = log.findIndex((g) => g.status !== "pending" && !g.unseen)) >= 0;) log.splice(i, 1);
    const finish = (patch) => { Object.assign(rec, patch, { unseen: !mounted.current }); window.dispatchEvent(new Event("pgs-signer")); };
    const ctl = new AbortController();
    inflight.current = ctl;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctl.abort(); }, 30000);
    try {
      const r = await fetch(out.send.url, { method: "POST", headers: out.send.headers, body: out.send.compact, signal: ctl.signal });
      const raw = await r.text();
      let code = null;
      try { const j = JSON.parse(raw); if (j && typeof j === "object" && j.code !== undefined) code = j.code; } catch (e) { code = null; }
      const why = r.status >= 500 || code === 500 ? "srv" : (code === null ? "unrec" : "");
      finish({ status: why ? "unknown" : "done", http: r.status, code, why });
      if (token === revision.current) setResp({ http: r.status, text: raw.slice(0, 8000), full: raw.length > 8000 ? raw : "", why });
    } catch (e) {
      finish({ status: "unknown" });
      if (token === revision.current) setResp(timedOut ? { net: true, timeout: true } : { net: true });
    } finally {
      clearTimeout(timer);
      if (inflight.current === ctl) inflight.current = null;
    }
  };

  const checkVector = async () => {
    setInvalidFields([]);
    const h = { "content-type": "application/json", "x-client-id": "ak_doc_test", "x-content-hash": "", "x-nonce": "doc-fixed-nonce", "x-timestamp": "1791792000000" };
    h["x-content-hash"] = await sha256("{}");
    const sig = await hmac("sk_doc_test_only", stringToSign("POST", "/v3/bank_account", h, h["x-content-hash"], h["x-timestamp"], h["x-nonce"]));
    const matches = sig === "c19804458b983470c32734cc84d581b4c946d7b4667e1fccd0d1ed585e931654";
    message(matches ? T.vok : T.vbad, matches ? "success" : "error");
  };
  const copy = async (label, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); setTimeout(() => setCopied(""), 1500); } catch (e) { setCopied("fail"); }
  };
  const field = (id, label, value, set, type = "text") => (
    <label htmlFor={`${uid}-${id}`} className="pgs-field">
      <span className="pgs-label">{label}</span>
      <input id={`${uid}-${id}`} type={type} value={value} onChange={(e) => { invalidate(); const key = id === "ak" || id === "sk"; const digits = id === "ispb" || id === "acct"; if (key) setSrc("manual"); set(key ? e.target.value.trim() : (digits ? e.target.value.replace(/\D/g, "") : e.target.value)); }} aria-invalid={invalidFields.includes(id) ? "true" : undefined} aria-describedby={invalidFields.includes(id) ? `${uid}-message` : undefined} autoComplete="off" spellCheck={false} disabled={busy} className="pgs-input pgs-mono" />
    </label>
  );
  const choices = [["account", T.acctCred], ["user", T.userCred]].filter(([k]) => store[k] && kinds.includes(k));
  const live = out && out.token === revision.current;
  const busy = Boolean(resp && resp.busy);

  return (
    <div className="pgs not-prose">
      <p className="pgs-intro">{T.intro}</p>
      {prev.length ? (
        <div role="status" className="pgs-prev">
          {prev.map((g, i) => (
            <p key={i} className="pgs-warn">{g.status === "pending" ? T.prevPending(g.path) : g.status === "done" ? T.prevDone(g.path, g.http, g.code) : (g.http !== null ? `${T.prevDone(g.path, g.http, g.code)} ${g.why === "unrec" ? T.unrec : T.srv5xx}` : T.prevUnknown(g.path))}</p>
          ))}
          <button type="button" onClick={dismiss} className="pgs-btn">{T.dismiss}</button>
        </div>
      ) : null}
      {editable ? (
        <div className="pgs-grid">
          <div className="pgs-field">
            <span className="pgs-label">{T.method}</span>
            <span className="pgs-verb">{m}</span>
          </div>
          <div>
            {field("p", T.path, p, setP)}
            <p className="pgs-note">{T.pathNote}</p>
          </div>
        </div>
      ) : (
        <p className="pgs-endpoint"><span className="pgs-verb">{m}</span><code>{p}</code></p>
      )}
      {choices.length ? (
        <label htmlFor={`${uid}-src`} className="pgs-field">
          <span className="pgs-label">{T.src}</span>
          <select id={`${uid}-src`} value={src} onChange={(e) => { invalidate(); setSrc(e.target.value); fill(store, e.target.value); }} disabled={busy} className="pgs-input">
            {choices.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            <option value="manual">{T.manual}</option>
          </select>
        </label>
      ) : <p className="pgs-note">{scope === "user" && (store.account || store.user) ? T.noUser : T.noSaved}</p>}
      {scope === "user" ? <p className="pgs-note">{T.userScope}</p> : null}
      {scope === "owner" ? <p className="pgs-note">{T.ownerScope}</p> : null}
      <div className="pgs-grid">
        {field("ak", T.ak, ak, setC("ak"), ak.includes("sk_") ? "password" : "text")}
        {field("sk", T.sk, sk, setC("sk"), "password")}
        {headerScope && ak.startsWith("ak_user_") ? field("ispb", T.ispbReq, ispb, setC("ispb")) : null}
        {headerScope && ak.startsWith("ak_user_") ? field("acct", T.acctReq, acct, setC("acct")) : null}
      </div>
      <label htmlFor={`${uid}-body`} className="pgs-field">
        <span className="pgs-label">{T.body}</span>
        <textarea id={`${uid}-body`} rows={Math.min(10, Math.max(3, text.split("\n").length))} value={text} onChange={(e) => { invalidate(); setText(e.target.value); }} aria-invalid={invalidFields.includes("body") ? "true" : undefined} aria-describedby={invalidFields.includes("body") ? `${uid}-message` : undefined} spellCheck={false} disabled={busy} className="pgs-input pgs-mono pgs-area" />
      </label>
      <div className="pgs-actions">
        <button type="button" onClick={generate} disabled={busy} className="pgs-btn pgs-primary">{T.gen}</button>
        <button type="button" onClick={checkVector} className="pgs-btn">{T.vec}</button>
      </div>
      {msg ? <p id={`${uid}-message`} role="status" aria-atomic="true" className={msgType === "error" ? "pgs-warn" : msgType === "success" ? "pgs-msg" : "pgs-info"}>{msg}</p> : null}
      {live ? (
        <div className="pgs-out" aria-live="polite">
          <p className="pgs-note">{T.valid}</p>
          {copied === "fail" ? <p role="status" className="pgs-warn">{T.copyFail}</p> : null}
          <div className="pgs-row pgs-row-stack">
            <span className="pgs-key">cURL (bash)</span>
            <pre className="pgs-pre pgs-val">{out.curl}</pre>
            <button type="button" onClick={() => copy("cURL", out.curl)} className="pgs-copy" aria-label={`${T.copy} cURL`}>{copied === "cURL" ? T.copied : T.copy}</button>
          </div>
          <p className="pgs-note">{T.shell}</p>
          <div className="pgs-actions">
            {out.sandbox && !out.cors ? <button type="button" onClick={sendNow} disabled={out.used || (resp && resp.busy)} className="pgs-btn">{resp && resp.busy ? T.sending : T.send}</button> : null}
          </div>
          <p className="pgs-note">{!out.sandbox ? T.prod : (out.cors ? T.cors : T.sendNote)}</p>
          {resp && !resp.busy ? (
            <div role="status">
              <p className="pgs-label">{resp.timeout ? T.timeout : (resp.net ? T.net : `${T.sent} · HTTP ${resp.http}`)}</p>
              {resp.why ? <p className="pgs-warn">{resp.why === "srv" ? T.srv5xx : T.unrec}</p> : null}
              {resp.net ? null : <pre className="pgs-pre">{resp.text}</pre>}{resp.full ? <p role="status" className="pgs-warn">{T.cut} <button type="button" onClick={() => copy("full", resp.full)} className="pgs-copy">{copied === "full" ? T.copied : T.copyFull}</button></p> : null}
            </div>
          ) : null}
          <details className="pgs-details">
            <summary>{T.rowsTitle}</summary>
            <p className="pgs-note">{T.out}</p>
            <dl className="pgs-rows">
              {out.rows.map(([k, v]) => (
                <div key={k} className="pgs-row">
                  <dt className="pgs-key">{k}</dt>
                  <dd className="pgs-val"><code>{v}</code></dd>
                  <button type="button" onClick={() => copy(k, v)} className="pgs-copy" aria-label={`${T.copy} ${k}`}>{copied === k ? T.copied : T.copy}</button>
                </div>
              ))}
            </dl>
          </details>
          <details className="pgs-details">
            <summary>{T.sts}</summary>
            <pre className="pgs-pre">{out.sts}</pre>
          </details>
        </div>
      ) : null}
    </div>
  );
};
