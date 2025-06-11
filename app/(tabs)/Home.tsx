import { UserContext } from "@/context/UserContext";
import React, { useContext, useEffect } from "react";
import { Image, Text, View } from "react-native";
import HomeHader from "../components/HomeHader";
import { useRouter } from "expo-router";
import TodayProgress from "../components/TodayProgress";
import GenerateRecipe from "../components/GenerateRecipe"
export default function Home() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;
  // console.log("mmmmm");
  // console.log(user);
  //   const router = useRouter();
  //   useEffect(() => {
  //     if (!user?.height) {
  //       router.replace("/NewUser/Index");
  //     }
  //   }, [user]);
  return (
    <View
      style={{
       padding:20
      }}
    >
      <HomeHader/>
      <TodayProgress/>
      <GenerateRecipe/>
    </View>
  );
}
