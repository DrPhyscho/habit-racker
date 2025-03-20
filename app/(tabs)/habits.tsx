import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Platform, TouchableOpacity } from "react-native";
import { Text, FAB, Surface, useTheme, Button, IconButton, Snackbar } from "react-native-paper";
import { useHabits } from "../../hooks/useHabits";
import { Link, useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import { format } from "date-fns";

export default function HabitsScreen() {
  const theme = useTheme();
  const { habits, loadHabits, completeHabit, deleteHabit } = useHabits();
  const [refreshing, setRefreshing] = useState(false);
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  }, []);

  const handleCompleteHabit = async (habitId: string, habitFrequency: string[]) => {
    if (!completedHabitIds.includes(habitId)) {
      await completeHabit(habitId);
      setCompletedHabitIds((prev) => [...prev, habitId]);
      if (habitFrequency.length === 7) {
        setSnackbarVisible(true);
      }
    }
  };

  // ✅ Function to format reminder time
  const formatReminderTime = (isoString: string | null) => {
    if (!isoString) return "No Reminder";
    try {
      const date = new Date(isoString);
      return format(date, "hh:mm a"); // ✅ Formats time as "08:30 AM"
    } catch (error) {
      console.error("Error formatting reminder time:", error);
      return "Invalid Time";
    }
  };

  // ✅ Function to format creation date
  const formatCreationDate = (isoString: string | null) => {
    if (!isoString) return "Unknown Date";
    try {
      const date = new Date(isoString);
      return format(date, "MMMM dd, yyyy"); // ✅ Formats as "March 20, 2025"
    } catch (error) {
      console.error("Error formatting creation date:", error);
      return "Invalid Date";
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
        contentInset={{ bottom: 100 }}
        contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === "ios" ? 140 : 120 }]}
        ListHeaderComponent={<View style={styles.listHeader} />}
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

              {/* ✅ Display Reminder Time */}
              {item.reminderTime && (
                <Text variant="bodySmall" style={styles.reminderText}>
                  ⏰ Reminder: {formatReminderTime(item.reminderTime)}
                </Text>
              )}

              {/* ✅ Display Creation Date */}
              {item.createdAt && (
                <Text variant="bodySmall" style={styles.creationText}>
                  📅 Created on: {formatCreationDate(item.createdAt)}
                </Text>
              )}

              {/* ✅ Buttons Row (Mark as Done & Delete) */}
              <View style={styles.buttonRow}>
                {isCompleted ? (
                  <Text style={styles.completedText}>✅ Completed</Text>
                ) : (
                  <Button mode="contained" onPress={() => handleCompleteHabit(item.id, item.frequency)} style={styles.completeButton}>
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

      {/* ✅ Floating Action Button (FAB) */}
      <Link href="/habits/new" asChild>
        <TouchableOpacity>
          <FAB icon={() => <Plus color="white" size={24} />} label="Add Habit" style={styles.fab} />
        </TouchableOpacity>
      </Link>

      {/* ✅ Snackbar for Daily Habits */}
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={1500} style={styles.snackbar}>
        ✅ Done for today!
      </Snackbar>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  listHeader: {
    height: 50,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  habitCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  habitName: {
    fontFamily: "Inter-SemiBold",
    marginBottom: 4,
  },
  habitDescription: {
    color: "#64748b",
    marginBottom: 8,
  },
  frequencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  dayIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  reminderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  creationText: {
    marginTop: 4,
    fontSize: 12,
    color: "#4b5563",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
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
    position: "absolute",
    margin: 16,
    right: 16,
    bottom: 100,
    backgroundColor: "#bb33ff",
    color: "white",
  },
  snackbar: {
    position: "absolute",
    bottom: "50%",
    alignSelf: "center",
    backgroundColor: "#4CAF50",
  },
  listContent: {
    paddingBottom: 140,
  },
});

export default HabitsScreen;
