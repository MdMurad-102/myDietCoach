import Prom from "@/context/Prom";
import { UserContext } from "@/context/UserContext";
import { updateUserProfile } from "@/service/api";
import { CalculateCalories } from "@/service/AiModel";
import { isUserProfileComplete } from "@/utils/userHelpers";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import Input from "./Input";

export default function Index() {
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [dietType, setDietType] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const initialModeSet = useRef(false);
  const router = useRouter();

  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");

  const { user, setUser } = context;

  // Pre-populate form fields with existing user data and determine mode
  useEffect(() => {
    if (user && !initialModeSet.current) {
      // Set mode only once when component first loads
      const userProfileComplete = isUserProfileComplete(user);
      setIsEditMode(userProfileComplete);
      initialModeSet.current = true;

      console.log(
        "Initial mode set:",
        userProfileComplete ? "Edit" : "New User"
      );
    }

    if (user) {
      setGender(user.gender || "");
      setGoal(user.goal || "");
      setHeight(user.height || "");
      setWeight(user.weight || "");
      setAge(user.age || "");
      setCountry(user.country || "");
      setCity(user.city || "");
      setDietType(user.diet_type || "");
    }
  }, [user]);

  // Show loading if user data is not loaded yet
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  const onContinue = async () => {
    console.log("Button pressed - onContinue called");

    const ageNumber = parseInt(age);
    console.log("Current form data:", {
      weight,
      height,
      gender,
      goal,
      age,
      country,
      city,
      dietType,
    });

    // Check each field individually for better debugging
    const missingFields = [];
    if (!weight) missingFields.push("Weight");
    if (!height) missingFields.push("Height");
    if (!gender) missingFields.push("Gender");
    if (!goal) missingFields.push("Goal");
    if (!age) missingFields.push("Age");
    if (!country) missingFields.push("Country");
    if (!city) missingFields.push("City");
    if (!dietType) missingFields.push("Diet Type");

    if (missingFields.length > 0) {
      console.log("Validation failed - missing fields:", missingFields);
      Alert.alert(
        "Missing Information",
        `Please fill in the following fields: ${missingFields.join(", ")}`
      );
      return;
    }

    if (isNaN(ageNumber) || ageNumber < 10 || ageNumber > 110) {
      console.log("Age validation failed:", ageNumber);
      Alert.alert(
        "Invalid Age",
        "Please enter a valid age between 10 and 110."
      );
      return;
    }

    console.log("Validation passed, starting update process");
    setLoading(true);

    const data = {
      id: user?.id,
      weight: weight,
      height: height,
      age: age,
      gender: gender,
      goal: goal,
      country: country,
      city: city,
      diet_type: dietType,
    };

    try {
      const PROMPT = JSON.stringify(data) + Prom.CALORIESANDPRO;
      console.log("Sending prompt to AI:", PROMPT);

      const AiCalculate = await CalculateCalories(PROMPT);
      const AIResult = AiCalculate;

      console.log("Raw AI Response:", AIResult);

      let removeJso = null;
      if (AIResult) {
        try {
          // Clean the AI response more thoroughly
          let cleanedResult = AIResult.trim();

          // Remove markdown code blocks
          cleanedResult = cleanedResult.replace(/```json\s*/g, "");
          cleanedResult = cleanedResult.replace(/```\s*/g, "");

          // Find the JSON object by looking for the first { and last }
          const firstBrace = cleanedResult.indexOf("{");
          const lastBrace = cleanedResult.lastIndexOf("}");

          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonString = cleanedResult.substring(
              firstBrace,
              lastBrace + 1
            );
            removeJso = JSON.parse(jsonString);
          } else {
            throw new Error("No valid JSON object found in AI response");
          }
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          console.error("AI Response:", AIResult);

          // Try to extract numbers from the response as a fallback
          const caloriesMatch = AIResult.match(/calories["\s:]*(\d+)/i);
          const proteinsMatch = AIResult.match(/proteins["\s:]*(\d+)/i);

          if (caloriesMatch && proteinsMatch) {
            removeJso = {
              calories: parseInt(caloriesMatch[1]),
              proteins: parseInt(proteinsMatch[1]),
            };
            console.log("Fallback extraction successful:", removeJso);
          } else {
            Alert.alert(
              "Error",
              "Failed to parse AI response. Please try again."
            );
            setLoading(false);
            return;
          }
        }
      } else {
        Alert.alert("AI result is missing or invalid.");
        setLoading(false);
        return;
      }
      console.log("AI Result:", removeJso);

      // Validate that we have the required fields
      if (
        !removeJso ||
        typeof removeJso.calories !== "number" ||
        typeof removeJso.proteins !== "number"
      ) {
        console.error("Invalid AI response structure:", removeJso);
        Alert.alert(
          "Error",
          "AI response is missing required nutrition data. Please try again."
        );
        setLoading(false);
        return;
      }

      const { calories, proteins } = removeJso;

      if (!user?.id) {
        Alert.alert("User ID is missing. Make sure user is logged in.");
        setLoading(false);
        return;
      }

      // Update database
      const updatedUserData = await updateUserProfile(user.id, {
        weight,
        height,
        gender,
        goal,
        age,
        calories,
        proteins,
        country,
        city,
        diet_type: dietType,
      });

      // Update UserContext with all new data
      setUser(updatedUserData);
      console.log("User context updated:", updatedUserData);
      console.log("Current isEditMode:", isEditMode);

      // IMMEDIATE NAVIGATION - Skip alerts for testing
      if (isEditMode) {
        console.log("IMMEDIATE: Navigating to Profile page (edit mode)");
        router.push("/(tabs)/Profile");
      } else {
        console.log("IMMEDIATE: Navigating to Home page (new user mode)");
        router.replace("/(tabs)/Home");
      }

      // Show alert after navigation as confirmation
      setTimeout(() => {
        if (isEditMode) {
          Alert.alert(
            "Success!",
            "Your profile has been updated successfully!"
          );
        } else {
          Alert.alert(
            "Welcome!",
            "Your profile has been set up successfully! Welcome to My Diet Coach!"
          );
        }
      }, 1000);
    } catch (err) {
      console.error("Update failed", err);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={true}
    >
      <View style={styles.container}>
        <Text style={styles.header}>
          {isEditMode ? "Edit Your Profile" : "Tell us about yourself"}
        </Text>
        <Text style={styles.subHeader}>
          {isEditMode
            ? "Update your information to improve your meal plan recommendations"
            : "This helps us personalize your meal plan"}
        </Text>

        <View style={styles.row}>
          <Input
            placeholder="e.g. 70"
            label="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
          />
          <Input
            placeholder="e.g. 175"
            label="Height (cm)"
            value={height}
            onChangeText={setHeight}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <Input
            placeholder="e.g. 25"
            label="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <Input
            placeholder="e.g. India"
            label="Country"
            value={country}
            onChangeText={setCountry}
          />
          <Input
            placeholder="e.g. Mumbai"
            label="City"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <Text style={styles.sectionLabel}>Diet Type</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.selectBox,
              dietType === "vegetarian" && styles.selectedBox,
            ]}
            onPress={() => setDietType("vegetarian")}
          >
            <MaterialCommunityIcons
              name="carrot"
              size={24}
              color={dietType === "vegetarian" ? "#fff" : "#4CAF50"}
            />
            <Text
              style={[
                styles.selectText,
                dietType === "vegetarian" && styles.selectedText,
              ]}
            >
              Vegetarian
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectBox,
              dietType === "non-vegetarian" && styles.selectedBox,
            ]}
            onPress={() => setDietType("non-vegetarian")}
          >
            <MaterialCommunityIcons
              name="food-drumstick"
              size={24}
              color={dietType === "non-vegetarian" ? "#fff" : "#FF5722"}
            />
            <Text
              style={[
                styles.selectText,
                dietType === "non-vegetarian" && styles.selectedText,
              ]}
            >
              Non-Vegetarian
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.selectBox, gender === "male" && styles.selectedBox]}
            onPress={() => setGender("male")}
          >
            <FontAwesome5
              name="male"
              size={24}
              color={gender === "male" ? "#fff" : "#4300FF"}
            />
            <Text
              style={[
                styles.selectText,
                gender === "male" && styles.selectedText,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectBox,
              gender === "female" && styles.selectedBox,
            ]}
            onPress={() => setGender("female")}
          >
            <FontAwesome5
              name="female"
              size={24}
              color={gender === "female" ? "#fff" : "#4300FF"}
            />
            <Text
              style={[
                styles.selectText,
                gender === "female" && styles.selectedText,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>What's Your Goal?</Text>
        <View style={styles.goalRow}>
          {[
            {
              key: "weightLoss",
              icon: "human-handsup",
              title: "Weight Loss",
              color: "#FF5252",
              desc: "Reduce body fat and get lean",
            },
            {
              key: "muscleGain",
              icon: "arm-flex",
              title: "Muscle Gain",
              color: "#43A047",
              desc: "Build strength and tone",
            },
            {
              key: "weightGain",
              icon: "food-drumstick",
              title: "Weight Gain",
              color: "#FF9800",
              desc: "Increase healthy mass",
            },
          ].map(({ key, icon, title, color, desc }) => (
            <TouchableOpacity
              key={key}
              style={[styles.goalCard, goal === key && styles.goalSelected]}
              onPress={() => setGoal(key)}
            >
              <MaterialCommunityIcons
                name={icon as any}
                size={32}
                color={goal === key ? "#fff" : color}
              />
              <Text
                style={[
                  styles.goalTitle,
                  goal === key && styles.goalTextSelected,
                ]}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.goalSubtext,
                  goal === key && styles.goalTextSelected,
                ]}
              >
                {desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            Data={isEditMode ? "Update Profile" : "Continue"}
            onPress={onContinue}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// Include your styles here as you already had them.

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
    color: "#111",
  },
  subHeader: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  selectBox: {
    flex: 1,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedBox: {
    backgroundColor: "#4300FF",
    borderColor: "#4300FF",
  },
  selectText: {
    marginTop: 8,
    color: "#4300FF",
    fontWeight: "600",
  },
  selectedText: {
    color: "#fff",
  },
  goalRow: {
    gap: 15,
    marginTop: 10,
  },
  goalCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    marginBottom: 10,
  },
  goalSelected: {
    backgroundColor: "#4300FF",
    borderColor: "#4300FF",
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#111",
  },
  goalSubtext: {
    fontSize: 14,
    color: "gray",
  },
  goalTextSelected: {
    color: "#fff",
  },
  buttonContainer: {
    marginTop: 30,
    zIndex: 1000,
    pointerEvents: "auto",
  },
});
