/**
 * ComingSoon
 *
 * Shown when someone taps a feature that is not live yet. It says so
 * plainly, then points at something that does work — so the click leads
 * somewhere real instead of nowhere.
 *
 * Usage:
 *   const [soon, setSoon] = useState(null);
 *   <Btn onClick={()=>setSoon("live")}>Join Show</Btn>
 *   <ComingSoon topic={soon} onClose={()=>setSoon(null)} onNavigate={setPage}/>
 */

export const SOON = {
  live: {
    icon: "📡",
    title: "Live broadcasting is coming",
    body: "We are building live streaming properly — low latency, real audience chat, and simulcast to other platforms. It is not ready yet, and we would rather tell you than fake it.",
    ctaLabel: "Create your channel",
    ctaPage: "studio",
    note: "Channels created now go live the day broadcasting opens.",
  },
  translate: {
    icon: "🌐",
    title: "Translation is coming",
    body: "Automatic translation of your episodes into other languages is in development. When it lands, a show recorded in one language reaches audiences in nine more.",
    ctaLabel: "Upload an episode",
    ctaPage: "studio",
    note: "Episodes uploaded now will be first in the queue when translation opens.",
  },
  hotseat: {
    icon: "🔥",
    title: "Hot Seat is coming",
    body: "Live audience Q&A with real-time voting. It needs the live infrastructure we are building first.",
    ctaLabel: "Create your channel",
    ctaPage: "studio",
    note: null,
  },
  podwars: {
    icon: "⚔️",
    title: "Pod Wars is coming",
    body: "Two creators, one topic, the audience decides. A debate format built for live — which means it arrives with live broadcasting.",
    ctaLabel: "Create your channel",
    ctaPage: "studio",
    note: null,
  },
  simulcast: {
    icon: "📺",
    title: "Simulcast is coming",
    body: "Broadcast once, reach every platform at the same time. Arrives alongside live streaming.",
    ctaLabel: "Create your channel",
    ctaPage: "studio",
    note: null,
  },
  marketplace: {
    icon: "🤝",
    title: "The brand marketplace is coming",
    body: "Connecting creators with sponsors, with transparent rates and no middleman taking a cut in the dark. We are lining up brands now.",
    ctaLabel: "Create your channel",
    ctaPage: "studio",
    note: "Channels with published episodes get matched first.",
  },
  wallet: {
    icon: "💰",
    title: "Payouts are coming",
    body: "Earning from your audience is the whole point, and we are not shipping it until the money side is properly built and properly licensed.",
    ctaLabel: "Create your channel",
    ctaPage: "studio",
    note: "Build your audience now. Earnings apply from the day payouts open.",
  },
  analytics: {
    icon: "📊",
    title: "Full analytics are coming",
    body: "Real listener numbers, retention curves and geography. Play counts are already being recorded — the dashboard around them is next.",
    ctaLabel: "Upload an episode",
    ctaPage: "studio",
    note: "Plays are counted from your first episode onward.",
  },
  ai: {
    icon: "✨",
    title: "AI Studio is coming",
    body: "Automatic clips, show notes and titles from your episodes. In development.",
    ctaLabel: "Upload an episode",
    ctaPage: "studio",
    note: null,
  },
};

export default function ComingSoon({ topic, onClose, onNavigate, T }) {
  if (!topic) return null;
  const s = SOON[topic];
  if (!s) return null;

  const go = () => {
    onClose?.();
    if (s.ctaPage) onNavigate?.(s.ctaPage);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(13,15,19,0.90)", backdropFilter: "blur(20px)",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 26, padding: "38px 40px",
          maxWidth: 440, width: "100%",
          backdropFilter: "blur(40px) saturate(200%)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.20)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 14 }}>{s.icon}</div>

        <div style={{ fontSize: 20, fontWeight: 900, color: T?.t1 ?? "#EEF2F8", marginBottom: 12 }}>
          {s.title}
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.65, color: T?.t2 ?? "#8A93A6", marginBottom: 26 }}>
          {s.body}
        </p>

        <button
          onClick={go}
          style={{
            width: "100%", padding: "13px", borderRadius: 13, border: "none",
            background: "linear-gradient(135deg,#8FA8DE,#5A78C8)",
            color: "#0D0F13", fontSize: 14, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(90,120,200,0.30)",
          }}
        >
          {s.ctaLabel} →
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 10, padding: "11px", borderRadius: 13,
            border: "1px solid rgba(175,200,240,0.16)", background: "transparent",
            color: T?.t2 ?? "#8A93A6", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          Maybe later
        </button>

        {s.note && (
          <p style={{ fontSize: 11, color: T?.t3 ?? "#5B6478", marginTop: 16, lineHeight: 1.5 }}>
            {s.note}
          </p>
        )}
      </div>
    </div>
  );
}
