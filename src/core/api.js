import { getVoterId } from './voter.js';

const BASE_URL = 'https://hub.jampolls.com';
const SDK_VERSION = '1.0.0';

function getApiError(data, status) {
  return (
    data?.errors?.message ||
    data?.errors?.error ||
    data?.error ||
    `HTTP ${status}`
  );
}

function unwrapApiResponse(data, status) {
  if (data?.success === false) {
    throw new Error(getApiError(data, status));
  }

  return data?.data || data;
}

export class JampollsApi {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = String(baseUrl || BASE_URL).replace(/\/+$/, '');
  }

  async fetchPoll(embedKey) {
    const res = await fetch(`${this.baseUrl}/api/v1/widgets/${embedKey}/fetch/`, {
      headers: { 'X-SDK-Version': SDK_VERSION },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
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
    if (!res.ok) throw new Error(getApiError(data, res.status));
    return unwrapApiResponse(data, res.status);
  }
}
