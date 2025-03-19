import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { useHabits } from "../../hooks/useHabits";
import { ProgressCircle } from "react-native-svg-charts";
import { useFocusEffect } from "expo-router";

export default function ProgressScreen() {
  const theme = useTheme();
  const { habits, progress, getWeeklyProgress, loadHabits } = useHabits();
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Auto-refresh when navigating to Progress tab
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

  // ✅ Get completed habits
  const completedHabits = habits.filter(habit => habit.completedDates.length > 0);

  // ✅ Weekly Progress Data with Late Completion Indicator
  const weeklyProgress = getWeeklyProgress();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <FlatList
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>My Progress</Text>
          </View>

          {/* ✅ Progress Overview */}
          <Surface style={styles.progressCard} elevation={1}>
            <Text variant="titleMedium" style={styles.progressTitle}>This Week's Progress</Text>
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

          {/* ✅ Weekly Progress Tracker */}
          <View style={styles.weeklyProgress}>
            {days.map((day, index) => {
              const { progress: completionRate, lateCompletions } = weeklyProgress[index] || {};
              const progressColor = lateCompletions > 0 ? "#FF9800" : completionRate >= 0.75 ? "#4CAF50" : "#e5e7eb";

              return (
                <View key={index} style={styles.progressCircleContainer}>
                  <ProgressCircle
                    style={styles.progressCircle}
                    progress={completionRate || 0}
                    progressColor={progressColor}
                    backgroundColor="#e5e7eb"
                  />
                  <Text style={styles.dayLabel}>{day}</Text>
                  {lateCompletions > 0 && <Text style={styles.lateLabel}>⚠️ Late</Text>}
                </View>
              );
            })}
          </View>
        </>
      }
      data={completedHabits}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        // ✅ Find the most recent completion
        const lastCompletion = item.completedDates[item.completedDates.length - 1];
        const isLate = lastCompletion && lastCompletion.completedDate !== lastCompletion.scheduledDate;
        return (
          <Surface style={styles.habitCard} elevation={1}>
            <Text variant="titleMedium" style={styles.habitName}>{item.name}</Text>
            <Text variant="bodyMedium" style={styles.habitDescription}>{item.description}</Text>
            <Text variant="bodySmall" style={[styles.completedText, isLate && styles.lateText]}>
              {isLate ? "⚠️ Late: " : "✅ Completed: "} {new Date(lastCompletion.completedDate).toDateString()}
            </Text>
          </Surface>
        );
      }}
      contentContainerStyle={completedHabits.length === 0 ? styles.centerContent : styles.listContent}
      ListEmptyComponent={
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No habits completed yet.</Text>
        </View>
      }
    />
  );
}

// ✅ Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontFamily: "Inter-SemiBold",
  },
  progressCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  progressTitle: {
    marginBottom: 16,
    fontFamily: "Inter-Medium",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressItem: {
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 100,
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
  completedText: {
    fontSize: 12,
    color: "#4CAF50",
  },
  lateText: {
    color: "#FF9800",
  },
  weeklyProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressCircleContainer: {
    alignItems: "center",
  },
  progressCircle: {
    width: 40,
    height: 40,
  },
  dayLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  lateLabel: {
    fontSize: 10,
    color: "#FF9800",
    marginTop: 2,
  },
});

export default ProgressScreen;
