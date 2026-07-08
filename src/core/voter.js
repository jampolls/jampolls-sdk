const STORAGE_KEY = 'jp_voter_id';

let _resolvedId = null;
let _pending = null;

function readStoredId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function persistId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage blocked — in-memory cache still works for this session
  }
}

function unwrapIdentityResponse(data, status) {
  if (data?.success === false) {
    throw new Error(data?.errors?.message || data?.errors?.error || data?.error || `HTTP ${status}`);
  }
  return data?.data || data;
}

/**
 * Resolve a server-issued voter ID once per page session.
 * Persists to localStorage when available.
 */
export async function getVoterId(baseUrl) {
  if (_resolvedId) return _resolvedId;
  if (_pending) return _pending;

  const root = String(baseUrl || 'https://hub.jampolls.com').replace(/\/+$/, '');
  const stored = readStoredId();

  _pending = fetch(`${root}/api/v1/voter/identity/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-SDK-Version': '1.0.0' },
    body: JSON.stringify(stored ? { voter_id: stored } : {}),
  })
    .then(async res => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 201) {
        throw new Error(data?.errors?.message || data?.error || `HTTP ${res.status}`);
      }
      const payload = unwrapIdentityResponse(data, res.status);
      if (!payload?.voter_id) throw new Error('Invalid voter identity response');
      _resolvedId = payload.voter_id;
      persistId(_resolvedId);
      return _resolvedId;
    })
    .finally(() => {
      _pending = null;
    });

  return _pending;
}
