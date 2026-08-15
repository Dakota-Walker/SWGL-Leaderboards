import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import LeaderboardScreen, { Chip } from './components/LeaderboardScreen';
import RestussEventScreen from './components/RestussEventScreen';
import { THEME } from './lib/theme';

type ActiveView = 'leaderboards' | 'restuss-event';

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
        </View>
        {view === 'leaderboards' ? <LeaderboardScreen /> : <RestussEventScreen />}
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
