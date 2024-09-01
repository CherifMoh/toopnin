import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require("../../../../service_key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(request: NextRequest) {
  const { token, title, message, link } = await request.json();

  const payload: Message = {
    token,
    data: {
      title: title,
      body: message,
      icon: 'https://drawlys.com:8444/images/logo.png',
      link: link || 'https://toopnin.com/admin/orders',
    },
    webpush: {
      fcmOptions: {
        link: link || 'https://toopnin.com/admin/orders',
      },
    },
  };

  console.log("Sending payload:", payload);

  try {
    await admin.messaging().send(payload);
    return NextResponse.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    console.error("Error sending notification:", error);
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      // Handle invalid token by returning a specific error message
      return NextResponse.json({ success: false, error: "Invalid token" });
    }
    return NextResponse.json({ success: false, error });
  }
}               
