// API for user profile update
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

export async function updateUserProfile(id, data) {
  const formData = new FormData();
  if (data.fullName) formData.append('fullName', data.fullName);
  if (data.userType) formData.append('userType', data.userType);
  if (data.avatar) formData.append('avatar', data.avatar);

  const res = await fetch(`${API_URL}/user/profile/${id}`, {
    method: 'PUT',
    body: formData,
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || 'Update failed');
  return result;
}

export async function fetchUserById(id) {
  const res = await fetch(`${API_URL}/user/${encodeURIComponent(id)}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || 'Failed to load user');
  // Normalize id field
  if (result && result._id && !result.id) result.id = result._id;
  return result;
}

// Save a property for a user
export async function saveProperty(userId, propertyId) {
  const res = await fetch(`${API_URL}/user/${encodeURIComponent(userId)}/saved-properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || 'Failed to save property');
  return result;
}

// Remove a saved property for a user
export async function unsaveProperty(userId, propertyId) {
  const res = await fetch(`${API_URL}/user/${encodeURIComponent(userId)}/saved-properties/${encodeURIComponent(propertyId)}`, {
    method: 'DELETE',
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || 'Failed to remove property');
  return result;
}

// Get saved properties for a user
export async function getSavedProperties(userId) {
  const res = await fetch(`${API_URL}/user/${encodeURIComponent(userId)}/saved-properties`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || 'Failed to get saved properties');
  return result;
}
