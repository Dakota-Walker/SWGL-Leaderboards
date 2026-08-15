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

export type RestussLeader = 'CONTESTED' | 'IMPERIAL' | 'REBEL';
export type RestussFaction = 'IMPERIAL' | 'REBEL';

export type RestussQuest = { key: string; name: string; percent: number };

export type RestussBase = {
  key: string;
  name: string;
  phase: number;
  maxPhase: number;
  isScoring: boolean;
};

export type RestussFactionState = {
  score: number;
  maxScore: number;
  questPercent: number;
  quests: RestussQuest[];
  bases: RestussBase[];
};

export type RestussMaster = {
  key: string;
  name: string;
  phase: number;
  maxPhase: number;
  isScoring: boolean;
};

export type RestussEventResponse = {
  isActive: boolean;
  master: RestussMaster;
  imperial: RestussFactionState;
  rebel: RestussFactionState;
  winningFaction: RestussFaction | null;
  leader: RestussLeader;
  margin: number;
  imperialSharePercent: number;
  rebelSharePercent: number;
  fetchedAt: string;
};

export type BountyLargestBounty = {
  timestamp: string;
  outcome: string;
  hunterName: string;
  targetName: string;
  credits: number;
};

export type BountySummary = {
  kills: number;
  failures: number;
  encounters: number;
  successRate: number;
  creditsPaid: number;
  averageBounty: number;
  distinctHunters: number;
  distinctTargets: number;
  largestBounty: BountyLargestBounty;
};

export type BountyHunterEntry = {
  rank: number;
  name: string;
  kills: number;
  failures: number;
  encounters: number;
  successRate: number;
  creditsEarned: number;
};

export type BountyTargetEntry = {
  rank: number;
  name: string;
  timesKilled: number;
  timesSurvived: number;
  encounters: number;
  survivalRate: number;
};

export type BountySurvivorEntry = {
  rank: number;
  name: string;
  timesKilled: number;
  timesSurvived: number;
  encounters: number;
  survivalRate: number;
};

export type BountyHuntingResponse = {
  windowDays: number;
  summary: BountySummary;
  hunters: BountyHunterEntry[];
  targets: BountyTargetEntry[];
  survivors: BountySurvivorEntry[];
  fetchedAt: string;
};
