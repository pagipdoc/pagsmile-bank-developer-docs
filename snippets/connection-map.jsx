export const ConnectionMap = ({ lang = "en" }) => {
  const pt = lang === "pt";
  const stageRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [still, setStill] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 720px)");
    const connection = navigator.connection;
    const update = () => {
      const staticView = motion.matches || compact.matches || Boolean(connection && connection.saveData);
      setStill(staticView);
    };
    update();
    motion.addEventListener("change", update);
    compact.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      motion.removeEventListener("change", update);
      compact.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let inView = typeof IntersectionObserver === "undefined";
    const update = () => {
      stage.style.animationPlayState = inView && !document.hidden && !paused && !still && ready && !failed ? "running" : "paused";
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.05 });
    observer?.observe(stage);
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [paused, still, ready, failed]);

  const asset = "/images/brand/pagsmile-mark-3d.png";

  return (
    <section className="pgs-connection pgs-brand-hero" aria-label={pt ? "Sua conexão com a API" : "Your API connection"}>
      <div className="pgs-connection-copy">
        <p className="pgs-connection-title">{pt ? "Faça sua primeira requisição assinada." : "Make your first signed request."}</p>
        <p className="pgs-connection-description">{pt ? "Assine requisições. Leia respostas. Verifique eventos." : "Sign requests. Read responses. Verify events."}</p>
        <div className="pgs-connection-actions">
          <a className="pgs-connection-start" href={pt ? "/pt-br/quickstart" : "/quickstart"}>
            {pt ? "Comece no Sandbox" : "Start in Sandbox"}<span aria-hidden="true"> →</span>
          </a>
          <button type="button" className="pgs-connection-replay pgs-brand-motion" hidden={still || failed || !ready} onClick={() => setPaused(value => !value)} aria-pressed={paused}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">{paused ? <path d="m5 3 7 5-7 5V3Z" /> : <path d="M4 3h3v10H4V3Zm5 0h3v10H9V3Z" />}</svg>
            {pt ? (paused ? "Retomar animação" : "Pausar animação") : (paused ? "Resume motion" : "Pause motion")}
          </button>
        </div>
      </div>
      <div className="pgs-brand-stage" ref={stageRef} data-motion={ready && !failed && !still ? "loop" : "still"} aria-hidden="true">
        <div className="pgs-brand-shadow" />
        <div className="pgs-brand-position">
          <div className="pgs-brand-object" data-ready={ready ? "true" : "false"}>
            {(!ready || failed) && <img className="pgs-brand-fallback" src="/images/brand/pagsmile-mark.svg" width="48" height="48" alt="" />}
            {!failed && <>
              <img className="pgs-brand-still" src={asset} width="1254" height="1254" alt="" draggable="false" decoding="async"
                onLoad={() => setReady(true)} onError={() => setFailed(true)} />
              {ready && <span className="pgs-brand-sheen" />}
            </>}
          </div>
        </div>
      </div>
    </section>
  );
};
