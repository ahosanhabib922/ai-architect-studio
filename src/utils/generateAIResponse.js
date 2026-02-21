import { apiKey } from '../config/api';

// --- Build request parts (shared by both callers) ---
const buildParts = (prompt, attachments) => {
  const parts = [];
  let fullPrompt = prompt;

  const textAttachments = attachments.filter(a => a.isText);
  if (textAttachments.length > 0) {
    let attachedContext = "\n\n--- ATTACHED CONTEXT ---\n";
    textAttachments.forEach(a => { attachedContext += `[File: ${a.name}]\n${a.content}\n\n`; });
    fullPrompt += attachedContext;
  }

  parts.push({ text: fullPrompt });

  const binaryAttachments = attachments.filter(a => !a.isText);
  binaryAttachments.forEach(a => {
    parts.push({
      inlineData: { mimeType: a.type, data: a.data.split(',')[1] }
    });
  });

  return parts;
};

const buildBody = (parts, systemInstruction) => JSON.stringify({
  contents: [{ role: "user", parts }],
  systemInstruction: { parts: [{ text: systemInstruction }] }
});

// --- Non-streaming (used for element AI edit, React export, etc.) ---
export const generateAIResponse = async (prompt, systemInstruction, attachments = [], model = 'gemini-3-flash-preview') => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const backoff = async (retries, delay) => {
    try {
      const parts = buildParts(prompt, attachments);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: buildBody(parts, systemInstruction)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, delay));
        return backoff(retries - 1, delay * 2);
      }
      throw err;
    }
  };

  return backoff(3, 1000);
};

// --- Real-time streaming (used for main generation) ---
export const generateAIResponseStream = async (prompt, systemInstruction, attachments = [], model = 'gemini-3-flash-preview', onChunk, signal) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
  const parts = buildParts(prompt, attachments);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: buildBody(parts, systemInstruction),
    signal
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        try {
          const data = JSON.parse(jsonStr);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            accumulated += text;
            onChunk(accumulated);
          }
        } catch { /* skip malformed chunk */ }
      }
    }
  }

  return accumulated;
};
