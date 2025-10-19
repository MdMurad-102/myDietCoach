import { UserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Image, Text, View } from "react-native";
export default function Home() {
  const context = useContext(UserContext);
  const router = useRouter();
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");

  const { user } = context;
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Image
        source={require("../../assets/images/image1.png")}
        style={{
          width: 60,
          height: 60,
          borderRadius: 99,
        }}
      />
      <View>
        <Text
          style={{
            fontSize: 20,
          }}
        >
          Hello👋
        </Text>
        <Text
          style={{
            fontSize: 23,
            fontWeight: "bold",
          }}
        >
          {user?.name}
        </Text>
      </View>
    </View>
  );
}
