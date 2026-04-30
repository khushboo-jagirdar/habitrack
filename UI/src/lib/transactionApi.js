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

export async function processTransaction(data) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Transaction failed");
  return result;
}

export async function getUserTransactions(userId) {
  const res = await fetch(`${API_URL}/transactions/user/${encodeURIComponent(userId)}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to load transactions");
  return result || [];
}

export async function getAllTransactions() {
  const res = await fetch(`${API_URL}/transactions`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to load transactions");
  return result || [];
}
