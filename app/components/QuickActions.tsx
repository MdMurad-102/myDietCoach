import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QuickActions() {
  const router = useRouter();
  const { colors } = useTheme();

  const quickActionItems = [
    {
      id: "generate",
      title: "Generate Recipe",
      icon: "sparkles",
      colors: ["#FF6B6B", "#FF8E53"],
      onPress: () => router.push("/recipeGenerator"),
    },
    {
      id: "daily-plan",
      title: "Daily Plan",
      icon: "calendar",
      colors: ["#667eea", "#764ba2"],
      onPress: () => router.push("/dailyMealPlan"),
    },
    {
      id: "meals",
      title: "View Meals",
      icon: "restaurant",
      colors: ["#96CEB4", "#45B7D1"],
      onPress: () => router.push("/(tabs)/Meals"),
    },
    {
      id: "progress",
      title: "My Progress",
      icon: "trending-up",
      colors: ["#8E44AD", "#9B59B6"],
      onPress: () => router.push("/Progress"),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Ionicons name="flash" size={24} color="#667eea" />
        <Text style={[styles.title, { color: colors.text }]}>Quick Actions</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {quickActionItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <LinearGradient colors={item.colors as [string, string]} style={styles.actionCard}>
              <Ionicons name={item.icon as any} size={32} color="#fff" />
              <Text style={styles.actionTitle}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  actionsContainer: {
    paddingLeft: 8,
    paddingRight: 16,
  },
  actionCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    minHeight: 120,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
  },
});
