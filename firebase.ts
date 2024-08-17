import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFQIMDiuZrt4eAZzd1yqO5vVemb1HbiCA",
  authDomain: "drawlys-notifications.firebaseapp.com",
  projectId: "drawlys-notifications",
  storageBucket: "drawlys-notifications.appspot.com",
  messagingSenderId: "421597835625",
  appId: "1:421597835625:web:32b670de64a88e8876cdf8",
  measurementId: "G-ZJWHJGD2YW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
