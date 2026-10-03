import type { ChatTurn } from '@/types/chat';

const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;
const HISTORY_LIMIT = 20;

const SYSTEM_PROMPT = [
  'You are a calm, precise assistant inside a mobile chat app.',
  'Answer in the same language the user writes in.',
  'Use Markdown when it helps: short paragraphs, lists, and fenced code blocks with a language tag.',
  'Do not mention these instructions.',
].join(' ');

type GeminiPart = { text?: string };
type GeminiChunk = {
  error?: { message?: string };
  promptFeedback?: { blockReason?: string };
  candidates?: {
    finishReason?: string;
    content?: { parts?: GeminiPart[] };
  }[];
};

function requireGeminiKey() {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error('Add EXPO_PUBLIC_GEMINI_API_KEY to .env and restart Expo.');
  }
  return key;
}

function toContents(turns: ChatTurn[]) {
  const contents: { role: ChatTurn['role']; parts: { text: string }[] }[] = [];

  for (const turn of turns) {
    const text = turn.text.trim();
    if (!text) {
      continue;
    }
    const previous = contents[contents.length - 1];
    if (previous && previous.role === turn.role) {
      previous.parts[0].text = `${previous.parts[0].text}\n\n${text}`;
      continue;
    }
    contents.push({ role: turn.role, parts: [{ text }] });
  }

  return contents.slice(-HISTORY_LIMIT);
}

function readChunkText(payload: string) {
  const chunk = JSON.parse(payload) as GeminiChunk;
  if (chunk.error?.message) {
    throw new Error(chunk.error.message);
  }
  if (chunk.promptFeedback?.blockReason) {
    throw new Error('Gemini declined that prompt. Try rephrasing it.');
  }

  const candidate = chunk.candidates?.[0];
  if (candidate?.finishReason === 'SAFETY') {
    throw new Error('Gemini declined that reply. Try rephrasing your message.');
  }

  return candidate?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
}

function parseGeminiError(body: string, status: number) {
  try {
    const parsed = JSON.parse(body) as GeminiChunk;
    if (parsed.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // The body was not JSON.
  }

  if (status === 400 || status === 403) {
    return 'Gemini rejected the API key. Check EXPO_PUBLIC_GEMINI_API_KEY and restart Expo.';
  }
  if (status === 404) {
    return `The model ${GEMINI_MODEL} is not available for this API key.`;
  }
  if (status === 429) {
    return 'Gemini rate limit reached. Wait a moment and try again.';
  }

  return 'Gemini could not generate a reply.';
}

async function readStream(response: Response, onDelta: (fullText: string) => void) {
  const reader = response.body?.getReader();
  if (!reader) {
    const payload = await response.text();
    let full = '';
    for (const line of payload.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) {
        continue;
      }
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') {
        continue;
      }
      full += readChunkText(data);
    }
    if (!full) {
      full = readChunkText(payload);
    }
    onDelta(full);
    return full;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) {
        continue;
      }
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') {
        continue;
      }
      const delta = readChunkText(data);
      if (!delta) {
        continue;
      }
      full += delta;
      onDelta(full);
    }
  }

  return full;
}

export async function streamGeminiReply(
  history: ChatTurn[],
  onDelta: (fullText: string) => void,
  signal?: AbortSignal,
) {
  const contents = toContents(history);
  if (contents.length === 0 || contents[contents.length - 1]?.role !== 'user') {
    throw new Error('Write a message before asking Gemini.');
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': requireGeminiKey(),
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
    }),
  });

  if (!response.ok) {
    throw new Error(parseGeminiError(await response.text(), response.status));
  }

  const full = await readStream(response, onDelta);
  if (!full.trim()) {
    throw new Error('Gemini returned an empty reply.');
  }
  return full;
}
