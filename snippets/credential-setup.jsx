export const CredentialSetup = ({ lang = "en" }) => {
  const T = lang === "pt" ? {
    intro: "Informe apenas credenciais do Sandbox. Elas ficam só na memória desta aba: as ferramentas de assinatura das outras páginas as usam até você recarregar ou fechar a aba. A SK nunca é enviada.",
    env: "Ambiente", sandbox: "Sandbox", production: "Produção",
    acctTitle: "Credenciais da conta bancária", userTitle: "Credenciais do usuário (OpenVA e Onboarding)",
    ak: "Chave de Acesso (AK)", sk: "Chave Secreta (SK)", ispb: "X-ISPB da conta padrão (opcional)", acct: "X-Account-Number da conta padrão (opcional)",
    userNote: "A conta padrão só é usada em operações de conta. Operações de contas gerenciadas e de assinaturas de eventos não enviam cabeçalhos de conta.",
    save: "Salvar nesta aba", charset: "As chaves têm só letras, dígitos, sublinhados e hifens. Remova espaços, aspas e outros caracteres.", dirty: "Alterações não salvas: as variáveis e o teste de conexão abaixo ainda usam as credenciais salvas. Selecione Salvar nesta aba para atualizá-los.", tmo: "Sem resposta em 20 segundos. Confira a rede e tente de novo.", fixFirst: "Corrija os campos indicados acima antes de salvar.", half: "Informe a AK e a SK de cada credencial, ou deixe as duas em branco. Nada foi alterado.", halfField: "Informe a AK e a SK, ou deixe as duas em branco.", clear: "Limpar", show: "Mostrar SK", hide: "Ocultar SK",
    saved: "Salvo nesta aba.", cleared: "Credenciais removidas desta aba.", nothing: "Informe AK e SK de pelo menos uma credencial.",
    pre: (k, p) => `${k} deve começar com ${p}.`, swap: "A AK e a SK parecem estar invertidas. Corrija antes de salvar: uma SK no campo AK seria enviada no cabeçalho X-Client-ID.", pair: "Informe X-ISPB e X-Account-Number juntos.", ispbLen: "X-ISPB tem 8 dígitos.",
    envTitle: "Variáveis de ambiente para os exemplos", envNote: "Os exemplos de requisição para servidor leem estas variáveis. Guarde-as no gerenciador de segredos do servidor; não as envie para o controle de versão. A cópia inclui a SK completa, mesmo quando ela está oculta.",
    test: "Testar conexão (Sandbox)", testing: "Testando…", testNote: "Envia uma requisição de leitura assinada a partir deste navegador; por isso, o IP deste computador precisa estar na Lista de IPs Permitidos.",
    prodNoTest: "Produção: endereço apenas para consulta. Não informe AK/SK de Produção nesta documentação. Configure e execute a integração de Produção no seu servidor.",
    copy: "Copiar com a SK", copied: "Copiado", copyFail: "Não foi possível copiar. Selecione Mostrar SK e copie o texto manualmente.",
    r: { 200: "Conectado: chave, assinatura e IP foram aceitos.", 401: "Chave de acesso desconhecida (code 401): confira se a chave é do Sandbox e cole a AK completa.", 4004103: "IP não permitido: adicione o IPv4 mostrado em Seu IP público à Lista de IPs Permitidos desta credencial. Se ele já estiver na lista, selecione Detectar de novo: esta rede pode sair por mais de um endereço, então adicione cada endereço confirmado ou teste a partir de uma rede com IP de saída fixo. Se a conexão usar IPv6, consulte o IPv4 de saída com curl -4 e execute a chamada por IPv4.", 4004107: "Assinatura inválida: confira se a SK pertence a esta AK.", 4004105: "Horário inválido: sincronize o relógio deste computador.", 4004003: "Permissão negada: confira se a conta de teste está pronta e se a credencial está Ativa em Credenciais de teste. Confirme se a operação está disponível para essa conta e esse tipo de credencial.", 4004101: "O cabeçalho X-Client-ID está ausente.", 4004102: "X-Timestamp, X-Nonce ou X-Signature está ausente, ou o timestamp não é numérico." },
    other: "Resultado inesperado; consulte o catálogo de erros.", net: "O navegador não alcançou a API (rede, extensão ou CORS). Execute o exemplo no servidor.",
  } : {
    intro: "Enter Sandbox credentials only. They stay only in this tab's memory: the signature tools on other pages use them until you reload or close the tab. Your SK is never sent.",
    env: "Environment", sandbox: "Sandbox", production: "Production",
    acctTitle: "Bank Account Level Credentials", userTitle: "User Level Credentials (OpenVA & Onboarding)",
    ak: "Access Key (AK)", sk: "Secret Key (SK)", ispb: "Default account X-ISPB (optional)", acct: "Default account X-Account-Number (optional)",
    userNote: "The default account is used only for account operations. Managed-account and event-subscription operations send no account headers.",
    save: "Save in this tab", charset: "Keys contain only letters, digits, underscores, and hyphens. Remove spaces, quotes, and other characters.", dirty: "Unsaved changes: the variables and the connection test below still use the saved credentials. Select Save in this tab to update them.", tmo: "No response within 20 seconds. Check your network and try again.", fixFirst: "Fix the fields marked above before saving.", half: "Enter both the AK and the SK of a credential, or clear both. Nothing was changed.", halfField: "Enter both the AK and the SK, or clear both.", clear: "Clear", show: "Show SK", hide: "Hide SK",
    saved: "Saved in this tab.", cleared: "Credentials removed from this tab.", nothing: "Enter the AK and SK of at least one credential.",
    pre: (k, p) => `${k} should start with ${p}.`, swap: "The AK and SK look swapped. Fix them before saving: an SK in the AK field would be sent in the X-Client-ID header.", pair: "Enter X-ISPB and X-Account-Number together.", ispbLen: "X-ISPB has 8 digits.",
    envTitle: "Environment variables for the samples", envNote: "The server-side request samples read these variables. Keep them in your server's secret manager; don't commit them to source control. Copying includes the full SK, even when it's hidden.",
    test: "Test connection (Sandbox)", testing: "Testing…", testNote: "Sends one signed read request from this browser, so this computer's IP must be on the credential's Allow List.",
    prodNoTest: "Production: address for reference only. Do not enter Production AK/SK in these docs. Configure and run your Production integration on your server.",
    copy: "Copy with SK", copied: "Copied", copyFail: "Couldn't copy. Select Show SK, then select the text and copy it manually.",
    r: { 200: "Connected: the key, signature, and IP were accepted.", 401: "Unknown access key (code 401): check that the key is from Sandbox and paste the complete AK.", 4004103: "IP not allowed: add the IPv4 shown under Your public IP to this credential's Allow List. If it's already listed, select Detect again: this network can leave from more than one address, so add each confirmed address or test from a network with a fixed outgoing IP. If the connection uses IPv6, find your outbound IPv4 with curl -4 and run the request over IPv4.", 4004107: "Invalid signature: check that the SK belongs to this AK.", 4004105: "Invalid timestamp: sync this computer's clock.", 4004003: "Permission denied: check that the test account is ready and its credential is Enabled in Test credentials. Confirm the operation is available to that account and credential type.", 4004101: "The X-Client-ID header is missing.", 4004102: "X-Timestamp, X-Nonce, or X-Signature is missing, or the timestamp isn't a number." },
    other: "Unexpected result; see the error catalog.", net: "This browser could not reach the API (network, extension, or CORS). Run the sample on your server.",
  };
  const URLS = { sandbox: "https://ebanking-openapi-sandbox.pagsmile.com.br", production: "https://ebanking-openapi.pagsmile.com.br" };
  const TESTS = { account: ["/v3/bank_account", "{}"], user: ["/v3/onboarding/managed_accounts/list", "{\"page\":{\"page\":1,\"page_size\":1}}"] };
  const blank = () => ({ env: "sandbox", account: { ak: "", sk: "" }, user: { ak: "", sk: "", ispb: "", acct: "" } });
  const [f, setF] = useState(blank());
  const [saved, setSaved] = useState(null);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [res, setRes] = useState({});
  const [copied, setCopied] = useState("");
  const [tried, setTried] = useState(false);
  const rev = useRef(0);
  const pending = useRef({});
  const message = (note, type = "info") => { setMsg(note); setMsgType(type); };

  const store = () => {
    // Discard credentials left by the previous environment-selectable version.
    if (!window.__pgsDocsCreds || window.__pgsDocsCreds.env !== "sandbox") window.__pgsDocsCreds = { env: "sandbox", account: null, user: null };
    return window.__pgsDocsCreds;
  };
  useEffect(() => {
    const s = store();
    setSaved({ ...s });
    setF({ env: "sandbox", account: s.account ? { ...s.account } : blank().account, user: s.user ? { ...s.user } : blank().user });
  }, []);

  const cancelTests = () => {
    rev.current += 1;
    Object.values(pending.current).forEach((ctl) => ctl.abort());
    pending.current = {};
  };
  const set = (kind, key, value) => {
    cancelTests();
    setRes({});
    let v = value.trim();
    if (key === "ispb" || key === "acct") v = v.replace(/\D/g, "");
    message("");
    setF((prev) => ({ ...prev, [kind]: { ...prev[kind], [key]: v } }));
  };

  const swapped = (c) => c.ak.includes("sk_") || c.sk.includes("ak_");
  const issues = (kind, withHalf = tried) => {
    const c = f[kind];
    const tag = kind === "account" ? "acct" : "user";
    const w = [];
    if (swapped(c)) w.push({ id: "swap", msg: T.swap, fields: ["ak", "sk"] });
    else {
      if (c.ak && !c.ak.startsWith(`ak_${tag}_`)) w.push({ id: "akpre", msg: T.pre("AK", `ak_${tag}_`), fields: ["ak"] });
      if (c.sk && !c.sk.startsWith(`sk_${tag}_`)) w.push({ id: "skpre", msg: T.pre("SK", `sk_${tag}_`), fields: ["sk"] });
    }
    const bad = ["ak", "sk"].filter((k) => c[k] && !/^[A-Za-z0-9_-]+$/.test(c[k]));
    if (bad.length) w.push({ id: "charset", msg: T.charset, fields: bad });
    if (withHalf && (c.ak === "") !== (c.sk === "")) w.push({ id: "half", msg: T.halfField, fields: [c.ak === "" ? "ak" : "sk"] });
    if (kind === "user" && (c.ispb === "") !== (c.acct === "")) w.push({ id: "pair", msg: T.pair, fields: [c.ispb === "" ? "ispb" : "acct"] });
    if (kind === "user" && c.ispb && c.ispb.length !== 8) w.push({ id: "ispblen", msg: T.ispbLen, fields: ["ispb"] });
    return w;
  };
  const focusField = (kind, key) => {
    const el = document.getElementById(`cs-${kind}-${key}`);
    if (el) el.focus();
  };

  const publish = (next) => {
    cancelTests();
    Object.assign(store(), next);
    setSaved({ ...store() });
    window.dispatchEvent(new Event("pgs-creds"));
  };
  const save = () => {
    const all = ["account", "user"].flatMap((k) => issues(k, true).map((i) => [k, i]));
    if (all.length) {
      setTried(true);
      const [k, i] = all.find(([, x]) => x.id === "swap") || all.find(([, x]) => x.id === "half") || all[0];
      message(i.id === "swap" ? T.swap : i.id === "half" ? T.half : T.fixFirst, "error");
      focusField(k, i.fields[0]);
      return;
    }
    const a = f.account.ak && f.account.sk ? { ...f.account } : null;
    const u = f.user.ak && f.user.sk ? { ...f.user } : null;
    if (!a && !u) { message(T.nothing, "error"); focusField("account", "ak"); return; }
    setTried(false);
    publish({ env: "sandbox", account: a, user: u });
    setF({ env: "sandbox", account: a ? { ...a } : blank().account, user: u ? { ...u } : blank().user });
    setRes({});
    message(T.saved, "success");
  };
  const clear = () => {
    publish({ env: "sandbox", account: null, user: null });
    setF(blank());
    setTried(false);
    setRes({});
    message(T.cleared, "success");
  };

  const enc = (s) => new TextEncoder().encode(s);
  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc(s)));
  const hmac = async (key, s) => {
    const k = await crypto.subtle.importKey("raw", enc(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return hex(await crypto.subtle.sign("HMAC", k, enc(s)));
  };

  const test = async (kind) => {
    const c = saved && saved[kind];
    if (!c || saved.env !== "sandbox" || swapped(c)) return;
    const mine = rev.current;
    const [path, body] = TESTS[kind];
    setRes((p) => ({ ...p, [kind]: { busy: true } }));
    const ctl = new AbortController();
    pending.current[kind] = ctl;
    const timer = setTimeout(() => ctl.abort(), 20000);
    try {
      const ts = String(Date.now());
      const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await sha256(body);
      const canon = [`content-type:application/json`, `x-client-id:${c.ak}`, `x-content-hash:${hash}`, `x-nonce:${nonce}`, `x-timestamp:${ts}`].join("\n");
      const sig = await hmac(c.sk, ["POST", path, "", canon, hash, ts, nonce].join("\n"));
      if (mine !== rev.current) return;
      if (ctl.signal.aborted) throw new Error("timeout");
      const r = await fetch(URLS.sandbox + path, { method: "POST", body, signal: ctl.signal, headers: { "Content-Type": "application/json", "X-Client-ID": c.ak, "X-Timestamp": ts, "X-Nonce": nonce, "X-Content-Hash": hash, "X-Signature": sig } });
      const txt = await r.text();
      let j = null;
      try { j = JSON.parse(txt); } catch (e) { j = null; }
      const code = j && j.code !== undefined ? j.code : null;
      if (mine === rev.current) setRes((p) => ({ ...p, [kind]: { code, http: r.status, message: j ? j.message : txt.slice(0, 120), ok: code === 200 } }));
    } catch (e) {
      if (mine === rev.current) setRes((p) => ({ ...p, [kind]: ctl.signal.aborted ? { timeout: true } : { net: true } }));
    } finally {
      clearTimeout(timer);
      if (pending.current[kind] === ctl) delete pending.current[kind];
    }
  };

  const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;
  const qPs = (s) => `'${String(s).replace(/['\u2018\u2019\u201A\u201B]/g, "$&$&")}'`;
  const envText = (c, ps, reveal) => {
    const sk = reveal ? c.sk : `${c.sk.slice(0, 8)}••••••••`;
    const base = URLS.sandbox;
    return ps
      ? `$env:PAGSMILE_BASE_URL = ${qPs(base)}\n$env:PAGSMILE_AK = ${qPs(c.ak)}\n$env:PAGSMILE_SK = ${qPs(sk)}`
      : `export PAGSMILE_BASE_URL=${q(base)}\nexport PAGSMILE_AK=${q(c.ak)}\nexport PAGSMILE_SK=${q(sk)}`;
  };
  const copy = async (id, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(id); setTimeout(() => setCopied(""), 1500); } catch (e) { setCopied("fail"); }
  };

  const input = (kind, key, label, secret) => {
    const mine = issues(kind).filter((i) => i.fields.includes(key));
    return (
      <label htmlFor={`cs-${kind}-${key}`} className="pgs-field">
        <span className="pgs-label">{label}</span>
        <input id={`cs-${kind}-${key}`} type={(secret || f[kind][key].includes("sk_")) && !show ? "password" : "text"} value={f[kind][key]} onChange={(e) => set(kind, key, e.target.value)} aria-invalid={mine.length ? "true" : undefined} aria-describedby={mine.length ? mine.map((i) => `cs-${kind}-err-${i.id}`).join(" ") : undefined} autoComplete="off" spellCheck={false} className="pgs-input pgs-mono" />
      </label>
    );
  };
  const block = (kind, title) => (
    <fieldset className="pgs-sec">
      <legend className="pgs-legend">{title}</legend>
      <div className="pgs-grid">
        {input(kind, "ak", T.ak)}
        {input(kind, "sk", T.sk, true)}
        {kind === "user" ? input(kind, "ispb", T.ispb) : null}
        {kind === "user" ? input(kind, "acct", T.acct) : null}
      </div>
      {kind === "user" ? <p className="pgs-note">{T.userNote}</p> : null}
      {issues(kind).map((i) => <p key={i.id} id={`cs-${kind}-err-${i.id}`} className="pgs-warn">{i.msg}</p>)}
    </fieldset>
  );
  const savedKinds = saved ? ["account", "user"].filter((k) => saved[k]) : [];
  const norm = (c) => JSON.stringify(c ? [c.ak || "", c.sk || "", c.ispb || "", c.acct || ""] : ["", "", "", ""]);
  const dirty = Boolean(saved) && (f.env !== (saved.env || "sandbox") || norm(f.account) !== norm(saved.account) || norm(f.user) !== norm(saved.user));

  return (
    <div className="pgs not-prose">
      <p className="pgs-intro">{T.intro}</p>
      <div className="pgs-field">
        <span className="pgs-label">{T.env}: {T.sandbox}</span>
        <code className="pgs-pre">{URLS.sandbox}</code>
      </div>
      <details className="pgs-details">
        <summary>{T.production}</summary>
        <p className="pgs-note">{T.prodNoTest}</p>
        <code className="pgs-pre">{URLS.production}</code>
      </details>
      {block("account", T.acctTitle)}
      {block("user", T.userTitle)}
      <div className="pgs-actions">
        <button type="button" onClick={save} className="pgs-btn pgs-primary">{T.save}</button>
        <button type="button" onClick={() => setShow(!show)} className="pgs-btn" aria-pressed={show}>{show ? T.hide : T.show}</button>
        <button type="button" onClick={clear} className="pgs-btn">{T.clear}</button>
      </div>
      {msg ? <p role="status" aria-atomic="true" className={msgType === "error" ? "pgs-warn" : msgType === "success" ? "pgs-msg" : "pgs-info"}>{msg}</p> : null}
      {savedKinds.length ? (
        <div className="pgs-out">
          <p className="pgs-legend">{T.envTitle}</p>
          <p className="pgs-note">{T.envNote}</p>
          {copied === "fail" ? <p role="status" className="pgs-warn">{T.copyFail}</p> : null}
          {dirty ? <p role="status" className="pgs-warn">{T.dirty}</p> : null}
          {savedKinds.map((k) => (
            <div key={k} className="pgs-sec">
              <p className="pgs-label">{k === "account" ? T.acctTitle : T.userTitle}</p>
              {[["bash", false], ["PowerShell", true]].map(([name, ps]) => (
                <div key={name} className="pgs-row pgs-row-stack">
                  <span className="pgs-key">{name}</span>
                  <pre className="pgs-pre pgs-val">{envText(saved[k], ps, show)}</pre>
                  <button type="button" onClick={() => copy(`${k}-${name}`, envText(saved[k], ps, true))} disabled={dirty} className="pgs-copy" aria-label={`${T.copy} ${name}`}>{copied === `${k}-${name}` ? T.copied : T.copy}</button>
                </div>
              ))}
              {saved.env === "sandbox" ? (
                <div className="pgs-actions">
                  <button type="button" onClick={() => test(k)} disabled={dirty || (res[k] && res[k].busy)} className="pgs-btn" aria-label={`${T.test} · POST ${TESTS[k][0]}`}>{res[k] && res[k].busy ? T.testing : T.test}</button>
                  <code className="pgs-ep">POST {TESTS[k][0]}</code>
                </div>
              ) : null}
              {res[k] && !res[k].busy ? (
                <p role="status" className={res[k].ok ? "pgs-msg" : "pgs-warn"}>
                  {res[k].timeout ? T.tmo : res[k].net ? T.net : `HTTP ${res[k].http} · code ${res[k].code === null ? "—" : res[k].code}${res[k].message ? ` · ${res[k].message}` : ""}. ${T.r[res[k].code] || T.other}`}
                </p>
              ) : null}
            </div>
          ))}
          <p className="pgs-note">{saved.env === "sandbox" ? T.testNote : T.prodNoTest}</p>
        </div>
      ) : null}
    </div>
  );
};
