import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Chip } from './LeaderboardScreen';
import { fetchBountyHunting } from '../lib/leaderboards/api';
import type {
  BountyHunterEntry,
  BountyHuntingResponse,
  BountySurvivorEntry,
  BountyTargetEntry,
} from '../lib/leaderboards/types';
import { THEME } from '../lib/theme';

export const BOUNTY_LOG_LABEL = 'Bounty Log';

type BountyTabId = 'hunters' | 'wanted' | 'marks';

const TABS: { id: BountyTabId; label: string }[] = [
  { id: 'hunters', label: 'Hunters' },
  { id: 'wanted', label: 'Most Wanted' },
  { id: 'marks', label: 'Deadliest Marks' },
];

const TAB_META: Record<BountyTabId, { title: string; subtitle: string; unit: string }> = {
  hunters: { title: 'Deadliest Hunters', subtitle: 'Bounties collected', unit: 'claimed' },
  wanted: { title: 'Most Wanted', subtitle: 'Marks hunted down most', unit: 'times' },
  marks: { title: 'Deadliest Marks', subtitle: 'Marks who put hunters down', unit: 'beaten' },
};

type BountyRow = { rank: number; name: string; value: number; sub: string };

function percent(rate: number) {
  return `${Math.round(rate * 100)}%`;
}

function mapHunterRow(entry: BountyHunterEntry): BountyRow {
  return {
    rank: entry.rank,
    name: entry.name,
    value: entry.kills,
    sub: `${entry.failures.toLocaleString()} lost · ${percent(entry.successRate)} success · ${entry.creditsEarned.toLocaleString()} cr`,
  };
}

function mapTargetRow(entry: BountyTargetEntry): BountyRow {
  return {
    rank: entry.rank,
    name: entry.name,
    value: entry.timesKilled,
    sub: `${entry.timesSurvived.toLocaleString()} fought off · ${percent(entry.survivalRate)} survival`,
  };
}

function mapSurvivorRow(entry: BountySurvivorEntry): BountyRow {
  return {
    rank: entry.rank,
    name: entry.name,
    value: entry.timesSurvived,
    sub: `${entry.timesKilled.toLocaleString()} caught · ${percent(entry.survivalRate)} survival`,
  };
}

export default function BountyLogScreen() {
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'light' ? 'light' : 'dark'];

  const [data, setData] = useState<BountyHuntingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BountyTabId>('hunters');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const result = await fetchBountyHunting();
        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const rows: BountyRow[] = useMemo(() => {
    if (!data) return [];
    if (tab === 'hunters') return data.hunters.map(mapHunterRow);
    if (tab === 'wanted') return data.targets.map(mapTargetRow);
    return data.survivors.map(mapSurvivorRow);
  }, [data, tab]);

  const meta = TAB_META[tab];

  return (
    <>
      <View style={styles.filters}>
        <FilterRow>
          {TABS.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              active={option.id === tab}
              theme={theme}
              onPress={() => setTab(option.id)}
            />
          ))}
        </FilterRow>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      ) : data ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.eyebrow, { color: theme.accent }]}>BOUNTY LOG</Text>
          <Text style={[styles.title, { color: theme.text }]}>{meta.title}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{meta.subtitle}</Text>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.muted }]}>{meta.title.toUpperCase()}</Text>
            {rows.slice(0, 20).map((row, index) => (
              <View
                key={`${tab}-${row.rank}-${row.name}`}
                style={[
                  styles.row,
                  { borderBottomColor: theme.border },
                  index === rows.length - 1 && styles.rowLast,
                ]}>
                <Text style={[styles.rank, { color: theme.muted }]}>{row.rank}</Text>
                <View style={styles.rowMain}>
                  <Text style={[styles.name, { color: theme.text }]}>{row.name}</Text>
                  <Text style={[styles.meta, { color: theme.muted }]}>{row.sub}</Text>
                </View>
                <Text style={[styles.score, { color: theme.accent }]}>
                  {row.value.toLocaleString()} {meta.unit}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.tileGrid}>
            <SummaryTile
              label="Bounties Claimed"
              value={data.summary.kills.toLocaleString()}
              theme={theme}
            />
            <SummaryTile
              label="Hunters Down"
              value={data.summary.failures.toLocaleString()}
              theme={theme}
            />
            <SummaryTile label="Success Rate" value={percent(data.summary.successRate)} theme={theme} />
            <SummaryTile
              label="Credits Paid"
              value={`${data.summary.creditsPaid.toLocaleString()} cr`}
              theme={theme}
            />
            <SummaryTile
              label="Average Bounty"
              value={`${Math.round(data.summary.averageBounty).toLocaleString()} cr`}
              theme={theme}
            />
            <SummaryTile
              label="Biggest Contract"
              value={`${data.summary.largestBounty.credits.toLocaleString()} cr`}
              sub={`${data.summary.largestBounty.hunterName} on ${data.summary.largestBounty.targetName}`}
              theme={theme}
            />
          </View>

          <Text style={[styles.footer, { color: theme.muted }]}>
            Updated {new Date(data.fetchedAt).toLocaleString()}
          </Text>
        </ScrollView>
      ) : null}
    </>
  );
}

function FilterRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {children}
    </ScrollView>
  );
}

function SummaryTile({
  label,
  value,
  sub,
  theme,
}: {
  label: string;
  value: string;
  sub?: string;
  theme: (typeof THEME)['dark'];
}) {
  return (
    <View style={[styles.tile, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.tileLabel, { color: theme.muted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.tileValue, { color: theme.text }]}>{value}</Text>
      {sub ? <Text style={[styles.tileSub, { color: theme.muted }]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingTop: 8,
    gap: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  content: {
    padding: 16,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  tile: {
    flexBasis: '31%',
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  tileValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  tileSub: {
    fontSize: 10,
    marginTop: 2,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rank: {
    width: 28,
    fontSize: 15,
    fontWeight: '600',
  },
  rowMain: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
  },
  score: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
