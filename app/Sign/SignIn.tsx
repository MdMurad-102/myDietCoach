import { UserContext } from "@/context/UserContext";
import { isUserProfileComplete } from "@/utils/userHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authenticateUser, getUser } from "../../service/api";
import React, { useContext, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// ...existing imports

export default function SignIn() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const router = useRouter();
  const context = useContext(UserContext);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { setUser } = context;

  const onSignIn = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    (async () => {
      try {
        const authUser = await authenticateUser(email, password);
        console.log('Authenticated user:', authUser);
        const userData = await getUser(email);

        if (!userData) {
          Alert.alert('Error', 'User data not found.');
          return;
        }

        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          weight: userData.weight,
          height: userData.height,
          gender: userData.gender,
          goal: userData.goal,
          age: userData.age,
          calories: userData.calories,
          proteins: userData.proteins,
          country: userData.country,
          city: userData.city,
          diet_type: userData.diet_type,
          daily_water_goal: userData.waterGoal || 8,
          credit: 0,
        });

        Alert.alert('Success', 'Login Successful');
        if (isUserProfileComplete(userData)) {
          router.replace('/(tabs)/Home');
        } else {
          router.replace('/NewUser/Index');
        }
      } catch (err: any) {
        console.error('Login error:', err);
        Alert.alert('Login Failed', err.message || 'Failed to login');
      }
    })();
  };

  const showOrNot = () => setshowpassword((prev) => !prev);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIGN IN</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={20}
          color="#777"
          style={styles.icon}
        />
        <TextInput
          placeholder="email"
          style={styles.input}
          value={email}
          onChangeText={setemail}
          underlineColorAndroid="transparent"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#777"
          style={styles.icon}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showpassword}
          underlineColorAndroid="transparent"
        />
        <TouchableOpacity onPress={showOrNot}>
          <Ionicons
            name={showpassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.registerText}>
        Don’t have an account?{" "}
        <Text
          style={styles.registerLink}
          onPress={() => router.push("/Sign/SignUp")}
        >
          Register Here
        </Text>
      </Text>
      <TouchableOpacity style={styles.loginButton} onPress={onSignIn}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 220,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#999",
    borderBottomWidth: 1,
    marginBottom: 25,
    paddingVertical: 4,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  registerText: {
    textAlign: "left",
    marginBottom: 30,
    color: "#444",
  },
  registerLink: {
    color: "purple",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
