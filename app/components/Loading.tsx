import { View, Text, Modal, ActivityIndicator } from "react-native";
import React from "react";

type LoadingProps = {
  loading?: boolean;
};

const Loading: React.FC<LoadingProps> = ({ loading =false }:LoadingProps) => {
  if (!loading) return null; // Don't show if not loading

  return (
    <Modal transparent={true} visible={loading}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            padding: 20,
            borderRadius: 15,
            backgroundColor: "black",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} color={"white"} />
        </View>
        <Text
          style={{
            color: "white",
            fontSize: 16,
            marginTop: 10,
            fontWeight: "bold",
          }}
        >
          Loading...
        </Text>
      </View>
    </Modal>
  );
};

export default Loading;
