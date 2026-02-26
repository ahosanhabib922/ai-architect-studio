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
  systemInstruction: { parts: [{ text: systemInstruction }] },
  generationConfig: {
    temperature: 1,
    maxOutputTokens: 65536,
  }
});

// --- Non-streaming (used for element AI edit, React export, etc.) ---
// Returns { text, usage: { promptTokens, outputTokens, totalTokens } }
export const generateAIResponse = async (prompt, systemInstruction, attachments = [], model = 'gemini-3.1-pro-preview') => {
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const meta = data.usageMetadata || {};
      return {
        text,
        usage: {
          promptTokens: meta.promptTokenCount || 0,
          outputTokens: meta.candidatesTokenCount || 0,
          totalTokens: meta.totalTokenCount || 0,
        }
      };
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
// Returns { text, usage: { promptTokens, outputTokens, totalTokens } }
export const generateAIResponseStream = async (prompt, systemInstruction, attachments = [], model = 'gemini-3.1-pro-preview', onChunk, signal) => {
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
  let usage = { promptTokens: 0, outputTokens: 0, totalTokens: 0 };

  const processLines = (lines) => {
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
          // usageMetadata comes in the last chunk
          if (data.usageMetadata) {
            const meta = data.usageMetadata;
            usage = {
              promptTokens: meta.promptTokenCount || 0,
              outputTokens: meta.candidatesTokenCount || 0,
              totalTokens: meta.totalTokenCount || 0,
            };
          }
        } catch { /* skip malformed chunk */ }
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line
    processLines(lines);
  }

  // Process remaining buffer (last chunk with usageMetadata)
  if (buffer.trim()) {
    processLines(buffer.split('\n'));
  }

  return { text: accumulated, usage };
};
