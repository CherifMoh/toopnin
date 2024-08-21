import { clsx } from "clsx"
import { twMerge } from 'tailwind-merge'; // Import the necessary functions from their respective libraries
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/shared/Card";

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

export async function checkBlackliste(ip) {
  try {
    let formattedIp = ip;

    // Handle IPv6 addresses like ::ffff:127.0.0.1 or ::1
    if (formattedIp.startsWith('::ffff:')) {
        formattedIp = formattedIp.split('::ffff:')[1];
    } else if (formattedIp === '::1') {
        formattedIp = '127.0.0.1';
    }

    
    const response = await fetch(`https://toopnin.com/api/orders/ip?ip=${formattedIp}`);
    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      console.error('Failed to fetch IP check:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}
