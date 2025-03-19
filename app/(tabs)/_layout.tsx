import { Tabs } from 'expo-router';
import { Chrome as Home, ChartLine as LineChart, Settings, Plus } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 65, // ✅ Increased height for better spacing
          paddingBottom: 10, // ✅ Added more padding for readability
          paddingTop: 8,
          bottom: 15, // ✅ Raised the tab bar 15px higher
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          elevation: 5, // ✅ Adds a subtle shadow for visibility
        },
        tabBarLabelStyle: {
          fontSize: 14, // ✅ Ensures labels remain readable
          marginBottom: 6,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <LineChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
