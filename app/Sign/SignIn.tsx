import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { auth } from "@/service/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useConvex } from "convex/react";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export default function SignIn() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const convex = useConvex();
  const context = useContext(UserContext);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { setUser } = context;

  const onSignIn = () => {
    if (!email || !password) {
      Alert.alert("Enter Correct email or password");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const firebaseUser = userCredential.user;

        // Fetch full user from Convex
        const userData = await convex.query(api.Users.GetUser, {
          email: email,
        });

        if (!userData) {
          Alert.alert("User not found in Convex");
          return;
        }

        // ✅ Fully load into UserContext
        setUser(userData);

        Alert.alert("Login Successful");

        // ✅ Navigation happens after setting UserContext
        if (!userData.height) {
          router.replace("/NewUser/Index");
        } else {
          router.replace("/(tabs)/Home");
        }
      })
      .catch((error) => {
        console.error("Login error:", error.message);
        Alert.alert("Login Failed", error.message);
      });
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
          onPress={() => router.push("./signUp")}
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
})