import { useContext, useEffect } from "react";
import { View , Text,Image } from "react-native";
import { UserContext } from "@/context/UserContext";
import { useConvex } from 'convex/react';
import { routeToScreen } from "expo-router/build/useScreens";
import { router } from "expo-router";
export default function Home(){
const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");

  const { user } = context;
    return(
        <View style={{
            display:'flex',
            flexDirection:'row',
            alignItems:"center",
            gap:10
        }}>
            <Image source={require('../../assets/images/image1.png')}
            style={{
                width:60,
                height:60,
                borderRadius:99 
            }}/>
          <View>
              <Text  style={{
                fontSize:20
              }}
              >Hello👋</Text>
             <Text  style={{
                fontSize:23,
                fontWeight:'bold'
             }}
             >{user?.name}</Text>
          </View>
        </View>
    )
}