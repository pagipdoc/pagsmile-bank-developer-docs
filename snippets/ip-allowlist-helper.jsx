export const IpAllowlistHelper = ({ lang = "en" }) => {
  const T = lang === "pt" ? {
    detectTitle: "Seu IP público",
    detectIntro: "Ao abrir esta página, este navegador pergunta aos hosts da API do Sandbox e de Produção qual endereço eles veem (/cdn-cgi/trace). A consulta não leva credenciais. Cada resultado é um retrato deste momento: requisições posteriores podem sair por outro endereço.",
    detect: "Detectar de novo", busy: "Detectando…", use: "Adicionar à lista", miss: "sem resposta. Selecione Detectar de novo ou execute o comando do servidor do passo anterior para esse host.", copyFail: "Não foi possível copiar. Selecione o valor e copie manualmente.",
    both: "APIs do Sandbox e de Produção", sandbox: "API do Sandbox", production: "API de Produção",
    failed: "Este navegador não conseguiu consultar os hosts da API. Execute neste computador o comando do servidor mostrado no passo anterior.",
    v6a: "Endereço IPv6 (", v6b: "): o painel não consegue salvá-lo porque contém letras. A detecção é um retrato deste momento: requisições posteriores podem sair por outro endereço. Se uma requisição usar este endereço e nenhuma entrada da Lista de IPs Permitidos o cobrir, a API retorna 4004103. Neste computador, execute o comando cURL gerado com curl -4 ou fale com o suporte da Pagsmile.",
    serverHint: "Este é o endereço da rede deste computador. Servidores costumam usar outros endereços: execute o comando do passo anterior em cada servidor.",
    buildTitle: "Montar a Lista de IPs Permitidos",
    add: "IPs ou faixas CIDR para adicionar", cur: "Lista atual no painel (cole-a para manter as entradas existentes; deixe em branco só se a lista do painel estiver vazia)", replace: "O painel substitui a lista inteira pelo valor colado. Entradas que ficarem de fora perdem o acesso.",
    result: "Cole este valor no campo Lista de IPs Permitidos", copy: "Copiar", copied: "Copiado", entries: "entradas",
    empty: "Lista vazia: a API rejeita todas as requisições com 4004103.",
    fixFirst: "Corrija as entradas marcadas com ✕ antes de copiar. O painel substitui a lista inteira pelo valor colado.",
    badFmt: "Formato inválido. Use um IPv4, um IPv6 ou uma faixa CIDR.", badPrefix: "Prefixo CIDR fora do intervalo ou com zeros à esquerda.",
    letters: "Contém letras. O campo do painel remove letras, então este IPv6 não pode ser salvo lá. Faça as chamadas por IPv4 ou fale com o suporte da Pagsmile.",
    notCanon: "Um IPv6 exato precisa estar na forma compacta: ", private: "Endereço privado, reservado ou de documentação. A API vê o IP público de saída.",
    any: "Permite qualquer endereço desta família. Não use em produção.", dup: "duplicadas removidas",
  } : {
    detectTitle: "Your public IP",
    detectIntro: "When this page opens, this browser asks the Sandbox and Production API hosts which address they see (/cdn-cgi/trace). The request carries no credentials. Each result is a snapshot: later requests can leave from another address.",
    detect: "Detect again", busy: "Detecting…", use: "Add to list", miss: "no answer. Select Detect again, or run the server command from the previous step against this host.", copyFail: "Couldn't copy. Select the value and copy it manually.",
    both: "Sandbox and Production APIs", sandbox: "Sandbox API", production: "Production API",
    failed: "This browser couldn't reach the API hosts. Run the server command from the previous step on this computer.",
    v6a: "IPv6 address (", v6b: "): the dashboard can't save it because it contains letters. Detection is a snapshot: later requests can leave from another address. If a request uses this address and no Allow List entry covers it, the API returns 4004103. From this computer, run the generated cURL command with curl -4, or contact Pagsmile support.",
    serverHint: "This is the address of this computer's network. Servers usually use other addresses: run the command from the previous step on each server.",
    buildTitle: "Build the Allow List",
    add: "IP addresses or CIDR ranges to add", cur: "Current list in the dashboard (paste it to keep existing entries; leave it blank only if the dashboard list is empty)", replace: "The dashboard replaces the whole list with the value you paste. Entries missing from it lose access.",
    result: "Paste this value into the Allow List field", copy: "Copy", copied: "Copied", entries: "entries",
    empty: "Empty list: the API rejects every request with 4004103.",
    fixFirst: "Fix the entries marked ✕ before you copy. The dashboard replaces the whole list with the value you paste.",
    badFmt: "Invalid format. Use an IPv4 address, an IPv6 address, or a CIDR range.", badPrefix: "CIDR prefix out of range or with leading zeros.",
    letters: "Contains letters. The dashboard field removes letters, so this IPv6 address can't be saved there. Call the API over IPv4 or contact Pagsmile support.",
    notCanon: "An exact IPv6 entry must use the compressed form: ", private: "Private, reserved, or documentation address. The API sees your public egress IP.",
    any: "Allows every address of this family. Don't use it in production.", dup: "duplicates removed",
  };
  const HOSTS = [["sandbox", "https://ebanking-openapi-sandbox.pagsmile.com.br"], ["production", "https://ebanking-openapi.pagsmile.com.br"]];
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
  const hextets = (c) => {
    const [l, r] = c.split("::");
    const L = l ? l.split(":") : [];
    const R = r !== undefined && r ? r.split(":") : [];
    const mid = c.includes("::") ? Array(8 - L.length - R.length).fill("0") : [];
    return [...L, ...mid, ...R].map((h) => parseInt(h, 16));
  };
  const special6 = (c) => {
    const h = hextets(c);
    if (h.length !== 8 || h.some((x) => Number.isNaN(x))) return true;
    if ((h[0] & 0xe000) !== 0x2000) return true;
    if (h[0] === 0x2001 && (h[1] === 0x0db8 || (h[1] === 0x0002 && h[2] === 0) || (h[1] & 0xfff0) === 0x0010 || (h[1] & 0xfff0) === 0x0020)) return true;
    return h[0] === 0x3fff && (h[1] & 0xf000) === 0;
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

  const rows = seen.sandbox && seen.sandbox === seen.production
    ? [[T.both, seen.sandbox]]
    : HOSTS.filter(([k]) => seen[k]).map(([k]) => [T[k], seen[k]]);
  const lettered = (ip) => ip.indexOf(":") >= 0 && /[a-f]/i.test(ip);
  const detected = rows.map(([, ip]) => ip).filter((ip) => !lettered(ip));
  const v6rows = rows.filter(([, ip]) => ip.indexOf(":") >= 0 && /[a-f]/i.test(ip));
  const missing = state === "done" ? HOSTS.filter(([k]) => !seen[k]).map(([k]) => T[k]) : [];

  const append = (ip) => {
    setCopied(false);
    setAdd((prev) => (prev.split(/[\s,]+/).includes(ip) ? prev : (prev.trim() ? `${prev.trim()},${ip}` : ip)));
  };

  const check = (entry) => {
    const parts = entry.split("/");
    if (parts.length > 2) return { entry, bad: T.badFmt };
    const ip = parts[0];
    const pre = parts[1];
    const six = ip.indexOf(":") >= 0;
    if (six ? !canon6(ip) : !isV4(ip)) return { entry, bad: T.badFmt };
    if (pre !== undefined && !(/^(0|[1-9]\d{0,2})$/.test(pre) && Number(pre) <= (six ? 128 : 32))) return { entry, bad: T.badPrefix };
    const bits = pre === undefined ? null : Number(pre);
    const warn = [];
    if (/[a-z]/i.test(entry)) return { entry, bad: T.letters };
    if (six && pre === undefined && canon6(ip) !== ip.toLowerCase()) warn.push(T.notCanon + canon6(ip));
    if (bits === 0) warn.push(T.any);
    else if (six ? special6(canon6(ip)) : special4(ip)) warn.push(T.private);
    return { entry, warn };
  };

  const split = (s) => s.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
  const all = [...split(cur), ...split(add)];
  const keys = new Set();
  const list = [];
  all.forEach((x) => { const k = x.toLowerCase(); if (!keys.has(k)) { keys.add(k); list.push(x); } });
  const checks = list.map(check);
  const hasBad = checks.some((c) => c.bad);
  const value = hasBad ? "" : list.join(",");
  const hasInput = all.length > 0;

  const copy = async () => {
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
                {lettered(val) ? null : <button type="button" onClick={() => append(val)} className="pgs-copy" aria-label={`${T.use}: ${val}`}>{T.use}</button>}
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
                  {(c.bad ? [c.bad] : c.warn).map((m) => <span key={m} className="pgs-check-msg">{m}</span>)}
                </li>
              ))}
            </ul>
            {all.length > list.length ? <p className="pgs-note">{all.length - list.length} {T.dup}.</p> : null}
            {hasBad ? <p className="pgs-warn">{T.fixFirst}</p> : null}
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
            {!hasBad && !value ? <p className="pgs-warn">{T.empty}</p> : null}
            {value ? <p className="pgs-note">{T.result}.</p> : null}
            {value ? <p className="pgs-warn">{T.replace}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
};
