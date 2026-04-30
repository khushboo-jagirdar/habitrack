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

export async function fetchPropertiesByOwner(ownerId) {
  const res = await fetch(`${API_URL}/properties?ownerId=${encodeURIComponent(ownerId)}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to load properties");
  return result || [];
}

export async function fetchPropertyById(id) {
  const res = await fetch(`${API_URL}/properties/${encodeURIComponent(id)}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to load property");
  return result;
}

export async function fetchAllProperties() {
  const res = await fetch(`${API_URL}/properties`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to load properties");
  return result || [];
}

export async function createProperty(data) {
  const isFormData = data instanceof FormData;
  const res = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to create property");
  return result;
}

export async function verifyProperty(id, data) {
  const res = await fetch(`${API_URL}/properties/${encodeURIComponent(id)}/verify`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to verify property");
  return result;
}

export async function editProperty(id, data) {
  const isFormData = data instanceof FormData;
  const res = await fetch(`${API_URL}/properties/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to edit property");
  return result;
}

export async function deleteProperty(id, ownerId) {
  const res = await fetch(`${API_URL}/properties/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerId }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to delete property");
  return result;
}
