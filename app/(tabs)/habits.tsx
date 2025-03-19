import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, RefreshControl, Platform } from 'react-native';
import { Text, FAB, Surface, useTheme, Button, IconButton, Snackbar } from 'react-native-paper';
import { useHabits } from '../../hooks/useHabits';
import { Plus } from 'lucide-react-native';
import { Link, useFocusEffect } from 'expo-router';

export default function HabitsScreen() {
  const theme = useTheme();
  const { habits, loadHabits, completeHabit, deleteHabit } = useHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // ✅ Auto-refresh when switching tabs
  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  // ✅ Pull-to-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  }, []);

  const handleCompleteHabit = async (habitId: string, habitFrequency: string[]) => {
    if (!completedHabitIds.includes(habitId)) {
      await completeHabit(habitId);
      setCompletedHabitIds(prev => [...prev, habitId]); // ✅ Persist completed state
      if (habitFrequency.length === 7) {
        setSnackbarVisible(true); // ✅ Show "Done for today" popup if it's a daily habit
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled" // ✅ Allows tapping buttons when keyboard is open
        contentInset={{ bottom: 100 }} // ✅ iOS fix for bottom navigation bar overlap
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === 'ios' ? 140 : 120 }, // ✅ Prevents bottom bar blocking buttons
        ]}
        ListHeaderComponent={<View style={styles.listHeader} />} // ✅ Adds space for iPhone notch
        renderItem={({ item }) => {
          const isCompleted = completedHabitIds.includes(item.id);

          return (
            <Surface style={styles.habitCard} elevation={1}>
              <Text variant="titleMedium" style={styles.habitName}>{item.name}</Text>
              <Text variant="bodyMedium" style={styles.habitDescription}>{item.description}</Text>

              {/* ✅ Frequency Display */}
              <View style={styles.frequencyContainer}>
                {item.frequency.map((day, index) => (
                  <View key={index} style={styles.dayIndicator}>
                    <Text style={styles.dayText}>{day[0]}</Text>
                  </View>
                ))}
              </View>

              {/* ✅ Buttons Row (Mark as Done & Delete) */}
              <View style={styles.buttonRow}>
                {isCompleted ? (
                  <Text style={styles.completedText}>✅ Completed</Text>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => handleCompleteHabit(item.id, item.frequency)}
                    style={styles.completeButton}
                  >
                    Mark as Done
                  </Button>
                )}
                <IconButton icon="delete" iconColor="red" size={24} onPress={() => deleteHabit(item.id)} />
              </View>
            </Surface>
          );
        }}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No habits yet. Start by adding one!</Text>
          </View>
        }
      />

      <Link href="/habits/new" asChild>
        <FAB
          icon={() => <Plus color="white" size={24} />}
          label="Add Habit"
          style={styles.fab}
        />
      </Link>

      {/* ✅ Snackbar for Daily Habits */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        style={styles.snackbar}
      >
        ✅ Done for today!
      </Snackbar>
    </View>
  );
}

// ✅ Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listHeader: {
    height: 50, // ✅ Adds space for iPhone notch (Prevents first habit from being hidden)
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  habitCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  habitName: {
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  habitDescription: {
    color: '#64748b',
    marginBottom: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // ✅ Ensures habits wrap properly
    gap: 8,
    marginTop: 4,
  },
  dayIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8, // ✅ Adjusted to prevent cutoff
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    flexGrow: 1,
  },
  completedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 100, // ✅ Moves the FAB up so it’s not blocked
  },
  snackbar: {
    position: "absolute",
    bottom: "50%",
    alignSelf: "center",
    backgroundColor: "#4CAF50",
  },
  listContent: {
    paddingBottom: 140, // ✅ Prevents bottom navigation overlap
  },
});

export default HabitsScreen;