import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3.7-flash";

/** Tolerant JSON extraction: strips code fences and finds the first JSON object. */
function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("The AI returned an unreadable response. Please try again.");
  }
}

/** Strip emoji and non-latin glyphs so generated copy renders cleanly everywhere. */
function clean(s: string): string {
  return s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

const clipSchema = z.object({
  showTitle: z.string().min(1),
  showDescription: z.string().default(""),
  episodeTopic: z.string().default(""),
});

export const generateClips = createServerFn({ method: "POST" })
  .inputValidator((data) => clipSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this workspace yet. Please try again shortly.");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway(MODEL),
      system:
        "You are PodChat Studio AI, an elite short-form producer for a global podcast network. " +
        "Given a show and an episode topic, return the 6 strongest short clips (15-60 seconds) for social media. " +
        'Respond with ONLY a JSON object, no markdown: {"clips":[{"title":"... (max 8 words, scroll-stopping)","hook":"... (spoken-style hook line, max 18 words)","start":"MM:SS","end":"MM:SS","virality":87,"caption":"... (1-2 sentences, plain text, NO emoji)"}]}. Use plain text only — absolutely no emoji anywhere. ' +
        "Timestamps must be plausible, in ascending order, inside a 45-minute episode. Vary virality between 55 and 99.",
      prompt: `Show: ${data.showTitle}\nShow description: ${data.showDescription || "n/a"}\nEpisode topic: ${data.episodeTopic || data.showDescription || "the latest episode"}`,
    });
    const parsed = z
      .object({
        clips: z.array(
          z.object({
            title: z.string(),
            hook: z.string(),
            start: z.string(),
            end: z.string(),
            virality: z.coerce.number(),
            caption: z.string(),
          })
        ),
      })
      .parse(extractJson(text));
    return {
      clips: parsed.clips.map((c) => ({
        ...c,
        title: clean(c.title),
        hook: clean(c.hook),
        caption: clean(c.caption),
      })),
    };
  });

const notesSchema = z.object({
  showTitle: z.string().min(1),
  showDescription: z.string().default(""),
  episodeTopic: z.string().default(""),
  durationMin: z.number().default(45),
});

export const generateShowNotes = createServerFn({ method: "POST" })
  .inputValidator((data) => notesSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this workspace yet. Please try again shortly.");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway(MODEL),
      system:
        "You are PodChat Studio AI, a senior podcast editor. Given a show, episode topic and duration, produce publishing-ready assets: 5 title options (max 70 chars each, varied angles), a 2-3 sentence episode description, 6-8 chapters in ascending order, 3 platform-ready social posts (each with 1-2 hashtags) and 6 space-separated hashtags. " +
        'Respond with ONLY a JSON object, no markdown: {"titles":["..."],"summary":"...","chapters":[{"time":"MM:SS","title":"..."}],"socialPosts":["..."],"hashtags":"..."}',
      prompt: `Show: ${data.showTitle}\nShow description: ${data.showDescription || "n/a"}\nEpisode topic: ${data.episodeTopic || data.showDescription || "the latest episode"}\nDuration: ${data.durationMin} minutes`,
    });
    const parsed = z
      .object({
        titles: z.array(z.string()),
        summary: z.string(),
        chapters: z.array(z.object({ time: z.string(), title: z.string() })),
        socialPosts: z.array(z.string()),
        hashtags: z.string(),
      })
      .parse(extractJson(text));
    return {
      titles: parsed.titles.map(clean),
      summary: clean(parsed.summary),
      chapters: parsed.chapters.map((ch) => ({ ...ch, title: clean(ch.title) })),
      socialPosts: parsed.socialPosts.map(clean),
      hashtags: parsed.hashtags.replace(/[^\w# ]/g, "").replace(/\s{2,}/g, " ").trim(),
    };
  });
