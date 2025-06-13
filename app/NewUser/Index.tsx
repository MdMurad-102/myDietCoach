import Prom from "@/context/Prom";
import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { CalculateCalories } from "@/service/AiModel";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useContext, useState } from "react";
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

  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");

  const { user, setUser } = context;
  const updateTask = useMutation(api.Users.updateTask);

  const onContinue = async () => {
    const ageNumber = parseInt(age);
    if (!weight || !height || !gender || !goal || !age) {
      Alert.alert("Enter all details to continue");
      return;
    }

    if (isNaN(ageNumber) || ageNumber < 10 || ageNumber > 110) {
      Alert.alert("Please enter a valid age between 10 and 110.");
      return;
    }

    const data = {
      id: user?._id,
      weight: weight,
      height: height,
      age: age,
      gender: gender,
      goal: goal,
    };

    const PROMPT = JSON.stringify(data) + Prom.CALORIESANDPRO;
    const AiCalculate = await CalculateCalories(PROMPT);
    const AIResult = AiCalculate;

    let removeJso = null;
    if (AIResult) {
      removeJso = JSON.parse(
        AIResult.replace("```json", " ").replace("```", " ")
      );
    } else {
      Alert.alert("AI result is missing or invalid.");
      return;
    }
    console.log("AI Result:", removeJso);
    console.log(user) ;
    const { calories, proteins } = removeJso;

    if (!user?._id) {
      Alert.alert("User ID is missing. Make sure user is logged in.");
      return;
    }

    try {
      await updateTask({
        id: user._id,
        weight,
        height,
        gender,
        goal,
        age,
        calories,
        proteins,
      });

      setUser({
        ...user,
        weight,
        height,
        gender,
        goal,
        age,
        calories,
        proteins,
      });

      // Navigate directly without alert
      router.replace("/(tabs)/Home");
    } catch (err) {
      console.error("Update failed", err);
      Alert.alert("Error", "Failed to update preferences.");
    }
    router.replace("/(tabs)/Home");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Tell us about yourself</Text>
        <Text style={styles.subHeader}>
          This helps us personalize your meal plan
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
          <Button Data={"Continue"} onPress={onContinue} />
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
  },
});
