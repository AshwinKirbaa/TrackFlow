export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function api(path, { method = 'GET', body, token } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let res;
  try {
    res = await fetch(`${API}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please try again.');
    throw new Error('The workspace is temporarily offline. Check that the API server is running.');
  } finally {
    clearTimeout(timeout);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
