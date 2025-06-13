import { Background } from "@react-navigation/elements";
import { Text, View , Image, ImageBase, Dimensions} from "react-native";
import { blue } from "react-native-reanimated/lib/typescript/Colors";
import Button from "./components/Button";
import { router, useRouter } from "expo-router";
import  LoginScreen from "./Sign/signIn";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/service/firebaseConfig";
import { useContext, useEffect } from "react";
import { UserContext } from "@/context/UserContext";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
export default function Index() {
  const router = useRouter() ;
  const context = useContext(UserContext);
  const convex=useConvex() ;
  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }
  const { user, setUser } = context;

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (userInfo) => {
    if (userInfo && userInfo.email) {
      console.log(userInfo.email);
      console.log('jkjkjj')
      const userData = await convex.query(api.Users.GetUser, {
        email: userInfo.email, 
      });
      setUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        weight: userData.weight ,
        height: userData.height,
        gender: userData.gender,
        goal: userData.goal,
        age: userData.age,
        calories: userData.calories,
        proteins: userData.proteins
      });
      router.replace('/(tabs)/Home');
    }
  });

  return () => unsubscribe(); 
}, []);


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
       <Image source={require('./../assets/images/food.jpg')}
         style={{
          width:'100%',
          height:Dimensions.get('screen').height
         }}
       />  
       <View
       style={{
        position:'absolute' , 
        height:Dimensions.get('screen').height,
        backgroundColor:'#0707075e',
        width:'100%',
        display:'flex',
        alignItems:'center'
       }}>
         <Image source={require('./../assets/images/logo.png')} 
       style={{
        width:150,
        height:150 ,
        marginTop:100,
        opacity:0.5
       }} />
       <Text 
         style={{
          fontSize:30 ,
          fontWeight:'bold',
          color:'white',
          marginTop:30
         }}
       >Eat Smart, Live Better</Text>
        <Text 
         style={{
          fontSize:20 ,
          color:'white',
          marginHorizontal:20
          ,marginTop:15 ,
          opacity:0.8
         }}
       >Get your personalized diet plan and goal powered by AI.</Text>
       
       </View>
      <View  style={{
        position:'absolute' ,
        width:'100%' ,
        bottom:25 ,
        padding:20,
      }}>
      <Button Data={'Get Started → '}
      onPress={()=>router.push("./Sign/signIn")} />
      </View>
    </View>
  );
}

