export type LeaderboardCatalogEntry = {
  key: string;
  label: string;
  leaderboardId: string;
};

export type LeaderboardCategory = {
  key: string;
  label: string;
  subcategories: LeaderboardCatalogEntry[];
};

const GCW_CATEGORY: LeaderboardCategory = {
  key: 'gcw',
  label: 'GCW',
  subcategories: [
    { key: 'imperial-gcw', label: 'Imperial GCW', leaderboardId: 'GCW_IMPERIAL' },
    { key: 'rebel-gcw', label: 'Rebel GCW', leaderboardId: 'GCW_REBEL' },
    {
      key: 'pvp-kills-ground-imperial',
      label: 'PvP Kills - Ground Imperial',
      leaderboardId: 'PVP_KILLS_GROUND_IMPERIAL',
    },
    {
      key: 'pvp-kills-ground-rebel',
      label: 'PvP Kills - Ground Rebel',
      leaderboardId: 'PVP_KILLS_GROUND_REBEL',
    },
    {
      key: 'pvp-kills-space-imperial',
      label: 'PvP Kills - Space Imperial',
      leaderboardId: 'PVP_KILLS_SPACE_IMPERIAL',
    },
    {
      key: 'pvp-kills-space-rebel',
      label: 'PvP Kills - Space Rebel',
      leaderboardId: 'PVP_KILLS_SPACE_REBEL',
    },
    {
      key: 'space-battle-points',
      label: 'Space Battle Points',
      leaderboardId: 'SPACE_BATTLE_POINTS',
    },
  ],
};

const BOUNTY_HUNTER_CATEGORY: LeaderboardCategory = {
  key: 'bounty-hunter',
  label: 'Bounty Hunter',
  subcategories: [
    { key: 'ground-value', label: 'Ground Value', leaderboardId: 'BOUNTY_HUNTER_GROUND_VALUE' },
    // Not yet confirmed against the live API - id guessed from naming pattern.
    { key: 'space-value', label: 'Space Value', leaderboardId: 'TODO_CONFIRM_BOUNTY_HUNTER_SPACE_VALUE' },
    { key: 'unique-kills', label: 'Unique Kills', leaderboardId: 'BOUNTY_HUNTER_UNIQUE_KILLS' },
    // Not yet confirmed against the live API - id guessed from naming pattern.
    { key: 'total-kills', label: 'Total Kills', leaderboardId: 'TODO_CONFIRM_BOUNTY_HUNTER_TOTAL_KILLS' },
  ],
};

export const LEADERBOARD_CATALOG: LeaderboardCategory[] = [BOUNTY_HUNTER_CATEGORY, GCW_CATEGORY];

export function findSubcategory(
  categoryKey: string,
  subcategoryKey: string
): LeaderboardCatalogEntry | undefined {
  return LEADERBOARD_CATALOG.find((category) => category.key === categoryKey)?.subcategories.find(
    (subcategory) => subcategory.key === subcategoryKey
  );
}

export function isConfirmed(entry: LeaderboardCatalogEntry): boolean {
  return !entry.leaderboardId.startsWith('TODO_');
}

export function confirmedSubcategories(categoryKey: string): LeaderboardCatalogEntry[] {
  return (
    LEADERBOARD_CATALOG.find((category) => category.key === categoryKey)?.subcategories.filter(
      isConfirmed
    ) ?? []
  );
}
