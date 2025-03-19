import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, Surface, Button, useTheme, TextInput, Snackbar } from 'react-native-paper';
import { Moon, Sun } from 'lucide-react-native';
import { format } from 'date-fns';
import { useStats } from '../../hooks/useStats';
import { useHabits } from '../../hooks/useHabits';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const theme = useTheme();
  const today = new Date();
  const { sleepHours, logSleep, meditationMinutes, logMeditation } = useStats();
  const { habits, progress, loadHabits, completeHabit } = useHabits();
  
  const [refreshing, setRefreshing] = useState(false);
  const [sleepInput, setSleepInput] = useState('');
  const [meditationInput, setMeditationInput] = useState('');
  const [greeting, setGreeting] = useState('');
  const [completedHabitId, setCompletedHabitId] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // ✅ Auto-refresh when navigating to Home tab
  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  // ✅ Function to determine greeting based on time
  useEffect(() => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good afternoon');
    } else if (hour >= 18 && hour < 22) {
      setGreeting('Good evening');
    } else {
      setGreeting('Good night');
    }
  }, []);

  // ✅ Pull-to-Refresh Function (Swipe Down to Refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  }, []);

  const handleCompleteHabit = async (id: string, frequency: string[]) => {
    await completeHabit(id);
    setCompletedHabitId(id);

    // ✅ Show success message
    if (frequency.length === 7) {
      setSnackbarMessage("✅ Done for today!");
    } else {
      setSnackbarMessage("✅ Habit completed!");
    }
    setShowSnackbar(true);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          {greeting}, User
        </Text>
        <Text variant="bodyLarge" style={styles.date}>
          {format(today, 'EEEE, MMMM d')}
        </Text>
      </View>

      {/* ✅ Sleep Tracking */}
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardHeader}>
          <Moon size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.cardTitle}>Sleep Tracking</Text>
        </View>
        <View style={styles.cardStats}>
          <Text variant="displaySmall" style={styles.cardHighlight}>{sleepHours ? `${sleepHours}h` : '--'}</Text>
          <Text variant="bodyMedium" style={styles.cardSubtext}>Last night's sleep</Text>
        </View>
        <TextInput
          label="Enter hours"
          value={sleepInput}
          onChangeText={setSleepInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button mode="contained" onPress={() => {
          const hours = parseFloat(sleepInput);
          if (hours > 0) {
            logSleep(hours);
            setSleepInput('');
          } else {
            Alert.alert("Invalid Input", "Please enter a valid number of hours.");
          }
        }} style={styles.logButton}>
          Log Sleep
        </Button>
      </Surface>

      {/* ✅ Meditation Tracking */}
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardHeader}>
          <Sun size={24} color={theme.colors.secondary} />
          <Text variant="titleMedium" style={styles.cardTitle}>Meditation</Text>
        </View>
        <View style={styles.cardStats}>
          <Text variant="displaySmall" style={styles.cardHighlight}>{meditationMinutes ? `${meditationMinutes}m` : '--'}</Text>
          <Text variant="bodyMedium" style={styles.cardSubtext}>Today's session</Text>
        </View>
        <TextInput
          label="Enter minutes"
          value={meditationInput}
          onChangeText={setMeditationInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button mode="contained" onPress={() => {
          const minutes = parseFloat(meditationInput);
          if (minutes > 0) {
            logMeditation(minutes);
            setMeditationInput('');
          } else {
            Alert.alert("Invalid Input", "Please enter a valid number of minutes.");
          }
        }} style={[styles.logButton, { backgroundColor: theme.colors.secondary }]}>
          Start Session
        </Button>
      </Surface>

      {/* ✅ Habit Progress */}
      <Surface style={styles.progressCard} elevation={1}>
        <Text variant="titleMedium" style={styles.progressTitle}>Today's Progress</Text>
        <View style={styles.progressStats}>
          <View style={styles.progressItem}>
            <Text variant="headlineMedium">{progress.completedCount}/{progress.totalCount}</Text>
            <Text variant="bodyMedium">Habits Done</Text>
          </View>
          <View style={styles.progressItem}>
            <Text variant="headlineMedium">{progress.streak}</Text>
            <Text variant="bodyMedium">Day Streak</Text>
          </View>
        </View>
      </Surface>

      {/* ✅ Snackbar for success message */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={1500}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
  },
  date: {
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontFamily: 'Inter-Medium',
  },
  cardStats: {
    marginBottom: 16,
    alignItems: 'center',
  },
  cardHighlight: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
  },
  progressCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  progressTitle: {
    marginBottom: 16,
    fontFamily: 'Inter-Medium',
  },
  snackbar: {
    position: 'absolute',
    bottom: '50%',
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
  },
  input: {
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // ✅ Light gray with slight transparency
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
});
