import { clsx } from "clsx"
import { removeToken } from "../actions/users"
import { twMerge } from 'tailwind-merge'; // Import the necessary functions from their respective libraries
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/shared/Card";
import axios from "axios";

// Define the cn function
export function cn(...inputs) {
  return twMerge(clsx(inputs)); // Use clsx and twMerge to merge class names
}

export function DashboardCard({ title, subtitle, body }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {body}
      </CardContent>
    </Card>
  );
}

export function formatNumberWithCommas(number) {
  // Convert number to string
  let numStr = number.toString();

  // Split into integer and decimal parts
  let [integerPart, decimalPart] = numStr.split('.');

  // Add commas to integer part
  let formattedIntegerPart = '';
  for (let i = integerPart.length - 1, count = 0; i >= 0; i--) {
    formattedIntegerPart = integerPart[i] + formattedIntegerPart;
    count++;
    if (count % 3 === 0 && i !== 0) {
      formattedIntegerPart = ',' + formattedIntegerPart;
    }
  }

  // Combine integer and decimal parts
  let formattedNumber = decimalPart ? formattedIntegerPart + '.' + decimalPart : formattedIntegerPart;

  return formattedNumber;
}

export function generateUniqueString(length) {
  if (!length) length = 17;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsLength);
    result += chars[randomIndex];
  }
  return result;
}

export async function handleSendNotification(title, message, link) {
  try {
    const res = await axios.get('/api/users');
    const Users = res.data;

    let AllTokens = [];

    Users.forEach(user => {
      if (!Array.isArray(user.fcmTokens) || user.fcmTokens.length === 0) return;
      user.fcmTokens.forEach(fcmToken => {
        AllTokens.push({ userId: user._id, token: fcmToken });
      });
    });

    const notificationPromises = AllTokens.map(async ({ userId, token }) => {
      try {
        const response = await axios.post("/api/send-notification", {
          token: token,
          title: title,
          message: message,
          link: link,
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(response.data);
      } catch (error) {
        console.error("Error sending notification:", error);

        if (error.response && error.response.data.error === "Invalid token") {
          // Remove the invalid token from the user's fcmTokens array
          await removeToken(userId,token)
        }
      }
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

