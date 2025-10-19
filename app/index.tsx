import { UserContext } from "@/context/UserContext";
import { getUser } from "@/service/api";
import { isUserProfileComplete } from "@/utils/userHelpers";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { Dimensions, Image, Text, View } from "react-native";
import Button from "./components/Button";

export default function Index() {
  const router = useRouter();
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { user, setUser } = context;

  useEffect(() => {
    // Restore user from localStorage (mock session) - only on web
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    (async () => {
      try {
        const stored = localStorage.getItem('mydietcoach_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          const lastUser = parsed.users && parsed.users[parsed.users.length - 1];
          if (lastUser && lastUser.email) {
            const userData = await getUser(lastUser.email);
            if (userData) {
              setUser(userData);
              if (isUserProfileComplete(userData)) {
                router.replace("/(tabs)/Home");
              } else {
                router.replace("/NewUser/Index");
              }
            }
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      }
    })();
  }, [setUser, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("./../assets/images/food.jpg")}
        style={{
          width: "100%",
          height: Dimensions.get("screen").height,
        }}
      />
      <View
        style={{
          position: "absolute",
          height: Dimensions.get("screen").height,
          backgroundColor: "#0707075e",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Image
          source={require("./../assets/images/logo.png")}
          style={{
            width: 150,
            height: 150,
            marginTop: 100,
            opacity: 0.5,
          }}
        />
        <Text
          style={{
            fontSize: 30,
            fontWeight: "bold",
            color: "white",
            marginTop: 30,
          }}
        >
          Eat Smart, Live Better
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: "white",
            marginHorizontal: 20,
            marginTop: 15,
            opacity: 0.8,
          }}
        >
          Get your personalized diet plan and goal powered by AI.
        </Text>
      </View>
      <View
        style={{
          position: "absolute",
          width: "100%",
          bottom: 25,
          padding: 20,
        }}
      >
        <Button
          Data={"Get Started → "}
          onPress={() => router.push("/Sign/SignIn")}
        />
      </View>
    </View>
  );
}
