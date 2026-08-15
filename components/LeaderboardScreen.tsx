import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { fetchLeaderboard, fetchLeaderboardWins } from '../lib/leaderboards/api';
import { LEADERBOARD_CATALOG, confirmedSubcategories, findSubcategory } from '../lib/leaderboards/catalog';
import type {
  LeaderboardResponse,
  LeaderboardWinsResponse,
  Period,
  PlayerEntry,
  Subject,
  WinsEntry,
} from '../lib/leaderboards/types';
import { THEME } from '../lib/theme';
import LeaderboardWidget from '../widgets/LeaderboardWidget';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'CURRENT', label: 'This Week' },
  { value: 'PREVIOUS_1', label: 'Last Week' },
  { value: 'PREVIOUS_2', label: '2 Weeks Ago' },
];

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: 'player', label: 'Players' },
  { value: 'city', label: 'Cities' },
  { value: 'guild', label: 'Guilds' },
];

const WIDGET_CATEGORY_KEY = 'bounty-hunter';
const WIDGET_SUBCATEGORY_KEY = 'unique-kills';
const WIDGET_SUBJECT: Subject = 'player';

type LeaderboardScreenProps = {
  initialCategoryKey?: string;
};

export default function LeaderboardScreen({ initialCategoryKey = 'bounty-hunter' }: LeaderboardScreenProps) {
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'light' ? 'light' : 'dark'];

  const [categoryKey, setCategoryKey] = useState(initialCategoryKey);
  const subcategories = confirmedSubcategories(categoryKey);
  const [subcategoryKey, setSubcategoryKey] = useState(
    () => findSubcategory(categoryKey, WIDGET_SUBCATEGORY_KEY)?.key ?? subcategories[0]?.key
  );
  const [period, setPeriod] = useState<Period>('CURRENT');
  const [subject, setSubject] = useState<Subject>('player');

  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [wins, setWins] = useState<LeaderboardWinsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = subcategoryKey ? findSubcategory(categoryKey, subcategoryKey) : undefined;

  useEffect(() => {
    if (!selected) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [leaderboardData, winsData] = await Promise.all([
          fetchLeaderboard(selected!.leaderboardId, period, subject),
          fetchLeaderboardWins(selected!.leaderboardId),
        ]);

        if (!ignore) {
          setLeaderboard(leaderboardData);
          setWins(winsData);

          if (
            categoryKey === WIDGET_CATEGORY_KEY &&
            subcategoryKey === WIDGET_SUBCATEGORY_KEY &&
            subject === WIDGET_SUBJECT
          ) {
            LeaderboardWidget.updateSnapshot({
              entries: leaderboardData.entries
                .slice(0, 3)
                .map((entry) => ({ rank: entry.rank, name: entry.name, score: entry.score })),
            });
          }
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
  }, [categoryKey, subcategoryKey, period, subject, selected]);

  const subjectLabel = SUBJECT_OPTIONS.find((option) => option.value === subject)?.label ?? 'Players';

  const sections = [
    { title: `Top ${subjectLabel}`, entries: leaderboard?.entries, valueKey: 'score' as const },
    { title: 'Top Cities (Wins)', entries: wins?.cityWins, valueKey: 'wins' as const },
    { title: 'Top Guilds (Wins)', entries: wins?.guildWins, valueKey: 'wins' as const },
  ];

  return (
    <>
      <View style={styles.filters}>
        <FilterRow>
          {LEADERBOARD_CATALOG.map((category) => (
            <Chip
              key={category.key}
              label={category.label}
              active={category.key === categoryKey}
              theme={theme}
              onPress={() => {
                setCategoryKey(category.key);
                setSubcategoryKey(confirmedSubcategories(category.key)[0]?.key);
              }}
            />
          ))}
        </FilterRow>
        <FilterRow>
          {subcategories.map((subcategory) => (
            <Chip
              key={subcategory.key}
              label={subcategory.label}
              active={subcategory.key === subcategoryKey}
              theme={theme}
              onPress={() => setSubcategoryKey(subcategory.key)}
            />
          ))}
        </FilterRow>
        <FilterRow>
          {PERIOD_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={option.value === period}
              theme={theme}
              onPress={() => setPeriod(option.value)}
            />
          ))}
        </FilterRow>
        <FilterRow>
          {SUBJECT_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={option.value === subject}
              theme={theme}
              onPress={() => setSubject(option.value)}
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
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.eyebrow, { color: theme.accent }]}>
            {(LEADERBOARD_CATALOG.find((category) => category.key === categoryKey)?.label ?? '').toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>{selected?.label}</Text>

          {sections.map((section) => (
            <View
              key={section.title}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>
                {section.title.toUpperCase()}
              </Text>
              {section.entries?.slice(0, 20).map((entry, index) => (
                <View
                  key={entry.participantId}
                  style={[
                    styles.row,
                    { borderBottomColor: theme.border },
                    index === (section.entries?.length ?? 0) - 1 && styles.rowLast,
                  ]}>
                  <Text style={[styles.rank, { color: theme.muted }]}>{entry.rank}</Text>
                  <View style={styles.rowMain}>
                    <Text style={[styles.name, { color: theme.text }]}>{entry.name}</Text>
                    {'guildAbbreviation' in entry && entry.guildAbbreviation ? (
                      <Text style={[styles.meta, { color: theme.muted }]}>
                        {entry.guildAbbreviation}
                      </Text>
                    ) : null}
                    {'planet' in entry && entry.planet ? (
                      <Text style={[styles.meta, { color: theme.muted }]}>{entry.planet}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.score, { color: theme.accent }]}>
                    {(entry as PlayerEntry & WinsEntry)[section.valueKey]}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
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

function Chip({
  label,
  active,
  theme,
  onPress,
}: {
  label: string;
  active: boolean;
  theme: (typeof THEME)['dark'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.accent : theme.card,
          borderColor: theme.border,
        },
      ]}>
      <Text style={[styles.chipText, { color: active ? theme.background : theme.text }]}>{label}</Text>
    </Pressable>
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
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
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
    marginBottom: 20,
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
  },
});
