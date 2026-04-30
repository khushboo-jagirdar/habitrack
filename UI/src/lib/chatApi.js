const API_URL = import.meta.env.VITE_API_URL || "/api";

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Invalid server response");
  }
}

export async function fetchThreads(userId) {
  const res = await fetch(`${API_URL}/chat/threads?userId=${encodeURIComponent(userId)}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to load chats");
  return result || [];
}

export async function fetchThread(threadId) {
  const res = await fetch(`${API_URL}/chat/threads/${encodeURIComponent(threadId)}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to load chat");
  return result;
}

export async function createThread({ senderId, recipientEmail, text }) {
  const res = await fetch(`${API_URL}/chat/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, recipientEmail, text }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to start chat");
  return result;
}

export async function sendMessage({ threadId, senderId, text }) {
  const res = await fetch(`${API_URL}/chat/threads/${encodeURIComponent(threadId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderId, text }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to send message");
  return result;
}
