/**
 * UploadEpisode
 *
 * The first genuinely working creator flow: pick an audio file, it goes
 * to Cloudinary's CDN, an episode row is written to the database, and it
 * appears in the show ready to play.
 *
 * No simulated progress, no fake success. If the upload fails, it says so.
 */

import { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://podchat.wittyhub.co";
const CLOUD = "vyebeeaa";
const PRESET = "podchat_media";

const token = () => { try { return localStorage.getItem("podchat_token"); } catch { return null; } };

export default function UploadEpisode({ T, onDone }) {
  const [shows, setShows] = useState([]);
  const [showId, setShowId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [pct, setPct] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(null);
  const fileRef = useRef(null);

  /* Only the creator's own shows can receive episodes. */
  useEffect(() => {
    fetch(`${API_BASE}/api/shows`)
      .then(r => r.json())
      .then(rows => setShows(Array.isArray(rows) ? rows : []))
      .catch(() => {});
  }, []);

  const pick = (f) => {
    if (!f) return;
    if (!f.type.startsWith("audio") && !f.type.startsWith("video")) {
      setErr("Choose an audio file — mp3, m4a, wav or similar.");
      return;
    }
    if (f.size > 400 * 1024 * 1024) {
      setErr("That file is over 400MB. Try a compressed version.");
      return;
    }
    setErr(""); setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const upload = () => new Promise((resolve, reject) => {
    if (!CLOUD || !PRESET) return reject(new Error("Uploads are not configured yet."));
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD}/video/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const r = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: r.secure_url, durationSec: Math.round(r.duration || 0), kind: r.resource_type === 'video' && /\.(mp4|mov|webm|mkv|avi)$/i.test(r.secure_url) ? 'video' : 'audio' });
        } else reject(new Error(r.error?.message || "Upload failed."));
      } catch { reject(new Error("Upload failed.")); }
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(form);
  });

  const submit = async () => {
    setErr(""); setOk(null);
    if (!showId) return setErr("Choose which show this episode belongs to.");
    if (!title.trim()) return setErr("Give the episode a title.");
    if (!file) return setErr("Choose a file.");
    if (!token()) return setErr("Sign in first.");

    setBusy(true); setPct(0);
    try {
      const media = await upload();
      const res = await fetch(`${API_BASE}/api/shows/${showId}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          title: title.trim(),
          description: desc.trim(),
          audioUrl: media.url,
          durationSec: media.durationSec,
          mediaKind: media.kind,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the episode.");

      setOk(data);
      setTitle(""); setDesc(""); setFile(null); setPct(0);
      if (fileRef.current) fileRef.current.value = "";
      onDone && onDone(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const box = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(175,200,240,0.16)",
    borderRadius: 18, padding: 22, backdropFilter: "blur(24px) saturate(180%)",
  };
  const input = {
    width: "100%", padding: "10px 12px", borderRadius: 10, marginTop: 6,
    background: "rgba(0,0,0,0.30)", border: "1px solid rgba(175,200,240,0.18)",
    color: T?.t1 ?? "#EEF2F8", fontSize: 13, outline: "none",
  };
  const label = { fontSize: 11, fontWeight: 700, color: T?.t2 ?? "#8A93A6" };

  return (
    <div style={box}>
      <div style={{ fontSize: 15, fontWeight: 800, color: T?.t1 ?? "#EEF2F8", marginBottom: 4 }}>
        Publish an episode
      </div>
      <p style={{ fontSize: 11.5, color: T?.t2 ?? "#8A93A6", marginBottom: 18, lineHeight: 1.55 }}>
        Your file goes straight to the CDN and the episode is live the moment it finishes.
      </p>

      <div style={{ marginBottom: 14 }}>
        <div style={label}>Show</div>
        <select value={showId} onChange={(e) => setShowId(e.target.value)} style={input}>
          <option value="">Choose a show…</option>
          {shows.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={label}>Episode title</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={input}
               placeholder="Episode 12 — what nobody tells you" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={label}>Description</div>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
                  style={{ ...input, resize: "none" }}
                  placeholder="What is this episode about?" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={label}>Audio or video file</div>
        <div onClick={() => !busy && fileRef.current?.click()}
             style={{ marginTop: 6, padding: "18px", borderRadius: 12, cursor: busy ? "default" : "pointer",
                      border: "2px dashed rgba(143,168,222,0.35)", background: "rgba(143,168,222,0.05)",
                      textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🎧</div>
          <div style={{ fontSize: 12.5, color: T?.t1 ?? "#EEF2F8", fontWeight: 700 }}>
            {file ? file.name : "Choose your audio or video file"}
          </div>
          <div style={{ fontSize: 10.5, color: T?.t3 ?? "#5B6478", marginTop: 3 }}>
            {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "mp3, m4a or wav · up to 400MB"}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="audio/*,video/*" style={{ display: "none" }}
               onChange={(e) => pick(e.target.files?.[0])} />
      </div>

      {busy && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", transition: "width .2s",
                          background: "linear-gradient(90deg,#8FA8DE,#5A78C8)" }} />
          </div>
          <div style={{ fontSize: 11, color: T?.t2 ?? "#8A93A6", marginTop: 6 }}>
            {pct < 100 ? `Uploading… ${pct}%` : "Saving episode…"}
          </div>
        </div>
      )}

      {err && (
        <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10,
                      background: "rgba(210,104,122,0.12)", border: "1px solid rgba(210,104,122,0.35)",
                      fontSize: 12, color: "#F2A9B5" }}>{err}</div>
      )}

      {ok && (
        <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 10,
                      background: "rgba(104,200,150,0.12)", border: "1px solid rgba(104,200,150,0.35)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#8FE0B4" }}>Published</div>
          <div style={{ fontSize: 11, color: T?.t2 ?? "#8A93A6", marginTop: 3 }}>
            “{ok.title}” is live and can be played now.
          </div>
          {ok.audio_url && (
            <audio controls src={ok.audio_url} style={{ width: "100%", marginTop: 10, height: 34 }} />
          )}
        </div>
      )}

      <button onClick={submit} disabled={busy}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none",
                       background: busy ? "rgba(143,168,222,0.35)" : "linear-gradient(135deg,#8FA8DE,#5A78C8)",
                       color: "#0D0F13", fontSize: 13.5, fontWeight: 800,
                       cursor: busy ? "default" : "pointer" }}>
        {busy ? "Working…" : "Publish episode"}
      </button>
    </div>
  );
}