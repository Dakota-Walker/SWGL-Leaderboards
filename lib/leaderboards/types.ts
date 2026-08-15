export type Period = 'CURRENT' | 'PREVIOUS_1' | 'PREVIOUS_2';

export type Subject = 'player' | 'city' | 'guild';

export type PlayerEntry = {
  rank: number;
  participantId: string;
  name: string;
  score: number;
  scoreRaw: string;
  guildAbbreviation: string | null;
  faction: string | null;
  planet: string | null;
  cityName: string | null;
};

export type LeaderboardResponse = {
  id: string;
  period: string;
  subject: string;
  valueType: string;
  totalScore: number;
  periodStartTime: number;
  periodEndTime: number;
  entries: PlayerEntry[];
};

export type WinsEntry = {
  rank: number;
  participantId: string;
  name: string;
  wins: number;
  guildAbbreviation: string | null;
  faction: string | null;
  planet: string | null;
};

export type LeaderboardWinsResponse = {
  id: string;
  cityWins: WinsEntry[];
  guildWins: WinsEntry[];
  fetchedAt: string;
};
