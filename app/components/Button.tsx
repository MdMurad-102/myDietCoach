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
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 15,
        backgroundColor: color,
        width: "100%",
        display: "flex",
        alignItems: "center",
        borderRadius: 16,
        opacity: loading ? 0.7 : 1, // slightly dim when loading
      }}
      disabled={loading} // disable button when loading
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={{ fontSize: 20, color: "white" }}>{Data}</Text>
      )}
    </TouchableOpacity>
  );
}
