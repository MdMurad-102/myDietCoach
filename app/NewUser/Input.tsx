// components/Input.tsx
import React from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

type InputProps = TextInputProps & {
  label: string;
};

export default function Input({ placeholder, label, ...props }: InputProps) {
  return (
    <View style={{ marginTop: 15, flex: 1 }}>
      <Text style={{ fontWeight: "500", marginBottom: 5 }}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        {...props}
        style={{
          padding: 15,
          borderWidth: 1,
          borderRadius: 10,
          fontSize: 18,
          width: "100%",
        }}
        keyboardType="numeric"
      />
    </View>
  );
}
