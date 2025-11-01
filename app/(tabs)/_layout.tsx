import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#9e9e9e",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Meals"
        options={{
          tabBarLabel: "Meals",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="food-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ProReport"
        options={{
          tabBarLabel: "Report",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AIChat"
        options={{
          tabBarLabel: "AI Nutritionist",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Meals_BACKUP"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}
