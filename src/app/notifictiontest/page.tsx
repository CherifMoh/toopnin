"use client";

import { useState } from "react";
import useFcmToken from "../../hooks/useFcmToken";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";


async function fetchUsers() {
  const res = await axios.get('/api/users');
  return res.data;
}

export default function Home() {

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const { token, notificationPermissionStatus } = useFcmToken();
  const [action, setAction] = useState<string>('');

  if(isLoading)return <div>Loading...</div>
  if(isError)return <div>{`Error:${error.message}`}</div>

  

  let AllTokens =[ ]

  users.forEach(user => {
    if(!Array.isArray(user.fcmTokens) || user.fcmTokens.lenght === 0) return
    user.fcmTokens.forEach(fcmToken => {
      AllTokens.push(fcmToken)
    })
  });

  const handleTestNotification = async () => {

    AllTokens.forEach(async (token) => {
      console.log(token)
      try{
        const response = await fetch("api/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            title: "Test Notification",
            message: "This is a test notification",
            link: "/admin/orders",
          }),
        });
    
        const data = await response.json();
        console.log(data);
      }catch(error){
        console.error("Error sending notification:", error);
      }
    })
  
  };

  return (
    <main className="p-10">
      <h1 className="text-4xl mb-4 font-bold">Firebase Cloud Messaging Demo</h1>

      {notificationPermissionStatus === "granted" ? (
        <p>Permission to receive notifications has been granted.</p>
      ) : notificationPermissionStatus !== null ? (
        <p>
          You have not granted permission to receive notifications. Please
          enable notifications in your browser settings.
        </p>
      ) : null}

      {/* {action && <p>{action}</p>} */}
      {token && <p>{token}</p>}

      <button
        disabled={!token}
        className="mt-5 bg-black text-white rounded-lg text-center px-8 py-4"
        onClick={()=>{
          handleTestNotification()
          setAction('clicked')
        }}
      >
        Send Test Notification
      </button>
    </main>
  );
}
