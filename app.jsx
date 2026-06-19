// ─────────────────────────────────────────────────────────────
// GG · Deep Sea — full standalone implementation.
// Renders <window.DirectionDeepSea />: dark blue/teal/purple
// animated aurora with floating PM glyphs and a frosted-glass
// chat card in the center.
// ─────────────────────────────────────────────────────────────

// ─────────── PM glyph overlay ───────────
function PMOverlay({ tint = "rgba(255,255,255,0.95)" }) {
  const getScale = () => {
    if (typeof window === "undefined") return 1;
    const raw = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
    return Math.max(0.6, Math.min(raw, 1.4)); // clamp so it never shrinks/grows too far
  };
  const [scale, setScale] = React.useState(getScale);
  React.useEffect(() => {
    function update() { setScale(getScale()); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return (
    <div aria-hidden style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      zIndex: 0, color: tint, overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 1440, height: 900,
        transformOrigin: "center center",
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}>
      {PM_ITEMS.map((it, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${it.x}%`, top: `${it.y}%`,
          width: it.size, height: it.size * (it.ar || 0.72),
          transform: `translate(-50%, -50%) rotate(${it.rot || 0}deg)`,
          opacity: it.op || 0.22,
          animation: `pmDrift${i % 4} ${24 + (i % 6) * 4}s ease-in-out ${i * 0.4}s infinite alternate`,
          filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.4))",
        }}>
          <PMGlyph kind={it.kind} val={it.val} />
        </div>
      ))}
      <style>{`
        @keyframes pmDrift0 { from { transform: translate(-50%, -50%) translate(0,0) } to { transform: translate(-50%, -50%) translate(8px, -10px) } }
        @keyframes pmDrift1 { from { transform: translate(-50%, -50%) translate(0,0) } to { transform: translate(-50%, -50%) translate(-6px, 8px) } }
        @keyframes pmDrift2 { from { transform: translate(-50%, -50%) translate(0,0) } to { transform: translate(-50%, -50%) translate(10px, 6px) } }
        @keyframes pmDrift3 { from { transform: translate(-50%, -50%) translate(0,0) } to { transform: translate(-50%, -50%) translate(-8px, -10px) } }
      `}</style>
      </div>
    </div>
  );
}

const PM_ITEMS = [
  { x: 8,  y: 12, kind: "bars",     size: 150, rot: -4,  op: 0.55 },
  { x: 22, y: 32, kind: "line",     size: 220, rot: 0,   op: 0.5 },
  { x: 91, y: 14, kind: "donut",    size: 130, rot: 0,   op: 0.6, val: 100 },
  { x: 80, y: 30, kind: "target",   size: 150, rot: 0,   op: 0.5 },
  { x: 6,  y: 50, kind: "kanban",   size: 170, ar: 0.7, rot: -3, op: 0.55 },
  { x: 93, y: 52, kind: "gantt",    size: 200, ar: 0.55, rot: 2, op: 0.55 },
  { x: 12, y: 76, kind: "funnel",   size: 130, ar: 1.0, rot: 0,  op: 0.55 },
  { x: 30, y: 90, kind: "burndown", size: 220, ar: 0.55, rot: 0, op: 0.5 },
  { x: 70, y: 88, kind: "checklist",size: 170, ar: 0.7,  rot: 3, op: 0.55 },
  { x: 50, y: 6,  kind: "roadmap",  size: 320, ar: 0.18, rot: 0,  op: 0.5 },
  { x: 4,  y: 92, kind: "sticky",   size: 80,  ar: 1.0, rot: -8,  op: 0.6 },
  { x: 15, y: 14, kind: "donut",    size: 90,  rot: 0,   op: 0.45, val: 88 },
  { x: 38, y: 14, kind: "donut",    size: 90,  rot: 0,   op: 0.45, val: 64 },
  { x: 60, y: 18, kind: "bars",     size: 100, rot: 3,   op: 0.45 },
  { x: 82, y: 64, kind: "checklist",size: 130, ar: 0.7,  rot: -3, op: 0.5 },
  { x: 50, y: 80, kind: "line",     size: 240, rot: 0,   op: 0.42 },
];

function PMGlyph({ kind, val }) {
  switch (kind) {
    case "bars": return (
      <svg viewBox="0 0 60 40" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2">
        <line x1="2" y1="38" x2="58" y2="38" />
        <line x1="2" y1="38" x2="2" y2="6" />
        <rect x="8"  y="24" width="8" height="14" fill="currentColor" fillOpacity="0.35" />
        <rect x="20" y="16" width="8" height="22" fill="currentColor" fillOpacity="0.55" />
        <rect x="32" y="22" width="8" height="16" fill="currentColor" fillOpacity="0.45" />
        <rect x="44" y="10" width="8" height="28" fill="currentColor" fillOpacity="0.75" />
      </svg>
    );
    case "line": return (
      <svg viewBox="0 0 100 60" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
        {[10,20,30,40,50].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} opacity="0.15" />)}
        <polyline points="2,46 14,40 26,42 38,28 50,32 62,18 74,22 86,10 98,14" strokeWidth="1.6" />
        <circle cx="50" cy="32" r="2" fill="currentColor" />
        <circle cx="86" cy="10" r="2" fill="currentColor" />
      </svg>
    );
    case "donut": {
      const pct = typeof val === "number" ? val : 72;
      const circ = 2 * Math.PI * 22; // ≈ 138.2
      const filled = (pct / 100) * circ;
      return (
        <svg viewBox="0 0 60 60" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="6">
          <circle cx="30" cy="30" r="22" opacity="0.25" />
          <circle cx="30" cy="30" r="22" strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" transform="rotate(-90 30 30)" />
          <text x="30" y="34" textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="currentColor" stroke="none" fontWeight="600">{pct}%</text>
        </svg>
      );
    }
    case "target": return (
      <svg viewBox="0 0 60 60" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="30" cy="30" r="26" opacity="0.4" />
        <circle cx="30" cy="30" r="18" opacity="0.55" />
        <circle cx="30" cy="30" r="10" opacity="0.7" />
        <circle cx="30" cy="30" r="3" fill="currentColor" stroke="none" />
        <line x1="30" y1="2"  x2="30" y2="10" />
        <line x1="30" y1="50" x2="30" y2="58" />
        <line x1="2"  y1="30" x2="10" y2="30" />
        <line x1="50" y1="30" x2="58" y2="30" />
      </svg>
    );
    case "kanban": return (
      <svg viewBox="0 0 80 56" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
        {[2, 28, 54].map((x, ci) => (
          <g key={ci}>
            <rect x={x} y="2" width="24" height="52" rx="2" opacity="0.3" />
            <line x1={x} y1="10" x2={x+24} y2="10" opacity="0.25" />
          </g>
        ))}
        <rect x="4"  y="14" width="20" height="6" fill="currentColor" fillOpacity="0.7" stroke="none" />
        <rect x="4"  y="22" width="20" height="6" fill="currentColor" fillOpacity="0.45" stroke="none" />
        <rect x="30" y="14" width="20" height="6" fill="currentColor" fillOpacity="0.85" stroke="none" />
        <rect x="30" y="22" width="20" height="6" fill="currentColor" fillOpacity="0.45" stroke="none" />
        <rect x="56" y="14" width="20" height="6" fill="currentColor" fillOpacity="0.5" stroke="none" />
      </svg>
    );
    case "gantt": return (
      <svg viewBox="0 0 100 56" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="0.8">
        {[8, 18, 28, 38, 48].map((y) => (
          <line key={y} x1="22" y1={y} x2="98" y2={y} opacity="0.15" />
        ))}
        <line x1="22" y1="4" x2="22" y2="52" opacity="0.4" />
        <text x="2" y="11" fontSize="6" fill="currentColor" stroke="none" opacity="0.55">Plan</text>
        <text x="2" y="21" fontSize="6" fill="currentColor" stroke="none" opacity="0.55">Build</text>
        <text x="2" y="31" fontSize="6" fill="currentColor" stroke="none" opacity="0.55">Test</text>
        <text x="2" y="41" fontSize="6" fill="currentColor" stroke="none" opacity="0.55">Ship</text>
        <rect x="24" y="6"  width="28" height="6" rx="2" fill="currentColor" fillOpacity="0.55" stroke="none" />
        <rect x="34" y="16" width="40" height="6" rx="2" fill="currentColor" fillOpacity="0.7" stroke="none" />
        <rect x="56" y="26" width="22" height="6" rx="2" fill="currentColor" fillOpacity="0.5" stroke="none" />
        <rect x="74" y="36" width="22" height="6" rx="2" fill="currentColor" fillOpacity="0.85" stroke="none" />
      </svg>
    );
    case "funnel": return (
      <svg viewBox="0 0 60 60" width="100%" height="100%" fill="currentColor" stroke="none">
        <polygon points="2,4 58,4 50,18 10,18" opacity="0.7" />
        <polygon points="10,22 50,22 44,34 16,34" opacity="0.55" />
        <polygon points="16,38 44,38 40,48 20,48" opacity="0.4" />
        <polygon points="20,52 40,52 36,58 24,58" opacity="0.25" />
      </svg>
    );
    case "burndown": return (
      <svg viewBox="0 0 100 56" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
        <line x1="6" y1="50" x2="98" y2="50" opacity="0.4" />
        <line x1="6" y1="6"  x2="6"  y2="50" opacity="0.4" />
        <line x1="6" y1="8" x2="98" y2="48" strokeDasharray="3 3" opacity="0.5" />
        <polyline points="6,10 18,14 30,18 42,30 54,28 66,38 78,40 90,46 98,50" strokeWidth="1.6" />
        <text x="10" y="6" fontSize="6" fill="currentColor" stroke="none" opacity="0.55">SPRINT BURNDOWN</text>
      </svg>
    );
    case "checklist": return (
      <svg viewBox="0 0 80 56" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2">
        {[
          { y: 8, checked: true },
          { y: 22, checked: true },
          { y: 36, checked: false },
          { y: 50, checked: false },
        ].map((row, i) => (
          <g key={i}>
            <rect x="4" y={row.y - 5} width="10" height="10" rx="2" opacity="0.65" />
            {row.checked && <polyline points={`6,${row.y} 8,${row.y + 2} 12,${row.y - 2}`} strokeWidth="1.4" />}
            <line x1="20" y1={row.y} x2="74" y2={row.y} strokeWidth="1" opacity={row.checked ? 0.4 : 0.75} />
          </g>
        ))}
      </svg>
    );
    case "ticket": return (
      <svg viewBox="0 0 90 60" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="84" height="54" rx="6" opacity="0.5" />
        <text x="9" y="14" fontSize="6" fill="currentColor" stroke="none" opacity="0.6">PRA-247</text>
        <text x="9" y="28" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">Onboarding redesign</text>
        <rect x="9" y="38" width="22" height="9" rx="4.5" fill="currentColor" fillOpacity="0.85" stroke="none" />
        <circle cx="76" cy="42" r="6" opacity="0.6" />
        <text x="76" y="44" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none" opacity="0.85">P</text>
      </svg>
    );
    case "roadmap": return (
      <svg viewBox="0 0 280 50" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
        <line x1="10" y1="25" x2="270" y2="25" strokeDasharray="4 4" opacity="0.45" />
        {[40, 100, 160, 220].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy="25" r="4" fill="currentColor" stroke="none" opacity="0.85" />
            <text x={x} y="12" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" opacity="0.6">Q{i+1}</text>
            <text x={x} y="42" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" opacity="0.55">{["plan","build","ship","scale"][i]}</text>
          </g>
        ))}
        <polygon points="266,21 274,25 266,29" fill="currentColor" stroke="none" />
      </svg>
    );
    case "sprintbar": return (
      <svg viewBox="0 0 320 30" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
        <text x="2" y="9" fontSize="6" fill="currentColor" stroke="none" opacity="0.55">SPRINT 14 · 68%</text>
        <rect x="2" y="14" width="316" height="8" rx="4" opacity="0.35" />
        <rect x="2" y="14" width="215" height="8" rx="4" fill="currentColor" fillOpacity="0.8" stroke="none" />
      </svg>
    );
    case "sticky": return (
      <svg viewBox="0 0 60 60" width="100%" height="100%" fill="currentColor" stroke="none">
        <rect x="2" y="2" width="56" height="56" rx="2" opacity="0.7" />
        <line x1="8" y1="14" x2="46" y2="14" stroke="rgba(0,0,0,0.55)" strokeWidth="1.4" />
        <line x1="8" y1="24" x2="50" y2="24" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" />
        <line x1="8" y1="34" x2="38" y2="34" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" />
        <line x1="8" y1="44" x2="42" y2="44" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" />
      </svg>
    );
    case "pillrow": return (
      <svg viewBox="0 0 140 40" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="2"  y="10" width="38" height="20" rx="10" fill="currentColor" fillOpacity="0.75" stroke="none" />
        <text x="21" y="24" textAnchor="middle" fontSize="8" fill="rgba(0,0,0,0.65)" stroke="none" fontWeight="700">SHIP</text>
        <rect x="46" y="10" width="42" height="20" rx="10" opacity="0.5" />
        <text x="67" y="24" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" opacity="0.9">REVIEW</text>
        <rect x="94" y="10" width="42" height="20" rx="10" opacity="0.35" />
        <text x="115" y="24" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" opacity="0.75">TODO</text>
      </svg>
    );
    default: return null;
  }
}

// ─────────── Email capture widget ───────────
function EmailCapture({ onSaved }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState("idle"); // idle|saving|saved|error
  const submit = async (e) => {
    e.preventDefault();
    if (!window.isValidEmail(email)) { setStatus("invalid"); return; }
    setStatus("saving");
    const ok = await window.saveEmail(email);
    setStatus(ok ? "saved" : "error");
    if (ok) onSaved && onSaved();
  };
  if (status === "saved") return (
    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, fontSize: 13, color: "#86efac" }}>
      ✓ Got it! Pratham will reach out when the bot is back.
    </div>
  );
  return (
    <form onSubmit={submit} style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" type="email"
          style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 12px", color: "#f1f3fb", fontFamily: "inherit", fontSize: 13, outline: "none" }} />
        <button type="submit" disabled={status === "saving"} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 14px", color: "#f1f3fb", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
          {status === "saving" ? "…" : "Notify me"}
        </button>
      </div>
      {status === "invalid" && <p style={{ color: "#fca5a5", fontSize: 12, marginTop: 5 }}>Please enter a valid email.</p>}
      {status === "error" && <p style={{ color: "#fca5a5", fontSize: 12, marginTop: 5 }}>Couldn't save — please try again.</p>}
    </form>
  );
}

// ─────────── Feedback modal ───────────
function FeedbackModal({ gradientText, onClose }) {
  const [rating, setRating] = React.useState("👍 Helpful");
  const [comment, setComment] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  const submit = async (e) => {
    e.preventDefault();
    if (email && !window.isValidEmail(email)) { setStatus("invalid_email"); return; }
    setStatus("saving");
    const ok = await window.saveFeedback(rating, comment, email);
    setStatus(ok ? "saved" : "error");
  };
  const btnGrad = `linear-gradient(135deg, ${gradientText[0]}, ${gradientText[1] || gradientText[0]})`;
  if (status === "saved") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "rgba(15,16,26,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "32px", maxWidth: 380, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🙏</div>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Thank you!</div>
        <div style={{ fontSize: 14, color: "rgba(241,243,251,0.6)", marginBottom: 20 }}>Pratham really appreciates your feedback.</div>
        <button onClick={onClose} style={{ background: btnGrad, border: "none", borderRadius: 10, padding: "10px 24px", color: "#0a0a0f", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "rgba(15,16,26,0.97)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "28px", maxWidth: 400, width: "90%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>How was your experience?</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(241,243,251,0.5)", fontSize: 20, cursor: "pointer", padding: "0 4px" }}>×</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["👍 Helpful", "👎 Not helpful"].map(r => (
              <button type="button" key={r} onClick={() => setRating(r)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${rating === r ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`, background: rating === r ? "rgba(255,255,255,0.12)" : "transparent", color: "#f1f3fb", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>{r}</button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Any comments? (optional)" rows={3}
            style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 12px", color: "#f1f3fb", fontFamily: "inherit", fontSize: 13, outline: "none", resize: "none", marginBottom: 10 }} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email (optional)" type="email"
            style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 12px", color: "#f1f3fb", fontFamily: "inherit", fontSize: 13, outline: "none", marginBottom: 10 }} />
          {status === "invalid_email" && <p style={{ color: "#fca5a5", fontSize: 12, marginBottom: 8 }}>Please enter a valid email or leave it blank.</p>}
          {status === "error" && <p style={{ color: "#fca5a5", fontSize: 12, marginBottom: 8 }}>Couldn't submit — please try again.</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={status === "saving"} style={{ flex: 1, background: btnGrad, border: "none", borderRadius: 10, padding: "11px", color: "#0a0a0f", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {status === "saving" ? "Submitting…" : "Submit feedback"}
            </button>
            <button type="button" onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 16px", color: "#f1f3fb", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────── Aurora layout (glass card + bg + send pill) ───────────
function AuroraLayout({
  base = "#06070d",
  gradientText = ["#ff9ee6", "#9eb6ff", "#9eedff"],
  topLabel = "Pratham.ai",
  greeting,
  renderBackground,
  sendButtonGradient,
}) {
  const {
    messages, chips, pending, errorKind, emailSaved, setEmailSaved,
    feedbackOpen, setFeedbackOpen, feedbackSaved, setFeedbackSaved,
    limitReached, send, reset,
  } = window.useChat();
  const [input, setInput] = React.useState("");
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });
  const [pulseKey, setPulseKey] = React.useState(0);
  const rootRef = React.useRef(null);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  const onMove = (e) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    send(input); setInput(""); setPulseKey((k) => k + 1);
  };

  const sendChip = (text) => { send(text); setPulseKey(k => k + 1); };

  const buttonGradient = sendButtonGradient || `linear-gradient(135deg, ${gradientText[0]}, ${gradientText[1] || gradientText[0]})`;

  return (
    <div ref={rootRef} onMouseMove={onMove} style={{
      width: "100%", height: "100%", background: base,
      color: "#f1f3fb", fontFamily: '"Inter", system-ui, sans-serif',
      position: "relative", overflow: "hidden",
    }}>
      {renderBackground({ mouse, pulseKey, pending })}

      {/* Feedback modal */}
      {feedbackOpen && (
        <FeedbackModal gradientText={gradientText} onClose={() => setFeedbackOpen(false)} />
      )}

      {/* Grain */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        opacity: 0.32, mixBlendMode: "overlay",
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.35'/></svg>\")",
      }} />

      {/* Vignette */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px", fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "rgba(241,243,251,0.6)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#fff", boxShadow: "0 0 10px #fff" }} />
          <span style={{ textTransform: "none", letterSpacing: "0.05em", fontSize: 13, fontWeight: 500 }}>{topLabel}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/Pratham_Jain_Resume.pdf" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 16px", color: "rgba(241,243,251,0.85)", cursor: "pointer", fontFamily: '"JetBrains Mono",monospace', fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", display: "inline-block" }}>Resume</a>
          <button onClick={() => setFeedbackOpen(true)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 16px", color: "rgba(241,243,251,0.85)", cursor: "pointer", fontFamily: '"JetBrains Mono",monospace', fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>Feedback</button>
          <button onClick={reset} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 16px", color: "rgba(241,243,251,0.85)", cursor: "pointer", fontFamily: '"JetBrains Mono",monospace', fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>Reset Chat</button>
        </span>
      </div>

      {/* Center glass card */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2, padding: "80px 40px",
      }}>
        <div style={{
          width: "min(640px, 100%)", maxHeight: "calc(100% - 40px)",
          background: "rgba(15,16,26,0.45)",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 28,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {messages.length === 0 ? (
            <div style={{ padding: "40px 36px 28px" }}>
              <div style={{
                fontSize: 38, fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.1,
                marginBottom: 12,
              }}>
                {greeting}
              </div>
              <div style={{ fontSize: 15, color: "rgba(241,243,251,0.6)", marginBottom: 24, lineHeight: 1.5 }}>
                I&apos;d be happy to tell you about his education, work experience, or any other aspect of his professional journey. What would you like to know?
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                {window.SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => sendChip(q)} style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "#f1f3fb", padding: "8px 14px", borderRadius: 99,
                    fontFamily: "inherit", fontSize: 13, cursor: "pointer",
                    transition: "all 200ms",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >{q}</button>
                ))}
              </div>
            </div>
          ) : (
            <div ref={scrollRef} style={{ padding: "28px 28px 8px", overflowY: "auto", flex: 1, maxHeight: 480 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}>
                  <div style={{
                    maxWidth: "82%", padding: "11px 16px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: m.role === "user"
                      ? `linear-gradient(135deg, ${gradientText[0]}1f, ${(gradientText[1] || gradientText[0])}1f)`
                      : "rgba(255,255,255,0.06)",
                    border: m.role === "user" ? `1px solid ${gradientText[0]}4d` : "1px solid rgba(255,255,255,0.08)",
                    fontSize: 15, lineHeight: 1.55, whiteSpace: "pre-wrap",
                  }}>
                    {m.thinking ? <AuroraDots colors={gradientText} /> : m.content}
                  </div>
                </div>
              ))}

              {/* Email capture on unavailable error */}
              {errorKind === "unavailable" && !emailSaved && (
                <EmailCapture onSaved={() => setEmailSaved(true)} />
              )}

              {/* Follow-up chips */}
              {chips.length > 0 && !pending && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4, marginBottom: 8 }}>
                  {chips.map((c, i) => (
                    <button key={i} onClick={() => sendChip(c)} style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(241,243,251,0.8)", padding: "6px 12px", borderRadius: 99,
                      fontFamily: "inherit", fontSize: 13, cursor: "pointer", transition: "all 200ms",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >→ {c}</button>
                  ))}
                </div>
              )}

              {/* Message limit */}
              {limitReached && (
                <div style={{ textAlign: "center", padding: "12px", fontSize: 13, color: "rgba(241,243,251,0.5)", background: "rgba(255,255,255,0.04)", borderRadius: 12, marginTop: 8 }}>
                  Message limit reached · click <strong>Reset</strong> to start a new conversation
                </div>
              )}
            </div>
          )}

          <form onSubmit={submit} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 12px 12px 22px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={limitReached ? "Click Reset to continue…" : "Type your message…"}
              disabled={pending || limitReached}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#f1f3fb", fontFamily: "inherit", fontSize: 15, padding: "10px 0",
              }} />
            <button type="submit" disabled={pending || !input.trim() || limitReached} style={{
              width: 40, height: 40, borderRadius: 99, border: "none",
              background: input.trim() && !pending && !limitReached ? buttonGradient : "rgba(255,255,255,0.08)",
              color: input.trim() && !pending && !limitReached ? "#1a1024" : "rgba(255,255,255,0.4)",
              cursor: input.trim() && !pending && !limitReached ? "pointer" : "default",
              fontSize: 18, fontWeight: 600,
            }}>↑</button>
          </form>

          {/* Disclaimer */}
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(241,243,251,0.25)", padding: "6px 16px 12px", fontFamily: '"JetBrains Mono",monospace' }}>
            Pratham.ai can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
}

function AuroraDots({ colors }) {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center", height: 18 }}>
      {[0,1,2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: 99,
          background: colors[i % colors.length],
          animation: `tdot 1.1s ease-in-out ${i*0.18}s infinite`,
        }} />
      ))}
    </span>
  );
}

function AuroraBlob({ color, size, x, y, anim, opacity = 0.7 }) {
  return (
    <div aria-hidden style={{
      position: "absolute", left: x, top: y, width: size, height: size,
      borderRadius: "50%", background: color, opacity,
      filter: "blur(120px)",
      transform: "translate(-50%,-50%)",
      animation: anim,
      transition: "left 1.2s ease-out, top 1.2s ease-out",
      pointerEvents: "none",
    }} />
  );
}

function SunPulse({ color }) {
  return (
    <div aria-hidden style={{
      position: "absolute", left: "50%", top: "50%", width: 600, height: 600,
      borderRadius: "50%", border: `1px solid ${color}88`,
      animation: "aPulse 1.4s ease-out forwards", pointerEvents: "none", zIndex: 3,
    }} />
  );
}

// ─────────── GG · Deep Sea ───────────
function DirectionDeepSea() {
  return (
    <AuroraLayout
      base="#04070d"
      gradientText={["#5ce1ff", "#5cbcff", "#a98cff"]}
      greeting={
        <>Hi there! I&apos;m <span style={{
          background: "linear-gradient(90deg, #a9eaff, #6db5ff, #b59eff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontStyle: "italic", fontWeight: 500,
        }}>Pratham.ai,</span> Pratham&apos;s personal AI assistant.</>
      }
      renderBackground={({ mouse, pulseKey }) => (
        <>
          <AuroraBlob color="#1a4a8c" size={820}
            x={`calc(${25 + (mouse.x - 0.5) * 5}%)`} y={`calc(${40 + (mouse.y - 0.5) * 5}%)`}
            anim="aFloat1 28s ease-in-out infinite" opacity={0.9} />
          <AuroraBlob color="#0a8aa6" size={680}
            x={`calc(${78 - (mouse.x - 0.5) * 6}%)`} y={`calc(${65 + (mouse.y - 0.5) * 4}%)`}
            anim="aFloat2 32s ease-in-out infinite" opacity={0.75} />
          <AuroraBlob color="#5b3a96" size={580}
            x={`calc(${55 + (mouse.x - 0.5) * 8}%)`} y={`calc(${20 - (mouse.y - 0.5) * 6}%)`}
            anim="aFloat3 30s ease-in-out infinite" opacity={0.7} />
          <AuroraBlob color="#0a1a30" size={620}
            x={`calc(${15 - (mouse.x - 0.5) * 4}%)`} y={`calc(${82 - (mouse.y - 0.5) * 4}%)`}
            anim="aFloat4 36s ease-in-out infinite" opacity={0.8} />
          {/* drifting bubbles */}
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} aria-hidden style={{
              position: "absolute",
              left: `${(i * 53) % 100}%`,
              bottom: -20,
              width: 4 + (i % 5) * 2, height: 4 + (i % 5) * 2,
              borderRadius: 99,
              background: "rgba(180,220,255,0.5)",
              boxShadow: "0 0 8px rgba(180,220,255,0.5)",
              animation: `bubbleRise ${12 + (i % 7) * 3}s linear ${i * 0.5}s infinite`,
            }} />
          ))}
          {pulseKey > 0 && <SunPulse key={pulseKey} color="#5ce1ff" />}
          <PMOverlay tint="rgba(210,235,255,0.95)" />
          <style>{`@keyframes bubbleRise { from { transform: translateY(0); opacity: 0 } 10% { opacity: 1 } 90% { opacity: 1 } to { transform: translateY(-120vh); opacity: 0 } }`}</style>
        </>
      )}
    />
  );
}

window.DirectionDeepSea = DirectionDeepSea;

// Mount once all babel scripts have executed.
ReactDOM.createRoot(document.getElementById("root")).render(<DirectionDeepSea />);
