export const ConnectionMap = ({ lang = "en" }) => {
  const [replay, setReplay] = useState(0);
  const pt = lang === "pt";
  return (
    <section className="pgs-connection" aria-label={pt ? "Sua conexão com a API" : "Your API connection"}>
      <div className="pgs-connection-copy">
        <p className="pgs-connection-title">{pt ? "Faça sua primeira requisição assinada." : "Make your first signed request."}</p>
        <p className="pgs-connection-description">{pt ? "Assine requisições. Leia respostas. Verifique eventos." : "Sign requests. Read responses. Verify events."}</p>
        <div className="pgs-connection-actions">
        <a className="pgs-connection-start" href={pt ? "/pt-br/quickstart" : "/quickstart"}>{pt ? "Comece no Sandbox" : "Start in Sandbox"}<span aria-hidden="true"> →</span></a>
        <button type="button" className="pgs-connection-replay" onClick={() => setReplay(value => value + 1)}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 8a6 6 0 1 1 0 5M4 3v5h5" /></svg>
          {pt ? "Rever o fluxo" : "Replay the flow"}
        </button>
        </div>
      </div>
      <div className="pgs-connection-art" key={replay}>
        <div className="pgs-map-compact" aria-hidden="true">
          <span>{pt ? "Sua aplicação" : "Your application"}</span>
          <span className="pgs-map-compact-arrow">⇄</span>
          <span>Pagsmile API</span>
        </div>
        <svg className="pgs-connection-diagram" viewBox="0 0 620 240" role="img" aria-label={pt ? "A aplicação envia requisições assinadas à Pagsmile API, recebe respostas e verifica callbacks de eventos." : "Your application sends signed requests to the Pagsmile API, receives responses and verifies event callbacks."}>
          <g className="pgs-map-grid" fill="none" stroke="currentColor"><path d="M20 40H600M20 80H600M20 120H600M20 160H600M20 200H600M60 20V220M160 20V220M260 20V220M360 20V220M460 20V220M560 20V220" /></g>
          <path className="pgs-map-route" d="M120 100C190 20 420 20 490 100" />
          <path className="pgs-map-route pgs-map-return" d="M490 132C410 198 200 198 120 132" />
          <path className="pgs-map-event" d="M490 144C430 248 180 248 120 144" />
          <path className="pgs-map-signal" pathLength="100" d="M120 100C190 20 420 20 490 100" />
          <path className="pgs-map-signal pgs-map-signal-return" pathLength="100" d="M490 132C410 198 200 198 120 132" />
          <path className="pgs-map-arrow" d="m480 92 10 8-1-13M131 136l-11-4 3 11" />
          <rect className="pgs-map-node" x="22" y="88" width="166" height="64" rx="16" />
          <rect className="pgs-map-api" x="422" y="88" width="176" height="64" rx="16" />
          <text className="pgs-map-node-text" x="105" y="125" textAnchor="middle">{pt ? "Sua aplicação" : "Your application"}</text>
          <text className="pgs-map-api-text" x="510" y="125" textAnchor="middle">Pagsmile API</text>
          <rect className="pgs-map-label-bg" x="213" y="31" width="194" height="30" rx="15" />
          <text className="pgs-map-label" x="310" y="51" textAnchor="middle">{pt ? "Requisição assinada →" : "Signed request →"}</text>
          <text className="pgs-map-label" x="310" y="163" textAnchor="middle">{pt ? "← Resposta" : "← Response"}</text>
          <text className="pgs-map-event-text" x="310" y="230" textAnchor="middle">{pt ? "← Callbacks de eventos" : "← Event callbacks"}</text>
        </svg>
      </div>
    </section>
  );
};
