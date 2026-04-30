import { getVoterId } from './voter.js';

const BASE_URL = 'https://hub.jampolls.com';
const SDK_VERSION = '1.0.0';

export class JampollsApi {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  async fetchPoll(embedKey) {
    const res = await fetch(`${this.baseUrl}/api/v1/widgets/${embedKey}/fetch/`, {
      headers: { 'X-SDK-Version': SDK_VERSION },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  async vote(embedKey, optionId, remove = false) {
    const res = await fetch(`${this.baseUrl}/api/v1/widgets/${embedKey}/vote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SDK-Version': SDK_VERSION,
      },
      body: JSON.stringify({
        option_id: optionId,
        voter_id: getVoterId(),
        remove_vote: remove,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }
}
