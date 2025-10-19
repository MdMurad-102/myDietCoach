import React from "react";
import { View, StyleSheet } from "react-native";
import ProgressDashboard from "../components/ProgressDashboard";

export default function Progress() {
  return (
    <View style={styles.container}>
      <ProgressDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
