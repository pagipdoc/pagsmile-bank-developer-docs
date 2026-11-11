export const IpAllowlistHelper = ({ lang = "en" }) => {
  const T = lang === "pt" ? {
    detectTitle: "Seu IP público",
    detectIntro: "Ao abrir esta página, este navegador pergunta ao host da API do Sandbox qual endereço ele vê (/cdn-cgi/trace). A consulta não leva credenciais e não acessa Produção. Cada resultado é um retrato deste momento: requisições posteriores podem sair por outro endereço.",
    detect: "Detectar de novo", busy: "Detectando…", use: "Adicionar à lista", miss: "sem resposta. Selecione Detectar de novo ou execute o comando do servidor do passo anterior para esse host.", copyFail: "Não foi possível copiar. Selecione o valor e copie manualmente.",
    sandbox: "API do Sandbox",
    failed: "Este navegador não conseguiu consultar os hosts da API. Execute neste computador o comando do servidor mostrado no passo anterior.",
    v6a: "Endereço IPv6 (", v6b: "): o Centro de desenvolvedores aceita apenas IPv4 na Lista de IPs Permitidos. Use curl -4 no comando do passo anterior para consultar o IPv4 deste computador e adicione esse endereço. Execute também as chamadas de teste por IPv4. A detecção é um retrato deste momento: requisições posteriores podem sair por outro endereço.",
    serverHint: "Este é o endereço da rede deste computador. Servidores costumam usar outros endereços: execute o comando do passo anterior em cada servidor.",
    buildTitle: "Montar a Lista de IPs Permitidos",
    rules: "Use IPv4 ou CIDR de /1 a /32, com até 10 entradas após remover duplicatas. As faixas são convertidas para o endereço da rede; /32 vira um único IP.",
    add: "IPs ou faixas CIDR para adicionar", cur: "Lista atual no painel (cole-a para manter as entradas existentes; deixe em branco só se a lista do painel estiver vazia)", replace: "O painel substitui a lista inteira pelo valor colado. Entradas que ficarem de fora perdem o acesso.",
    result: "Cole este valor no campo Lista de IPs Permitidos", copy: "Copiar", copied: "Copiado", entries: "entradas",
    empty: "Lista vazia: a API rejeita todas as requisições com 4004103.",
    fixFirst: "Corrija as entradas marcadas com ✕ antes de copiar. O painel substitui a lista inteira pelo valor colado.",
    badFmt: "Formato inválido. Use um IPv4 ou uma faixa CIDR IPv4.", badPrefix: "O prefixo CIDR deve estar entre /1 e /32.",
    ipv6: "IPv6 não é aceito na Lista de IPs Permitidos. Use curl -4 para consultar o IPv4 de saída e faça as chamadas por IPv4.",
    badEgress: "O Centro de desenvolvedores não aceita endereços iniciados por 0, 127 ou 224–255. Informe o IPv4 de saída do servidor.",
    badNetwork: "Esta faixa gera um endereço de rede iniciado por 0, que o campo do painel não aceita. Use uma faixa menor ou um único IPv4.",
    private: "Endereço privado, reservado ou de documentação. A API vê o IP público de saída.",
    limit: "A lista aceita no máximo 10 entradas após remover duplicatas. Reduza a lista antes de copiar.", normalized: "Normalizado para: ", dup: "duplicadas removidas",
  } : {
    detectTitle: "Your public IP",
    detectIntro: "When this page opens, this browser asks the Sandbox API host which address it sees (/cdn-cgi/trace). The request carries no credentials and does not contact Production. Each result is a snapshot: later requests can leave from another address.",
    detect: "Detect again", busy: "Detecting…", use: "Add to list", miss: "no answer. Select Detect again, or run the server command from the previous step against this host.", copyFail: "Couldn't copy. Select the value and copy it manually.",
    sandbox: "Sandbox API",
    failed: "This browser couldn't reach the API hosts. Run the server command from the previous step on this computer.",
    v6a: "IPv6 address (", v6b: "): the Developer Center accepts only IPv4 in the Allow List. Add curl -4 to the command in the previous step to find this computer's outbound IPv4, then add that address. Run test requests over IPv4 too. Detection is a snapshot: later requests can leave from another address.",
    serverHint: "This is the address of this computer's network. Servers usually use other addresses: run the command from the previous step on each server.",
    buildTitle: "Build the Allow List",
    rules: "Use IPv4 or CIDR prefixes /1–/32, with up to 10 entries after deduplication. CIDR ranges are normalized to the network address; /32 becomes a single IP.",
    add: "IP addresses or CIDR ranges to add", cur: "Current list in the dashboard (paste it to keep existing entries; leave it blank only if the dashboard list is empty)", replace: "The dashboard replaces the whole list with the value you paste. Entries missing from it lose access.",
    result: "Paste this value into the Allow List field", copy: "Copy", copied: "Copied", entries: "entries",
    empty: "Empty list: the API rejects every request with 4004103.",
    fixFirst: "Fix the entries marked ✕ before you copy. The dashboard replaces the whole list with the value you paste.",
    badFmt: "Invalid format. Use an IPv4 address or an IPv4 CIDR range.", badPrefix: "CIDR prefixes must be between /1 and /32.",
    ipv6: "IPv6 is not accepted in the Allow List. Use curl -4 to find your outbound IPv4 and call the API over IPv4.",
    badEgress: "The Developer Center does not accept addresses starting with 0, 127, or 224–255. Enter your server's outbound IPv4.",
    badNetwork: "This range normalizes to a network address starting with 0, which the dashboard field rejects. Use a narrower range or a single IPv4.",
    private: "Private, reserved, or documentation address. The API sees your public egress IP.",
    limit: "The list accepts at most 10 entries after deduplication. Shorten it before copying.", normalized: "Normalized to: ", dup: "duplicates removed",
  };
  const HOSTS = [["sandbox", "https://ebanking-openapi-sandbox.pagsmile.com.br"]];
  const [seen, setSeen] = useState({});
  const [state, setState] = useState("busy");
  const [add, setAdd] = useState("");
  const [cur, setCur] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFail, setCopyFail] = useState(false);
  const run = useRef(0);

  const isV4 = (s) => /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(s);
  const canon6 = (s) => {
    if (!/^[0-9a-f:.]+$/i.test(s) || s.indexOf(":") < 0) return "";
    try { return new URL(`http://[${s}]/`).hostname.slice(1, -1); } catch (e) { return ""; }
  };

  const v4num = (s) => s.split(".").reduce((n, o) => n * 256 + Number(o), 0);
  const V4_SPECIAL = [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]];
  const special4 = (s) => {
    const n = v4num(s);
    return V4_SPECIAL.some(([b, bits]) => Math.floor(n / 2 ** (32 - bits)) === Math.floor(v4num(b) / 2 ** (32 - bits)));
  };

  const trace = async (base) => {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(`${base}/cdn-cgi/trace`, { cache: "no-store", credentials: "omit", signal: ctl.signal });
      if (!r.ok) return "";
      const line = (await r.text()).split("\n").find((l) => l.startsWith("ip="));
      const ip = line ? line.slice(3).trim() : "";
      return isV4(ip) ? ip : canon6(ip);
    } catch (e) { return ""; } finally { clearTimeout(timer); }
  };

  const detect = async () => {
    const mine = ++run.current;
    setState("busy");
    const ips = await Promise.all(HOSTS.map(([, base]) => trace(base)));
    if (mine !== run.current) return;
    const out = {};
    HOSTS.forEach(([k], i) => { if (ips[i]) out[k] = ips[i]; });
    setSeen(out);
    setState(Object.keys(out).length ? "done" : "failed");
  };

  useEffect(() => { detect(); return () => { run.current += 1; }; }, []);

  const rows = HOSTS.filter(([k]) => seen[k]).map(([k]) => [T[k], seen[k]]);
  const detected = rows.map(([, ip]) => ip).filter(isV4);
  const v6rows = rows.filter(([, ip]) => ip.includes(":"));
  const missing = state === "done" ? HOSTS.filter(([k]) => !seen[k]).map(([k]) => T[k]) : [];

  const append = (ip) => {
    setCopied(false);
    setAdd((prev) => (split(prev).includes(ip) ? prev : (prev.trim() ? `${prev.trim()},${ip}` : ip)));
  };

  const check = (entry) => {
    const parts = entry.split("/");
    if (parts.length > 2) return { entry, bad: T.badFmt };
    const ip = parts[0];
    const pre = parts[1];
    if (canon6(ip)) return { entry, bad: T.ipv6 };
    if (!isV4(ip)) return { entry, bad: T.badFmt };
    if (pre !== undefined && !(/^\d{1,2}$/.test(pre) && Number(pre) >= 1 && Number(pre) <= 32)) return { entry, bad: T.badPrefix };
    const bits = pre === undefined ? null : Number(pre);
    const first = Number(ip.split(".")[0]);
    if (first === 0 || first === 127 || first >= 224) return { entry, bad: T.badEgress };
    const network = bits === null || bits === 32 ? v4num(ip) : Math.floor(v4num(ip) / 2 ** (32 - bits)) * 2 ** (32 - bits);
    const normalized = bits === null || bits === 32 ? ip : `${[network >>> 24, (network >>> 16) & 255, (network >>> 8) & 255, network & 255].join(".")}/${bits}`;
    // A copied network must also pass the Developer Center's IPv4 input guard.
    if (normalized.startsWith("0.")) return { entry, bad: T.badNetwork };
    const warn = [];
    if (special4(ip)) warn.push(T.private);
    return { entry, normalized, warn };
  };

  const split = (s) => s.split(/[\s,，]+/).map((x) => x.trim()).filter(Boolean);
  const all = [...split(cur), ...split(add)];
  const keys = new Set();
  const checks = [];
  all.forEach((x) => { const c = check(x); const k = c.normalized || x.toLowerCase(); if (!keys.has(k)) { keys.add(k); checks.push(c); } });
  const list = checks.map((c) => c.normalized || c.entry);
  const hasBad = checks.some((c) => c.bad);
  const overLimit = !hasBad && list.length > 10;
  const value = hasBad || overLimit ? "" : list.join(",");
  const hasInput = all.length > 0;

  const copy = async () => {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopyFail(false); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { setCopied(false); setCopyFail(true); }
  };

  return (
    <div className="pgs not-prose">
      <section className="pgs-sec" aria-labelledby="ipa-detect">
        <p id="ipa-detect" className="pgs-legend">{T.detectTitle}</p>
        <p className="pgs-note">{T.detectIntro}</p>
        {state === "busy" ? <p className="pgs-note" role="status">{T.busy}</p> : null}
        {state === "done" ? (
          <dl className="pgs-rows" aria-live="polite">
            {rows.map(([k, val]) => (
              <div key={k} className="pgs-row">
                <dt className="pgs-key">{k}</dt>
                <dd className="pgs-val"><code>{val}</code></dd>
                {isV4(val) ? <button type="button" onClick={() => append(val)} className="pgs-copy" aria-label={`${T.use}: ${val}`}>{T.use}</button> : null}
              </div>
            ))}
          </dl>
        ) : null}
        {state === "done" ? v6rows.map(([k]) => <p key={k} className="pgs-warn">{T.v6a}{k}{T.v6b}</p>) : null}
        {missing.map((k) => <p key={k} className="pgs-warn">{k}: {T.miss}</p>)}
        {state === "failed" ? <p className="pgs-warn" aria-live="polite">{T.failed}</p> : null}
        {state === "done" ? <p className="pgs-note">{T.serverHint}</p> : null}
        <div className="pgs-actions">
          <button type="button" onClick={detect} disabled={state === "busy"} className="pgs-btn">{T.detect}</button>
        </div>
      </section>
      <section className="pgs-sec" aria-labelledby="ipa-build">
        <p id="ipa-build" className="pgs-legend">{T.buildTitle}</p>
        <p className="pgs-note">{T.rules}</p>
        <label htmlFor="ipa-add" className="pgs-field">
          <span className="pgs-label">{T.add}</span>
          <textarea id="ipa-add" rows={2} value={add} onChange={(e) => { setCopied(false); setAdd(e.target.value); }} spellCheck={false} placeholder={detected.join(", ")} className="pgs-input pgs-mono pgs-area" />
        </label>
        <label htmlFor="ipa-cur" className="pgs-field">
          <span className="pgs-label">{T.cur}</span>
          <textarea id="ipa-cur" rows={2} value={cur} onChange={(e) => { setCopied(false); setCur(e.target.value); }} spellCheck={false} className="pgs-input pgs-mono pgs-area" />
        </label>
        {hasInput ? (
          <div className="pgs-out" aria-live="polite">
            <ul className="pgs-checks">
              {checks.map((c) => (
                <li key={c.entry} className={c.bad ? "pgs-check pgs-fail" : (c.warn.length ? "pgs-check pgs-caution" : "pgs-check pgs-ok")}>
                  <span>{c.bad ? "✕" : (c.warn.length ? "!" : "✓")}</span> <code>{c.entry}</code>
                  {c.normalized && c.normalized !== c.entry ? <span className="pgs-check-msg">{T.normalized}<code>{c.normalized}</code></span> : null}
                  {(c.bad ? [c.bad] : c.warn).map((m) => <span key={m} className="pgs-check-msg">{m}</span>)}
                </li>
              ))}
            </ul>
            {all.length > list.length ? <p className="pgs-note">{all.length - list.length} {T.dup}.</p> : null}
            {hasBad ? <p className="pgs-warn">{T.fixFirst}</p> : null}
            {overLimit ? <p className="pgs-warn">{T.limit}</p> : null}
            {value ? (
              <dl className="pgs-rows">
                <div className="pgs-row">
                  <dt className="pgs-key">{list.length} {T.entries}</dt>
                  <dd className="pgs-val"><code>{value}</code></dd>
                  <button type="button" onClick={copy} className="pgs-copy" aria-label={`${T.copy}: ${T.result}`}>{copied ? T.copied : T.copy}</button>
                </div>
              </dl>
            ) : null}
            {copyFail && value ? <p role="status" className="pgs-warn">{T.copyFail}</p> : null}
            {!hasBad && !overLimit && !value ? <p className="pgs-warn">{T.empty}</p> : null}
            {value ? <p className="pgs-note">{T.result}.</p> : null}
            {value ? <p className="pgs-warn">{T.replace}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
};
