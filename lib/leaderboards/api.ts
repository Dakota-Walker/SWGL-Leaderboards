import type {
  BountyHuntingResponse,
  LeaderboardResponse,
  LeaderboardWinsResponse,
  Period,
  RestussEventResponse,
  Subject,
} from './types';

const API_BASE = 'https://swglegends.com/api/game';

export async function fetchLeaderboard(
  id: string,
  period: Period,
  subject: Subject
): Promise<LeaderboardResponse> {
  const res = await fetch(`${API_BASE}/leaderboard?id=${id}&period=${period}&subject=${subject}`);

  if (!res.ok) {
    throw new Error(`leaderboard request failed: ${res.status}`);
  }

  return res.json() as Promise<LeaderboardResponse>;
}

export async function fetchLeaderboardWins(id: string): Promise<LeaderboardWinsResponse> {
  const res = await fetch(`${API_BASE}/leaderboard-wins?id=${id}`);

  if (!res.ok) {
    throw new Error(`leaderboard-wins request failed: ${res.status}`);
  }

  return res.json() as Promise<LeaderboardWinsResponse>;
}

export async function fetchRestussEvent(): Promise<RestussEventResponse> {
  const res = await fetch(`${API_BASE}/restuss-event`);

  if (!res.ok) {
    throw new Error(`restuss-event request failed: ${res.status}`);
  }

  return res.json() as Promise<RestussEventResponse>;
}

export async function fetchBountyHunting(): Promise<BountyHuntingResponse> {
  const res = await fetch(`${API_BASE}/bounty-hunting`);

  if (!res.ok) {
    throw new Error(`bounty-hunting request failed: ${res.status}`);
  }

  return res.json() as Promise<BountyHuntingResponse>;
}
