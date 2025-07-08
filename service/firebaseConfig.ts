// firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
} from 'firebase/auth';
import rnFirebaseAuth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

// ✅ Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyB5E2QksJ4935xOTB9uLe86isWMiv_RlEs',
  authDomain: 'mydietcoach-42554.firebaseapp.com',
  projectId: 'mydietcoach-42554',
  storageBucket: 'mydietcoach-42554.appspot.com',
  messagingSenderId: '925833061888',
  appId: '1:925833061888:web:5544315c81935895591ae5',
  measurementId: 'G-X06JYZKWZ1',
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Explicitly typed `auth`
let auth: Auth;

// ✅ Explicitly typed `auth`
let authInstance: Auth;

if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  // Use @react-native-firebase/auth for native platforms
  authInstance = rnFirebaseAuth() as unknown as Auth;
}

export { app, authInstance as auth };
