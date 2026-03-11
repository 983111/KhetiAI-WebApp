/**
 * agriService.ts
 * Frontend service layer — all AI calls go to the Cloudflare Worker.
 * Replace WORKER_URL with your deployed worker URL.
 */

const WORKER_URL = "https://agriintel-worker.vishwajeetadkine705.workers.dev"; // ← update after deploying

// ─── AI Assistant ──────────────────────────────────────────────────────────────

/**
 * Streams a response from the assistant and returns the full text.
 * Optionally pass an `onChunk` callback for real-time streaming UI updates.
 */
export async function askAgriAgent(
  message: string,
  context?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const res = await fetch(`${WORKER_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Chat request failed");
  }

  // SSE streaming
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta: string = parsed.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          fullText += delta;
          onChunk?.(delta);
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }

  return fullText;
}

// ─── Crop Disease Detection ────────────────────────────────────────────────────

export async function analyzeCropDisease(
  base64Image: string,
  mimeType: string
): Promise<string> {
  const res = await fetch(`${WORKER_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Analysis request failed");
  }

  const data = await res.json();
  return data.result ?? "Could not analyze the image.";
}

// ─── Market Price Forecast ─────────────────────────────────────────────────────

export async function getMarketForecast(crop: string): Promise<{
  currentPrice: number;
  trend: "up" | "down" | "stable";
  forecast: { month: string; price: number }[];
  analysis: string;
} | null> {
  const res = await fetch(`${WORKER_URL}/api/market`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ crop }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Market forecast request failed");
  }

  return res.json();
}
