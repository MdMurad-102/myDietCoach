import ProgressDashboard from "@/app/components/ProgressDashboard";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";

export default function ProgressScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <ProgressDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
});
