import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type ButtonProps = {
  Data: string;
  onPress: () => void;
  color?: string;
  loading?: boolean;
};

export default function Button({
  Data,
  onPress,
  color = "#56ab2f",
  loading = false,
}: ButtonProps) {
  const handlePress = () => {
    if (loading) {
      return;
    }
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        padding: 15,
        backgroundColor: loading ? "#cccccc" : color,
        width: "100%",
        alignItems: "center",
        borderRadius: 16,
        elevation: 3, // Add shadow for Android
        shadowColor: "#000", // Add shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      }}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={{ fontSize: 20, color: "white", fontWeight: "600" }}>
          {Data}
        </Text>
      )}
    </TouchableOpacity>
  );
}
