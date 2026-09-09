/**
 * EpisodeList
 *
 * Shows the real episodes attached to a show, and plays them. Audio gets
 * an audio element, video gets a video element. Play counts are recorded
 * against the database, so the numbers on the card are true.
 *
 * When a show has no episodes yet it says so plainly and invites the
 * person to publish the first one, rather than leaving an empty space.
 */

import { useState, useEffect } from "react";

const API_BASE = "https://podchat.wittyhub.co";
const token = () => { try { return localStorage.getItem("podchat_token"); } catch { return null; } };

const fmt = (s) => {
  if (!s) return "";
  const m = Math.floor(s / 60), r = Math.round(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

export default function EpisodeList({ showId, T, onNeedUpload }) {
  const [eps, setEps] = useState(null);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    if (!showId) return;
    let dead = false;
    fetch(`${API_BASE}/api/shows/${showId}`)
      .then(r => r.json())
      .then(d => { if (!dead) setEps(Array.isArray(d.episodes) ? d.episodes : []); })
      .catch(() => { if (!dead) setEps([]); });
    return () => { dead = true; };
  }, [showId]);

  const play = (ep) => {
    setPlaying(playing?.id === ep.id ? null : ep);
    // Counted server-side. Fire and forget — a failed count must never
    // stop playback.
    fetch(`${API_BASE}/api/episodes/${ep.id}/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
      body: JSON.stringify({ seconds: 0 }),
    }).catch(() => {});
  };

  const t1 = T?.t1 ?? "#EEF2F8", t2 = T?.t2 ?? "#8A93A6", t3 = T?.t3 ?? "#5B6478";

  if (eps === null) {
    return <div style={{ fontSize: 12, color: t3, padding: "16px 0" }}>Loading episodes…</div>;
  }

  if (!eps.length) {
    return (
      <div style={{
        padding: "26px 22px", borderRadius: 16, textAlign: "center",
        background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(175,200,240,0.22)",
      }}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>🎙</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t1, marginBottom: 5 }}>
          No episodes yet
        </div>
        <p style={{ fontSize: 11.5, color: t2, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 14px" }}>
          This show has not published anything yet. If it should be yours,
          claim it — or bring your own show to PodChat.
        </p>
        <button
          onClick={() => onNeedUpload && onNeedUpload()}
          style={{
            padding: "9px 18px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#8FA8DE,#5A78C8)",
            color: "#0D0F13", fontSize: 12, fontWeight: 800, cursor: "pointer",
          }}
        >
          Publish the first episode
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: t2, letterSpacing: 1, marginBottom: 10 }}>
        {eps.length} EPISODE{eps.length === 1 ? "" : "S"}
      </div>

      {eps.map((ep) => {
        const open = playing?.id === ep.id;
        return (
          <div key={ep.id} style={{
            marginBottom: 10, borderRadius: 14, overflow: "hidden",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${open ? "rgba(143,168,222,0.45)" : "rgba(175,200,240,0.14)"}`,
          }}>
            <div
              onClick={() => play(ep)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", cursor: "pointer" }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: open ? "linear-gradient(135deg,#8FA8DE,#5A78C8)" : "rgba(255,255,255,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: open ? "#0D0F13" : t1,
              }}>
                {open ? "❚❚" : "▶"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: t1,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {ep.title}
                </div>
                <div style={{ fontSize: 10.5, color: t3, marginTop: 2 }}>
                  {ep.media_kind === "video" ? "Video" : "Audio"}
                  {ep.duration_sec ? ` · ${fmt(ep.duration_sec)}` : ""}
                  {ep.plays ? ` · ${ep.plays} play${ep.plays === 1 ? "" : "s"}` : ""}
                </div>
              </div>
            </div>

            {open && ep.audio_url && (
              <div style={{ padding: "0 15px 15px" }}>
                {ep.description && (
                  <p style={{ fontSize: 11.5, color: t2, lineHeight: 1.6, marginBottom: 10 }}>
                    {ep.description}
                  </p>
                )}
                {ep.media_kind === "video"
                  ? <video controls autoPlay src={ep.audio_url}
                           style={{ width: "100%", borderRadius: 10, background: "#000" }} />
                  : <audio controls autoPlay src={ep.audio_url}
                           style={{ width: "100%", height: 36 }} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}