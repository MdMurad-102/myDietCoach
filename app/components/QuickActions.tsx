import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function QuickActions() {
  const router = useRouter();

  const quickActionItems = [
    {
      id: "generate",
      title: "Generate Recipe",
      icon: "sparkles",
      color: "#FF6B6B",
      onPress: () => router.push("/recipeGenerator" as any),
    },
    {
      id: "meals",
      title: "View Meals",
      icon: "restaurant",
      color: "#96CEB4",
      onPress: () => router.push("/(tabs)/Meals"),
    },
    {
      id: "progress",
      title: "My Progress",
      icon: "trending-up",
      color: "#45B7D1",
      onPress: () => router.push("/Progress"),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {quickActionItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.actionCard, { borderLeftColor: item.color }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color + "20" },
              ]}
            >
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={styles.actionTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  actionsContainer: {
    paddingRight: 20,
  },
  actionCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    alignItems: "center",
    minWidth: 100,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});
