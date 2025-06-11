import { Text, View } from 'react-native';
import React from 'react';
import moment from 'moment'; 
export default function TodayProgress() {
  return (
    <View
      style={{
        marginTop: 15,
        padding: 15,
        backgroundColor:'#FFF2EB',
        borderRadius:10
      }}
    >
      <View   style={{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'

      }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          Today's Goal
        </Text>
        <Text
         style={{
            fontSize:18
         }}
        >{moment().format('MMM DD, YY')}</Text>
      </View>
      <Text style={{
        fontSize:30 ,
        fontWeight:'bold',
        textAlign:'center',
        marginTop:10,
        color:'#52357B'
      }}
      >1500/2000</Text>
      <Text style={{
        textAlign:'center',
        marginTop:2,
        fontSize:16
      }}>You'r doing great</Text>
      <View style={{
        backgroundColor:'gray',
        borderRadius:99,
         height:10,
        marginTop:15,
        opacity:0.7

      }}
      >
        <View style={{
        backgroundColor:'#52357B',
        width:'70%',
        height:10,
        borderRadius:99,
       
        }}></View>
      </View>
      <View>
        <Text>Calories Consumes</Text>
        <Text>Keep it up!🔥</Text>
      </View>
    </View>
  );
}
