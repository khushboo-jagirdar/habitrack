const API_URL = import.meta.env.VITE_API_URL || "/api";

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid server response");
  }
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Registration failed");
  return result;
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Login failed");
  if (result?.user && result.user._id && !result.user.id) {
    result.user.id = result.user._id;
  }
  return result;
}

export async function adminLogin(data) {
  const res = await fetch(`${API_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Admin login failed");
  if (result?.user && result.user._id && !result.user.id) {
    result.user.id = result.user._id;
  }
  return result;
}

export async function resetPassword(data) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Reset failed");
  return result;
}

// Aadhaar Authentication
export async function sendAadhaarOtp(aadhaarNumber, userId) {
  const res = await fetch(`${API_URL}/auth/aadhaar/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aadhaarNumber, userId }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Failed to send OTP");
  return result;
}

export async function verifyAadhaarOtp(otp, userId) {
  const res = await fetch(`${API_URL}/auth/aadhaar/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp, userId }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "OTP verification failed");
  return result;
}
