/**
 * QuickPlay
 *
 * Tap a card anywhere in the app and its first episode plays straight
 * away in an overlay. No navigating into a detail view, no dead click.
 *
 * If a show genuinely has nothing to play, it says so and offers a way
 * forward rather than leaving the person with nothing.
 */

import { useState, useEffect } from "react";

const API_BASE = "https://podchat.wittyhub.co";
const token = () => { try { return localStorage.getItem("podchat_token"); } catch { return null; } };

export default function QuickPlay({ show, onClose, T, onGoStudio }) {
  const [eps, setEps] = useState(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!show?.id) return;
    let dead = false;
    setEps(null); setIdx(0);
    fetch(`${API_BASE}/api/shows/${show.id}`)
      .then(r => r.json())
      .then(d => { if (!dead) setEps(Array.isArray(d.episodes) ? d.episodes : []); })
      .catch(() => { if (!dead) setEps([]); });
    return () => { dead = true; };
  }, [show?.id]);

  // Count the play once we know what is playing.
  useEffect(() => {
    const ep = eps?.[idx];
    if (!ep) return;
    fetch(`${API_BASE}/api/episodes/${ep.id}/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
      body: JSON.stringify({ seconds: 0 }),
    }).catch(() => {});
  }, [eps, idx]);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!show) return null;

  const t1 = T?.t1 ?? "#EEF2F8", t2 = T?.t2 ?? "#8A93A6", t3 = T?.t3 ?? "#5B6478";
  const ep = eps?.[idx];
  const title = show.title || show.name || show.topic || "Show";
  const sub = show.host || show.specialty || show.category || "";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1400,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(8,10,14,0.94)", backdropFilter: "blur(24px)", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 760,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(175,200,240,0.20)",
          borderRadius: 22, overflow: "hidden",
          boxShadow: "0 32px 90px rgba(0,0,0,0.65)",
        }}
      >
        {/* header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid rgba(175,200,240,0.14)",
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </div>
            <div style={{ fontSize: 11.5, color: t2, marginTop: 2 }}>{sub}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 9,
              width: 30, height: 30, color: t1, fontSize: 15, cursor: "pointer", flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* body */}
        <div style={{ padding: 20 }}>
          {eps === null && (
            <div style={{ padding: "50px 0", textAlign: "center", color: t3, fontSize: 12.5 }}>
              Loading…
            </div>
          )}

          {eps && eps.length === 0 && (
            <div style={{ padding: "34px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🎙</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t1, marginBottom: 6 }}>
                Nothing published here yet
              </div>
              <p style={{ fontSize: 12, color: t2, lineHeight: 1.6, maxWidth: 340, margin: "0 auto 16px" }}>
                This channel is live and waiting for its creator. If it should be
                yours, claim it — or bring your own show to PodChat.
              </p>
              <button
                onClick={() => { onClose?.(); onGoStudio?.(); }}
                style={{
                  padding: "10px 20px", borderRadius: 11, border: "none",
                  background: "linear-gradient(135deg,#8FA8DE,#5A78C8)",
                  color: "#0D0F13", fontSize: 12.5, fontWeight: 800, cursor: "pointer",
                }}
              >Publish the first episode</button>
            </div>
          )}

          {ep && (
            <>
              {ep.media_kind === "video"
                ? <video key={ep.id} controls autoPlay src={ep.audio_url}
                         style={{ width: "100%", borderRadius: 14, background: "#000", maxHeight: "58vh" }} />
                : (
                  <div style={{
                    padding: "26px 20px", borderRadius: 14, textAlign: "center",
                    background: "linear-gradient(135deg,rgba(143,168,222,0.16),rgba(90,120,200,0.08))",
                  }}>
                    <div style={{ fontSize: 34, marginBottom: 12 }}>🎧</div>
                    <audio key={ep.id} controls autoPlay src={ep.audio_url}
                           style={{ width: "100%", height: 38 }} />
                  </div>
                )}

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: t1 }}>{ep.title}</div>
                {ep.description && (
                  <p style={{ fontSize: 11.5, color: t2, lineHeight: 1.6, marginTop: 5 }}>
                    {ep.description}
                  </p>
                )}
              </div>

              {eps.length > 1 && (
                <div style={{ marginTop: 18, borderTop: "1px solid rgba(175,200,240,0.14)", paddingTop: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: t2, letterSpacing: 1, marginBottom: 9 }}>
                    MORE FROM THIS SHOW
                  </div>
                  {eps.map((e, i) => i === idx ? null : (
                    <div key={e.id} onClick={() => setIdx(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 11px",
                        borderRadius: 10, cursor: "pointer", marginBottom: 6,
                        background: "rgba(255,255,255,0.04)",
                      }}>
                      <span style={{ fontSize: 12, color: t2 }}>▶</span>
                      <span style={{
                        fontSize: 12, color: t1, flex: 1, minWidth: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{e.title}</span>
                      <span style={{ fontSize: 10, color: t3 }}>
                        {e.media_kind === "video" ? "Video" : "Audio"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}