import { UserContext } from "@/context/UserContext";
import { auth } from "@/service/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useContext } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const context = useContext(UserContext);
  const router = useRouter();

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user, setUser } = context;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            setUser(null);
            Alert.alert("Success", "You have been logged out successfully");
            router.replace("/Sign/SignIn");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleLogin = () => {
    router.push("/Sign/SignIn");
  };

  const handleSignUp = () => {
    router.push("/Sign/SignUp");
  };

  const handleEditProfile = () => {
    router.push("/NewUser/Index");
  };

  // If user is not logged in, show login/signup options
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
          <Text style={styles.notLoggedInTitle}>Welcome to My Diet Coach</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Please login or create an account to access your profile and
            personalized meal plans
          </Text>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Ionicons name="person-add-outline" size={20} color="#4CAF50" />
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If user is logged in, show profile information
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.picture ? (
            <Image source={{ uri: user.picture }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle" size={80} color="#4CAF50" />
          )}
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Profile Information</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="scale-outline" size={24} color="#4CAF50" />
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{user.weight || "Not set"}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="resize-outline" size={24} color="#FF9800" />
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{user.height || "Not set"}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={24} color="#2196F3" />
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{user.age || "Not set"}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="male-female-outline" size={24} color="#E91E63" />
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{user.gender || "Not set"}</Text>
          </View>
        </View>
      </View>

      {/* Goals & Nutrition */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Goals & Nutrition</Text>

        <View style={styles.goalCard}>
          <Ionicons name="flag-outline" size={20} color="#4CAF50" />
          <Text style={styles.goalLabel}>Goal:</Text>
          <Text style={styles.goalValue}>{user.goal || "Not set"}</Text>
        </View>

        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionValue}>{user.calories || 0}</Text>
            <Text style={styles.nutritionLabel}>Daily Calories</Text>
          </View>
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionValue}>{user.proteins || 0}g</Text>
            <Text style={styles.nutritionLabel}>Daily Protein</Text>
          </View>
        </View>
      </View>

      {/* Location & Diet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Location & Diet</Text>

        <View style={styles.locationCard}>
          <Ionicons name="location-outline" size={20} color="#FF5722" />
          <Text style={styles.locationText}>
            {user.city && user.country
              ? `${user.city}, ${user.country}`
              : "Location not set"}
          </Text>
        </View>

        <View style={styles.dietCard}>
          <Ionicons name="restaurant-outline" size={20} color="#8BC34A" />
          <Text style={styles.dietText}>
            Diet Type: {user.dietType || "Not specified"}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Account Actions</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={20} color="#2196F3" />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings-outline" size={20} color="#FF9800" />
          <Text style={styles.actionButtonText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={20} color="#9C27B0" />
          <Text style={styles.actionButtonText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={[styles.actionButtonText, styles.logoutText]}>
            Logout
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  notLoggedInSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  signUpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4CAF50",
    width: "100%",
    justifyContent: "center",
  },
  signUpButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  goalLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    marginRight: 5,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    flex: 1,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nutritionCard: {
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  dietCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f8e9",
    padding: 15,
    borderRadius: 10,
  },
  dietText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#F44336",
  },
  bottomSpacing: {
    height: 30,
  },
});
