import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { Text, TextInput, Button, Checkbox, useTheme } from "react-native-paper";
import { useHabits } from "../../../hooks/useHabits";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function NewHabitScreen() {
  const theme = useTheme();
  const { addHabit } = useHabits();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [everyDay, setEveryDay] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a habit name");
      setShowError(true);
      return;
    }

    if (selectedDays.length === 0) {
      setError("Please select at least one day");
      setShowError(true);
      return;
    }

    const success = await addHabit({
      name: name.trim(),
      description: description.trim(),
      frequency: selectedDays,
      reminderTime: reminderTime.toISOString(),
    });

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
    } else {
      setError("Failed to save habit. Please try again.");
      setShowError(true);
    }
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setSelectedDays([]);
    setReminderTime(new Date());
    setEveryDay(false);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleEveryDay = () => {
    if (everyDay) {
      setSelectedDays([]);
      setEveryDay(false);
    } else {
      setSelectedDays(DAYS);
      setEveryDay(true);
    }
  };

  return (
    <View style={styles.fullScreen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            New Habit
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Habit Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Frequency
          </Text>

          <View style={styles.dayRow}>
            <Checkbox
              status={everyDay ? "checked" : "unchecked"}
              onPress={toggleEveryDay}
            />
            <Text onPress={toggleEveryDay} style={styles.dayLabel}>
              Every Day
            </Text>
          </View>

          <View style={styles.daysContainer}>
            {DAYS.map((day) => (
              <View key={day} style={styles.dayRow}>
                <Checkbox
                  status={selectedDays.includes(day) ? "checked" : "unchecked"}
                  onPress={() => toggleDay(day)}
                />
                <Text onPress={() => toggleDay(day)} style={styles.dayLabel}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* ✅ Time Picker */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Reminder Time
          </Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.timePickerText}>
              {reminderTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </TouchableOpacity>

          {/* ✅ Modal for iOS Time Picker to prevent auto-closing */}
          {Platform.OS === "ios" && showPicker && (
            <Modal transparent={true} visible={showPicker} animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    display="spinner"
                    textColor="black" // ✅ Forces black text
                    themeVariant="light" // ✅ Ensures proper contrast
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setReminderTime(selectedTime);
                      }
                    }}
                  />
                  <Button mode="contained" onPress={() => setShowPicker(false)}>
                    Done
                  </Button>
                </View>
              </View>
            </Modal>
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            disabled={!name.trim()}
          >
            Create Habit
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 120,
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
    color: "#000",
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  sectionTitle: {
    marginBottom: 12,
    fontFamily: "Inter-SemiBold",
    color: "#000",
  },
  daysContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  dayLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#000",
  },
  timePickerButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  timePickerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});


export default NewHabitScreen;
