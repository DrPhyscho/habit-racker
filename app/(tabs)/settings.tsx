import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load the saved name when the screen is opened
  useEffect(() => {
    const loadName = async () => {
      try {
        const savedName = await AsyncStorage.getItem("user_name");
        if (savedName) {
          setName(savedName);
        }
      } catch (error) {
        console.error("Failed to load name:", error);
        Alert.alert("Error", "Failed to load your name. Please check your storage.");
      }
    };
    loadName();
  }, []);

  // ✅ Save the new name
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem("user_name", name.trim());
      Alert.alert("Success", "Your name has been updated!");
    } catch (error) {
      console.error("Failed to save name:", error);
      Alert.alert("Error", "Failed to save your name. Please check your storage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Profile Settings
      </Text>

      <Text variant="bodyMedium" style={styles.label}>
        Update your name
      </Text>
      <TextInput
        label="Your Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading || !name.trim()}
        style={styles.saveButton}
      >
        Save Changes
      </Button>
    </View>
  );
}

// ✅ Styles for a clean UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#64748b",
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#bb33ff"
  },
});