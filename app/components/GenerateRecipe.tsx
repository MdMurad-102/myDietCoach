import { Text, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { router } from 'expo-router';
export default function TodayProgress() {
  return (
   <LinearGradient   colors={[ '#B33791' , '#C562AF' ]}
    style={{
        marginTop:15,
        padding:15,
        borderRadius:10
    }}>
    
    <Text style={{
        fontSize:20,
        fontWeight:'bold',
        color:'white'
        }}
    >Needs Meals Ideas?</Text>
    <Text
    style={{
        fontSize:18,
      
        color:'white'
        }}
    >Let's your AI Generate personalized recipes just for You!</Text>
    <Button Data={'generate recipe'}  onPress={()=>router.replace("./NewUser/Index")}/>
   </LinearGradient>
  );
}
