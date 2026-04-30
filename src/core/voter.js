const STORAGE_KEY = 'jp_voter_id';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for very old environments
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVoterId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage blocked (e.g. private mode cross-origin iframe) — generate ephemeral ID
    return generateId();
  }
}
