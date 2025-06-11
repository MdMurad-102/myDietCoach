import { Text, TouchableOpacity, StyleSheet } from "react-native";

type ButtonProps = {
    Data: string;
    onPress: () => void;
};

export default function Button({ Data, onPress }: ButtonProps) {
    return (
        <TouchableOpacity onPress={onPress} style={{
            padding:15,
            backgroundColor:'#56ab2f',
            width:'100%',
            display:'flex',
            alignItems:'center',
            borderRadius:16
        }}>
            <Text style={{
                fontSize:20 ,
                color:'white'
            }}>{Data}</Text>
        </TouchableOpacity>
    )
}
