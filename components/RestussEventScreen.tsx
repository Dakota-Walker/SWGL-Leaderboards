import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { fetchRestussEvent } from '../lib/leaderboards/api';
import type { RestussEventResponse, RestussFactionState } from '../lib/leaderboards/types';
import { THEME } from '../lib/theme';

const IMPERIAL_COLOR = '#3d7dca';
const REBEL_COLOR = '#c0392b';

export default function RestussEventScreen() {
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'light' ? 'light' : 'dark'];

  const [data, setData] = useState<RestussEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const event = await fetchRestussEvent();
        if (!ignore) {
          setData(event);
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
  }, [refreshKey]);

  const leaderColor =
    data?.leader === 'IMPERIAL' ? IMPERIAL_COLOR : data?.leader === 'REBEL' ? REBEL_COLOR : theme.muted;

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.accent }]}>RESTUSS EVENT</Text>
        <Pressable
          onPress={() => setRefreshKey((key) => key + 1)}
          style={[styles.refreshButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.refreshText, { color: theme.text }]}>Refresh</Text>
        </Pressable>
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
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>{data.master.name}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>
              Phase {data.master.phase + 1} / {data.master.maxPhase + 1} ·{' '}
              {data.isActive ? 'Active' : 'Inactive'}
            </Text>
            <Text style={[styles.leaderText, { color: leaderColor }]}>
              {data.winningFaction
                ? `Winner: ${data.winningFaction}`
                : data.leader === 'CONTESTED'
                  ? 'Contested'
                  : `Leading: ${data.leader}`}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.muted }]}>FACTION SHARE</Text>
            <ShareBar imperialPercent={data.imperialSharePercent} rebelPercent={data.rebelSharePercent} />
            <View style={styles.shareLabels}>
              <Text style={[styles.shareLabel, { color: IMPERIAL_COLOR }]}>
                Imperial {data.imperialSharePercent}%
              </Text>
              <Text style={[styles.shareLabel, { color: REBEL_COLOR }]}>Rebel {data.rebelSharePercent}%</Text>
            </View>
          </View>

          <View
            style={[styles.card, styles.scoreRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <FactionScore label="Imperial" color={IMPERIAL_COLOR} state={data.imperial} theme={theme} />
            <FactionScore label="Rebel" color={REBEL_COLOR} state={data.rebel} theme={theme} />
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.muted }]}>QUESTS</Text>
            {data.imperial.quests.map((quest, index) => {
              const rebelQuest = data.rebel.quests[index];
              return (
                <PairedRow
                  key={quest.key}
                  label={quest.name.replace(/^Imperial /, '').replace(/^Rebel /, '')}
                  imperialPercent={quest.percent}
                  rebelPercent={rebelQuest?.percent ?? null}
                  theme={theme}
                />
              );
            })}
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.muted }]}>BASES</Text>
            {data.imperial.bases.map((base, index) => {
              const rebelBase = data.rebel.bases[index];
              return (
                <PairedRow
                  key={base.key}
                  label={base.name.replace(/^Imperial /, '').replace(/^Rebel /, '')}
                  imperialPercent={base.maxPhase ? Math.round((base.phase / base.maxPhase) * 100) : 0}
                  rebelPercent={
                    rebelBase && rebelBase.maxPhase
                      ? Math.round((rebelBase.phase / rebelBase.maxPhase) * 100)
                      : null
                  }
                  imperialSuffix={`${base.phase + 1}/${base.maxPhase + 1}`}
                  rebelSuffix={rebelBase ? `${rebelBase.phase + 1}/${rebelBase.maxPhase + 1}` : undefined}
                  scoring={base.isScoring || rebelBase?.isScoring}
                  theme={theme}
                />
              );
            })}
          </View>

          <Text style={[styles.footer, { color: theme.muted }]}>
            Updated {new Date(data.fetchedAt).toLocaleString()}
          </Text>
        </ScrollView>
      ) : null}
    </>
  );
}

function ShareBar({ imperialPercent, rebelPercent }: { imperialPercent: number; rebelPercent: number }) {
  return (
    <View style={styles.shareBar}>
      <View style={[styles.shareSegment, { flexGrow: imperialPercent, backgroundColor: IMPERIAL_COLOR }]} />
      <View style={[styles.shareSegment, { flexGrow: rebelPercent, backgroundColor: REBEL_COLOR }]} />
    </View>
  );
}

function FactionScore({
  label,
  color,
  state,
  theme,
}: {
  label: string;
  color: string;
  state: RestussFactionState;
  theme: (typeof THEME)['dark'];
}) {
  return (
    <View style={styles.factionScore}>
      <Text style={[styles.factionLabel, { color }]}>{label}</Text>
      <Text style={[styles.factionValue, { color: theme.text }]}>
        {state.score} / {state.maxScore}
      </Text>
      <Text style={[styles.meta, { color: theme.muted }]}>{state.questPercent}% quests</Text>
    </View>
  );
}

function PairedRow({
  label,
  imperialPercent,
  rebelPercent,
  imperialSuffix,
  rebelSuffix,
  scoring,
  theme,
}: {
  label: string;
  imperialPercent: number;
  rebelPercent: number | null;
  imperialSuffix?: string;
  rebelSuffix?: string;
  scoring?: boolean;
  theme: (typeof THEME)['dark'];
}) {
  return (
    <View style={[styles.pairedRow, { borderBottomColor: theme.border }]}>
      <View style={styles.pairedRowHeader}>
        <Text style={[styles.pairedLabel, { color: theme.text }]}>{label}</Text>
        {scoring ? <Text style={[styles.scoringBadge, { color: theme.accent }]}>SCORING</Text> : null}
      </View>
      <View style={styles.pairedSides}>
        <View style={styles.pairedSide}>
          <Text style={[styles.pairedPercent, { color: IMPERIAL_COLOR }]}>
            {imperialSuffix ?? `${imperialPercent}%`}
          </Text>
          <MiniBar percent={imperialPercent} color={IMPERIAL_COLOR} />
        </View>
        <View style={styles.pairedSide}>
          <MiniBar percent={rebelPercent ?? 0} color={REBEL_COLOR} reverse />
          <Text style={[styles.pairedPercent, styles.pairedPercentRight, { color: REBEL_COLOR }]}>
            {rebelPercent === null ? '—' : (rebelSuffix ?? `${rebelPercent}%`)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function MiniBar({ percent, color, reverse }: { percent: number; color: string; reverse?: boolean }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View style={styles.miniBarTrack}>
      <View
        style={[
          styles.miniBarFill,
          reverse ? { right: 0 } : { left: 0 },
          { width: `${clamped}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  refreshButton: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  refreshText: {
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
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
  },
  leaderText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  shareBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  shareSegment: {
    height: '100%',
  },
  shareLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  shareLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  factionScore: {
    alignItems: 'center',
    gap: 2,
  },
  factionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  factionValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  pairedRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  pairedRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pairedLabel: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  scoringBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  pairedSides: {
    flexDirection: 'row',
    gap: 16,
  },
  pairedSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pairedPercent: {
    fontSize: 12,
    fontWeight: '600',
    width: 44,
  },
  pairedPercentRight: {
    textAlign: 'right',
  },
  miniBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(128,128,128,0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  miniBarFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
