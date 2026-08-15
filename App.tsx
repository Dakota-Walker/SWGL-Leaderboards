import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import LeaderboardScreen from './components/LeaderboardScreen';
import { THEME } from './lib/theme';

export default function App() {
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'light' ? 'light' : 'dark'];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <LeaderboardScreen />
        <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
