import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SLEEP_KEY = "@sleepData";
const MEDITATION_KEY = "@meditationData";

export function useStats() {
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [meditationMinutes, setMeditationMinutes] = useState<number | null>(null);

  useEffect(() => {
    loadSleep();
    loadMeditation();
  }, []);

  const logSleep = async (hours: number) => {
    setSleepHours(hours);
    await AsyncStorage.setItem(SLEEP_KEY, JSON.stringify(hours));
  };

  const loadSleep = async () => {
    const storedSleep = await AsyncStorage.getItem(SLEEP_KEY);
    if (storedSleep) setSleepHours(JSON.parse(storedSleep));
  };

  const logMeditation = async (minutes: number) => {
    setMeditationMinutes(minutes);
    await AsyncStorage.setItem(MEDITATION_KEY, JSON.stringify(minutes));
  };

  const loadMeditation = async () => {
    const storedMeditation = await AsyncStorage.getItem(MEDITATION_KEY);
    if (storedMeditation) setMeditationMinutes(JSON.parse(storedMeditation));
  };

  return { sleepHours, logSleep, meditationMinutes, logMeditation };
}
