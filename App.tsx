import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const LEADERBOARD_ID = 'BOUNTY_HUNTER_UNIQUE_KILLS';

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Bounty Hunter Unique Kills</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Players</Text>
              {leaderboard?.entries.slice(0, 20).map((entry) => (
                <View key={entry.participantId} style={styles.row}>
                  <Text style={styles.rank}>{entry.rank}</Text>
                  <View style={styles.rowMain}>
                    <Text style={styles.name}>{entry.name}</Text>
                    {entry.guildAbbreviation ? (
                      <Text style={styles.meta}>{entry.guildAbbreviation}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.score}>{entry.score}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Cities (Wins)</Text>
              {wins?.cityWins.slice(0, 20).map((entry) => (
                <View key={entry.participantId} style={styles.row}>
                  <Text style={styles.rank}>{entry.rank}</Text>
                  <View style={styles.rowMain}>
                    <Text style={styles.name}>{entry.name}</Text>
                    {entry.planet ? <Text style={styles.meta}>{entry.planet}</Text> : null}
                  </View>
                  <Text style={styles.score}>{entry.wins}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Guilds (Wins)</Text>
              {wins?.guildWins.slice(0, 20).map((entry) => (
                <View key={entry.participantId} style={styles.row}>
                  <Text style={styles.rank}>{entry.rank}</Text>
                  <View style={styles.rowMain}>
                    <Text style={styles.name}>{entry.name}</Text>
                    {entry.guildAbbreviation ? (
                      <Text style={styles.meta}>{entry.guildAbbreviation}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.score}>{entry.wins}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#b00020',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  rank: {
    width: 28,
    fontWeight: '600',
    color: '#555',
  },
  rowMain: {
    flex: 1,
  },
  name: {
    fontSize: 15,
  },
  meta: {
    fontSize: 12,
    color: '#888',
  },
  score: {
    fontWeight: '600',
  },
});
