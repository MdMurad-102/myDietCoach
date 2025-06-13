
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyB5E2QksJ4935xOTB9uLe86isWMiv_RlEs',
  authDomain: 'mydietcoach-42554.firebaseapp.com',
  projectId: 'mydietcoach-42554',
  storageBucket: 'mydietcoach-42554.appspot.com',
  messagingSenderId: '925833061888',
  appId: '1:925833061888:web:5544315c81935895591ae5',
  measurementId: 'G-X06JYZKWZ1',
};

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
export { app, auth };
