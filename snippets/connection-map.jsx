export const ConnectionMap = ({ lang = "en" }) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const motionRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const pt = lang === "pt";

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    let context;
    try {
      context = canvas.getContext("2d", { alpha: true });
    } catch (_) {
      return;
    }
    if (!context) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const tau = Math.PI * 2;
    const mint = "85, 232, 183";
    const ice = "166, 214, 236";
    const rings = [
      { radius: 211, tilt: 0.83, roll: -0.32, color: mint, speed: 0.29, phase: 0.8 },
      { radius: 171, tilt: -0.36, roll: 0.92, color: ice, speed: -0.19, phase: 3.3 },
      { radius: 249, tilt: 1.11, roll: -0.73, color: mint, speed: 0.16, phase: 4.8 },
    ];
    // Deterministic coordinates keep the initial illustration stable across mounts.
    const stars = Array.from({ length: 46 }, (_, i) => ({
      x: Math.sin(i * 127.1 + 2) * (145 + (i % 7) * 25),
      y: Math.cos(i * 91.7 + 1) * (98 + (i % 5) * 19),
      z: Math.sin(i * 51.3) * 160,
      radius: i % 6 === 0 ? 1.8 : 0.85,
    }));
    let width = 0;
    let height = 0;
    let scale = 1;
    let ratio = 1;
    let time = 0;
    let frame = 0;
    let lastFrame = 0;
    let disposed = false;
    let userPaused = false;
    let prefersStill = media.matches || saveData;
    let inView = typeof IntersectionObserver === "undefined";
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const project = (x, y, z) => {
      const yaw = -0.31 + pointer.x * 0.13;
      const pitch = 0.45 + pointer.y * 0.1;
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
      const rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
      const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
      const perspective = 800 / (800 + depth);
      return {
        x: width * 0.51 + rx * perspective * scale,
        y: height * 0.47 + ry * perspective * scale,
        z: depth,
        size: perspective * scale,
      };
    };
    const orbitPoint = (angle, ring, offset = 0) => {
      const radius = ring.radius + offset;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * Math.cos(ring.tilt);
      const z = Math.sin(angle) * radius * Math.sin(ring.tilt);
      return project(
        x * Math.cos(ring.roll) - y * Math.sin(ring.roll),
        x * Math.sin(ring.roll) + y * Math.cos(ring.roll),
        z,
      );
    };
    const line = (a, b, color, opacity, thickness = 1) => {
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.strokeStyle = "rgba(" + color + ", " + opacity + ")";
      context.lineWidth = thickness * scale;
      context.stroke();
    };
    const dot = (point, radius, color, opacity) => {
      context.beginPath();
      context.arc(point.x, point.y, Math.max(0.4, radius * point.size), 0, tau);
      context.fillStyle = "rgba(" + color + ", " + opacity + ")";
      context.fill();
    };
    const drawRing = (ring, front) => {
      const steps = width < 400 ? 64 : 88;
      const offsets = ring === rings[0] ? [-8, -4, 0, 4, 8] : [0];
      offsets.forEach((offset) => {
        for (let i = 0; i < steps; i += 1) {
          const a = orbitPoint((i / steps) * tau, ring, offset);
          const b = orbitPoint(((i + 1) / steps) * tau, ring, offset);
          if ((a.z < 0) !== front) continue;
          const alpha = offset === 0 ? (front ? 0.39 : 0.13) : (front ? 0.12 : 0.045);
          line(a, b, ring.color, alpha, offset === 0 ? 0.9 : 0.6);
        }
      });
      // Moving packets illustrate a flow; they never count live API traffic.
      for (let packet = 0; packet < 2; packet += 1) {
        const head = time * ring.speed + ring.phase + packet * Math.PI;
        const direction = Math.sign(ring.speed);
        for (let i = 0; i < 20; i += 1) {
          const angle = head - direction * i * 0.024;
          const a = orbitPoint(angle, ring);
          if ((a.z < 0) !== front) continue;
          const b = orbitPoint(angle - direction * 0.025, ring);
          line(a, b, ring.color, (1 - i / 20) * 0.8, 1.8 - i * 0.055);
        }
        const tip = orbitPoint(head, ring);
        if ((tip.z < 0) === front) {
          dot(tip, 8, ring.color, 0.06);
          dot(tip, 4.4, ring.color, 0.17);
          dot(tip, 1.9, "230, 255, 247", 0.95);
        }
      }
    };
    const drawCore = () => {
      const lift = Math.sin(time * 0.55) * 3.5;
      const face = (level, half, fill, stroke) => {
        const points = [
          project(-half, level + lift, -half),
          project(half, level + lift, -half),
          project(half, level + lift, half),
          project(-half, level + lift, half),
        ];
        context.beginPath();
        points.forEach((point, i) => i === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
        context.closePath();
        context.fillStyle = fill;
        context.fill();
        context.strokeStyle = stroke;
        context.lineWidth = scale;
        context.stroke();
        return points;
      };
      const bottom = face(34, 71, "rgba(9, 37, 54, .82)", "rgba(100, 194, 194, .19)");
      const middle = face(9, 71, "rgba(13, 57, 66, .80)", "rgba(99, 226, 181, .40)");
      for (let i = 0; i < 4; i += 1) line(bottom[i], middle[i], mint, 0.2, 0.7);
      const top = face(-22, 71, "rgba(15, 73, 74, .91)", "rgba(140, 255, 211, .75)");
      for (let i = 0; i < 4; i += 1) line(middle[i], top[i], mint, 0.38, 0.7);
      face(-23, 59, "rgba(43, 193, 150, .035)", "rgba(150, 255, 218, .12)");
      [-1, 1].forEach((direction) => {
        [-1, 1].forEach((side) => {
          const trace = [
            project(direction * 38, -24 + lift, side * 10),
            project(direction * 49, -24 + lift, side * 10),
            project(direction * 49, -24 + lift, side * 39),
            project(direction * 62, -24 + lift, side * 39),
          ];
          for (let i = 0; i < trace.length - 1; i += 1) line(trace[i], trace[i + 1], mint, 0.45, 0.8);
          dot(trace[3], 1.6, mint, 0.8);
        });
      });
      const mark = (coordinates) => {
        for (let i = 0; i < coordinates.length - 1; i += 1) {
          const a = coordinates[i];
          const b = coordinates[i + 1];
          line(project(a[0], -25 + lift, a[1]), project(b[0], -25 + lift, b[1]), "199, 255, 231", 0.96, 2.3);
        }
      };
      mark([[-17, -21], [-28, -21], [-28, 21], [-17, 21]]);
      mark([[17, -21], [28, -21], [28, 21], [17, 21]]);
      mark([[7, -18], [-7, 18]]);
    };
    const draw = () => {
      if (!width || !height || disposed) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const projectedStars = stars.map((star) => ({ ...project(star.x, star.y, star.z), radius: star.radius }));
      const starCount = width < 400 ? 28 : stars.length;
      for (let i = 0; i < starCount; i += 1) {
        const a = projectedStars[i];
        dot(a, a.radius, i % 3 === 0 ? mint : ice, 0.2 + (i % 4) * 0.11);
        if (i % 3 !== 0 || i + 5 >= starCount) continue;
        const b = projectedStars[i + 5];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 115 * scale) line(a, b, ice, 0.09, 0.6);
      }
      rings.forEach((ring) => drawRing(ring, false));
      drawCore();
      rings.forEach((ring) => drawRing(ring, true));
    };
    const canAnimate = () => !disposed && !userPaused && !prefersStill && inView && !document.hidden && width > 0;
    const tick = (timestamp) => {
      frame = 0;
      if (!canAnimate()) return;
      const interval = width < 400 ? 1000 / 24 : 1000 / 30;
      if (!lastFrame || timestamp - lastFrame >= interval) {
        const elapsed = lastFrame ? Math.min(timestamp - lastFrame, 80) / 1000 : 0;
        time += elapsed;
        pointer.x += (pointer.targetX - pointer.x) * 0.07;
        pointer.y += (pointer.targetY - pointer.y) * 0.07;
        draw();
        lastFrame = timestamp;
      }
      frame = window.requestAnimationFrame(tick);
    };
    const synchronize = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      if (canAnimate()) frame = window.requestAnimationFrame(tick);
    };
    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      width = Math.round(bounds.width);
      height = Math.round(bounds.height);
      scale = Math.min(width / 560, height / 405);
      ratio = Math.min(window.devicePixelRatio || 1, width < 400 ? 1.5 : 1.75);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      draw();
      synchronize();
    };
    const onPreference = () => {
      prefersStill = media.matches || saveData;
      setReducedMotion(prefersStill);
      if (prefersStill) {
        pointer.x = 0;
        pointer.y = 0;
        pointer.targetX = 0;
        pointer.targetY = 0;
        time = 0;
        draw();
      }
      synchronize();
    };
    const onPointer = (event) => {
      if (event.pointerType !== "mouse" || !canAnimate()) return;
      const bounds = stage.getBoundingClientRect();
      pointer.targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      pointer.targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    };
    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };
    motionRef.current = {
      setPaused(value) {
        userPaused = value;
        synchronize();
      },
    };
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    const intersectionObserver = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        synchronize();
      }, { threshold: 0.05 })
      : null;
    resizeObserver?.observe(stage);
    intersectionObserver?.observe(stage);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", synchronize);
    media.addEventListener("change", onPreference);
    stage.addEventListener("pointermove", onPointer, { passive: true });
    stage.addEventListener("pointerleave", resetPointer, { passive: true });
    onPreference();
    resize();
    setCanvasReady(true);

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", synchronize);
      media.removeEventListener("change", onPreference);
      stage.removeEventListener("pointermove", onPointer);
      stage.removeEventListener("pointerleave", resetPointer);
      motionRef.current = null;
    };
  }, []);

  useEffect(() => {
    motionRef.current?.setPaused(paused);
  }, [paused]);

  const motionLabel = !canvasReady || reducedMotion
    ? (pt ? "Visualização estática" : "Static view")
    : paused ? (pt ? "Retomar animação" : "Resume motion") : (pt ? "Pausar animação" : "Pause motion");

  return (
    <section className={`pgs-orbit-hero${canvasReady ? " pgs-orbit-ready" : ""}`} aria-label={pt ? "Sua conexão com a API" : "Your API connection"}>
      <div className="pgs-orbit-layout">
        <div className="pgs-orbit-copy">
          <span className="pgs-orbit-eyebrow"><span aria-hidden="true" />{pt ? "Da sua aplicação à Pagsmile" : "From your application to Pagsmile"}</span>
          <p className="pgs-orbit-title">
            {pt ? "Faça sua primeira " : "Make your first "}<span>{pt ? "requisição assinada." : "signed request."}</span>
          </p>
          <p className="pgs-orbit-description">{pt ? "Assine requisições. Leia respostas. Verifique eventos." : "Sign requests. Read responses. Verify events."}</p>
          <a className="pgs-orbit-start" href={pt ? "/pt-br/quickstart" : "/quickstart"}>
            {pt ? "Comece no Sandbox" : "Start in Sandbox"}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </a>
          <span className="pgs-orbit-environment">{pt ? "Explore a API no ambiente de testes." : "Explore the API in the test environment."}</span>
        </div>
        <div className="pgs-orbit-stage" ref={stageRef}>
          <div className="pgs-orbit-halo" aria-hidden="true" />
          <svg className="pgs-orbit-blueprint" viewBox="0 0 560 405" fill="none" aria-hidden="true">
            <g stroke="#64dcb6">
              <ellipse cx="286" cy="190" rx="229" ry="75" transform="rotate(-24 286 190)" opacity=".3" />
              <ellipse cx="286" cy="190" rx="220" ry="70" transform="rotate(-24 286 190)" opacity=".14" />
              <ellipse cx="286" cy="190" rx="185" ry="112" transform="rotate(48 286 190)" opacity=".18" />
              <ellipse cx="286" cy="190" rx="246" ry="48" transform="rotate(-49 286 190)" opacity=".17" />
              <path d="m212 200 95-48 69 56-94 49-70-57Zm0-25 95-48 69 56-94 49-70-57Zm0-25 95-48 69 56-94 49-70-57Z" fill="#123f49" fillOpacity=".75" opacity=".6" />
              <path d="m266 151-9 5 12 13 9-5m28-10 9-5-12-13-9 5m-8 5 6 16" strokeWidth="2" opacity=".8" />
            </g>
            <g fill="#b0f6dc"><circle cx="92" cy="237" r="2" /><circle cx="424" cy="78" r="2" /><circle cx="393" cy="312" r="2" /><circle cx="179" cy="82" r="1.5" /><circle cx="491" cy="220" r="1.5" /></g>
          </svg>
          <canvas className="pgs-orbit-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="pgs-orbit-label pgs-orbit-label-request" aria-hidden="true"><span>↗</span>{pt ? "Assine a requisição" : "Sign the request"}</div>
          <div className="pgs-orbit-label pgs-orbit-label-response" aria-hidden="true"><span>↙</span>{pt ? "Leia a resposta" : "Read the response"}</div>
          <div className="pgs-orbit-label pgs-orbit-label-event" aria-hidden="true"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="m3 8 3 3 7-7" /></svg>{pt ? "Verifique o evento" : "Verify the event"}</div>
          <div className="pgs-orbit-api" aria-hidden="true">Pagsmile API</div>
          <div className="pgs-orbit-toolbar">
            <span>{pt ? "Fluxo ilustrativo" : "Illustrative flow"}</span>
            <button type="button" className="pgs-orbit-motion" onClick={() => setPaused((value) => !value)} disabled={reducedMotion || !canvasReady} aria-pressed={paused || reducedMotion} aria-label={motionLabel}>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">{paused || reducedMotion || !canvasReady ? <path d="m5 3 7 5-7 5V3Z" /> : <path d="M4 3h3v10H4V3Zm5 0h3v10H9V3Z" />}</svg>
              {motionLabel}
            </button>
          </div>
          <span className="pgs-orbit-sr-only">{pt ? "Ilustração: sua aplicação envia requisições assinadas à Pagsmile API, recebe respostas e verifica callbacks de eventos." : "Illustration: your application sends signed requests to the Pagsmile API, receives responses and verifies event callbacks."}</span>
        </div>
      </div>
    </section>
  );
};
