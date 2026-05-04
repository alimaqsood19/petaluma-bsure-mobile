import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>B·SURE</Text>
      <Text style={styles.tagline}>Phase 0 placeholder</Text>
      <View style={styles.meta}>
        <Text style={styles.metaLine}>API: {apiUrl}</Text>
        <Text style={styles.metaLine}>
          Build: {Constants.expoConfig?.version ?? 'dev'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1014',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    color: '#7DE0C8',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 4,
  },
  tagline: {
    color: '#B8C0CC',
    fontSize: 16,
    marginTop: 12,
  },
  meta: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  metaLine: {
    color: '#5C6470',
    fontSize: 12,
    marginVertical: 2,
  },
});
