import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, TextInput, Snackbar, useTheme } from 'react-native-paper';
import { Moon, Sun, TrendingUp } from 'lucide-react-native';
import { format } from 'date-fns';
import { useStats } from '../../hooks/useStats';
import { useHabits } from '../../hooks/useHabits';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const theme = useTheme();
  const today = new Date();
  const { sleepHours, logSleep, meditationMinutes, logMeditation } = useStats();
  const { habits, progress, loadHabits, completeHabit } = useHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [sleepInput, setSleepInput] = useState('');
  const [meditationInput, setMeditationInput] = useState('');
  const [greeting, setGreeting] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userName, setUserName] = useState("User");

  // ✅ Load user name and habits when the screen is focused
  const loadData = useCallback(async () => {
    try {
      const savedName = await AsyncStorage.getItem("user_name");
      if (savedName) {
        setUserName(savedName);
      }
      await loadHabits(); // Load habits as well
    } catch (error) {
      console.error("Failed to load data:", error);
      // Optionally, show an error message
    }
  }, [loadHabits]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(); // Use loadData here
    setRefreshing(false);
  }, [loadData]);

  const handleLogSleep = () => {
    const hours = parseFloat(sleepInput);
    if (hours > 0) {
      logSleep(hours);
      setSleepInput('');
      setShowSnackbar(true);
      setSnackbarMessage('Sleep logged successfully!');
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number of hours.");
    }
  };

  const handleLogMeditation = () => {
    const minutes = parseFloat(meditationInput);
    if (minutes > 0) {
      logMeditation(minutes);
      setMeditationInput('');
      setShowSnackbar(true);
      setSnackbarMessage('Meditation logged successfully!');
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number of minutes.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          {greeting}, {userName}
        </Text>
        <Text variant="bodyLarge" style={styles.date}>
          {format(today, 'EEEE, MMMM d')}
        </Text>
      </View>

      {/* Progress Card */}
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardHeader}>
          <TrendingUp size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.cardTitle}>Your Progress</Text>
        </View>
        <View style={styles.cardStats}>
          <View style={styles.progressItem}>
            <Text variant="headlineMedium">{progress.completedCount}/{progress.totalCount}</Text>
            <Text variant="bodyMedium">Habits Done</Text>
          </View>
          <View style={styles.progressItem}>
            <Text variant="headlineMedium">{progress.streak}</Text>
            <Text variant="bodyMedium">Current Streak</Text>
          </View>
        </View>
      </Surface>

      {/* Sleep Tracking */}
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardHeader}>
          <Moon size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.cardTitle}>Sleep Tracking</Text>
        </View>
        <View style={styles.cardStats}>
          <Text variant="displaySmall" style={styles.cardHighlight}>
            {sleepHours ? `${sleepHours}h` : '--'}
          </Text>
          <Text variant="bodyMedium" style={styles.cardSubtext}>Last night's sleep</Text>
        </View>
        <TextInput
          label="Enter hours"
          value={sleepInput}
          onChangeText={setSleepInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity onPress={handleLogSleep} disabled={!sleepInput.trim()} style={styles.saveButton}>
          <LinearGradient
            colors={["#8B48FF", "#E539F5", "#30C5FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Log Sleep</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Surface>

      {/* Meditation Tracking */}
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardHeader}>
          <Sun size={24} color={theme.colors.secondary} />
          <Text variant="titleMedium" style={styles.cardTitle}>Meditation</Text>
        </View>
        <View style={styles.cardStats}>
          <Text variant="displaySmall" style={styles.cardHighlight}>
            {meditationMinutes ? `${meditationMinutes}m` : '--'}
          </Text>
          <Text variant="bodyMedium" style={styles.cardSubtext}>Today's session</Text>
        </View>
        <TextInput
          label="Enter minutes"
          value={meditationInput}
          onChangeText={setMeditationInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity onPress={handleLogMeditation} disabled={!meditationInput.trim()} style={styles.saveButton}>
          <LinearGradient
            colors={["#FF8C48", "#FF3C5F", "#FFBA30"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Start Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Surface>

      {/* Snackbar for success message */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={1500}
        style={styles.snackbar}
      >
        <Text>{snackbarMessage}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardHighlight: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
  },
  snackbar: {
    position: 'absolute',
    bottom: '50%',
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
  },
  input: {
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  progressItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
});