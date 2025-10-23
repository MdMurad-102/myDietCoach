import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import ProgressDashboard from "@/app/components/ProgressDashboard";

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
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
