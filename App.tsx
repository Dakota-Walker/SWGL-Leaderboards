import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import LeaderboardWidget from './widgets/LeaderboardWidget';

const LEADERBOARD_ID = 'BOUNTY_HUNTER_UNIQUE_KILLS';

const THEME = {
  dark: {
    background: '#16171f',
    card: '#1e202b',
    accent: '#e3a83b',
    text: '#f2ede2',
    muted: '#807d76',
    border: '#2c2e3a',
    error: '#ff7a6b',
  },
  light: {
    background: '#faf6ec',
    card: '#ffffff',
    accent: '#c9862a',
    text: '#242018',
    muted: '#8a8578',
    border: '#e7e0cf',
    error: '#b00020',
  },
};

type PlayerEntry = {
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

type LeaderboardResponse = {
  id: string;
  period: string;
  subject: string;
  valueType: string;
  totalScore: number;
  periodStartTime: number;
  periodEndTime: number;
  entries: PlayerEntry[];
};

type WinsEntry = {
  rank: number;
  participantId: string;
  name: string;
  wins: number;
  guildAbbreviation: string | null;
  faction: string | null;
  planet: string | null;
};

type LeaderboardWinsResponse = {
  id: string;
  cityWins: WinsEntry[];
  guildWins: WinsEntry[];
  fetchedAt: string;
};

export default function App() {
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'light' ? 'light' : 'dark'];
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [wins, setWins] = useState<LeaderboardWinsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [leaderboardRes, winsRes] = await Promise.all([
          fetch(
            `https://swglegends.com/api/game/leaderboard?id=${LEADERBOARD_ID}&period=CURRENT&subject=player`
          ),
          fetch(`https://swglegends.com/api/game/leaderboard-wins?id=${LEADERBOARD_ID}`),
        ]);

        if (!leaderboardRes.ok) {
          throw new Error(`leaderboard request failed: ${leaderboardRes.status}`);
        }
        if (!winsRes.ok) {
          throw new Error(`leaderboard-wins request failed: ${winsRes.status}`);
        }

        const [leaderboardData, winsData] = await Promise.all([
          leaderboardRes.json() as Promise<LeaderboardResponse>,
          winsRes.json() as Promise<LeaderboardWinsResponse>,
        ]);

        if (!ignore) {
          setLeaderboard(leaderboardData);
          setWins(winsData);
          LeaderboardWidget.updateSnapshot({
            entries: leaderboardData.entries
              .slice(0, 3)
              .map((entry) => ({ rank: entry.rank, name: entry.name, score: entry.score })),
          });
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

  const sections = [
    { title: 'Top Players', entries: leaderboard?.entries, valueKey: 'score' as const },
    { title: 'Top Cities (Wins)', entries: wins?.cityWins, valueKey: 'wins' as const },
    { title: 'Top Guilds (Wins)', entries: wins?.guildWins, valueKey: 'wins' as const },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
            <Text style={[styles.eyebrow, { color: theme.accent }]}>BOUNTY HUNTER</Text>
            <Text style={[styles.title, { color: theme.text }]}>Unique Kills</Text>

            {sections.map((section) => (
              <View
                key={section.title}
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
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
        <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
