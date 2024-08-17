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
    notification: {
      title: title,
      body: message,
      imageUrl: 'https://drawlys.com:8444/images/logo.png',
    },
    data: {
      link: link || 'https://drawlys.com/admin/orders',
    },
    webpush: {
      fcmOptions: {
        link: link || 'https://drawlys.com/admin/orders',
      },
    },
  };

  console.log("Sending payload:", payload);

  try {
    await admin.messaging().send(payload);
    return NextResponse.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ success: false, error });
  }
}
