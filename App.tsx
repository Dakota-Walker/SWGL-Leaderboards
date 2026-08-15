import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import BountyLogScreen, { BOUNTY_LOG_LABEL } from './components/BountyLogScreen';
import LeaderboardScreen, { Chip } from './components/LeaderboardScreen';
import RestussEventScreen from './components/RestussEventScreen';
import { THEME } from './lib/theme';

type ActiveView = 'leaderboards' | 'restuss-event' | 'bounty-log';

export default function App() {
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'light' ? 'light' : 'dark'];
  const [view, setView] = useState<ActiveView>('leaderboards');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.tabs}>
          <Chip
            label="Leaderboards"
            active={view === 'leaderboards'}
            theme={theme}
            onPress={() => setView('leaderboards')}
          />
          <Chip
            label="Restuss Event"
            active={view === 'restuss-event'}
            theme={theme}
            onPress={() => setView('restuss-event')}
          />
          <Chip
            label={BOUNTY_LOG_LABEL}
            active={view === 'bounty-log'}
            theme={theme}
            onPress={() => setView('bounty-log')}
          />
        </View>
        {view === 'leaderboards' ? (
          <LeaderboardScreen />
        ) : view === 'restuss-event' ? (
          <RestussEventScreen />
        ) : (
          <BountyLogScreen />
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
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
