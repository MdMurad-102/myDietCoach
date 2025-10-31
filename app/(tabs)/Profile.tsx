import { UserContext } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import MealTimeSettings from "../components/MealTimeSettings";
import ProfileHeader from "../components/ProfileHeader";

export default function Profile() {
  const context = useContext(UserContext);
  const router = useRouter();

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user, setUser } = context;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        style: "destructive",
        onPress: () => {
          setUser(null);
          router.replace("/");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
          <Text style={styles.notLoggedInTitle}>Welcome!</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Login or create an account to manage your profile.
          </Text>
          <Button
            title="Login or Sign Up"
            onPress={() => router.push("/Sign/SignIn")}
            variant="primary"
            icon="log-in-outline"
          />
        </View>
      </View>
    );
  }

  const menuItems = [
    {
      title: "Edit Profile",
      icon: "create-outline",
      screen: "/NewUser/Index",
      color: "#3498db",
    },
    {
      title: "AI Nutritionist",
      icon: "chatbubbles-outline",
      screen: "/AIChat",
      color: "#9b59b6",
    },
    {
      title: "Settings",
      icon: "settings-outline",
      screen: "/settings",
      color: "#f39c12",
    },
    {
      title: "Help & Support",
      icon: "help-circle-outline",
      screen: "/support",
      color: "#e74c3c",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProfileHeader user={user} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="scale-outline"
            label="Weight"
            value={user.weight || "N/A"}
            unit="kg"
            color="#2ecc71"
          />
          <StatCard
            icon="resize-outline"
            label="Height"
            value={user.height || "N/A"}
            unit="cm"
            color="#3498db"
          />
          <StatCard
            icon="body-outline"
            label="Age"
            value={user.age || "N/A"}
            unit="yrs"
            color="#9b59b6"
          />
          <StatCard
            icon="male-female-outline"
            label="Gender"
            value={user.gender || "N/A"}
            color="#e91e63"
          />
        </View>
      </View>

      <View style={styles.section}>
        <MealTimeSettings />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.screen as any)}
          >
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: `${item.color}20` },
              ]}
            >
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={22} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          icon="log-out-outline"
        />
      </View>
    </ScrollView>
  );
}

const StatCard = ({ icon, label, value, unit, color }: any) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>
      {value} {unit}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  notLoggedInSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  logoutContainer: {
    margin: 16,
    marginTop: 20,
    marginBottom: 40,
  },
});
