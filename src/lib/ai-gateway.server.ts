import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Shared Lovable AI Gateway provider helper (server-only).
 * Keeps LOVABLE_API_KEY out of the client bundle.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  const gateway = createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
    },
  });
  return (modelId: string) => gateway.chatModel(modelId);
}
