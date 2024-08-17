importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyBFQIMDiuZrt4eAZzd1yqO5vVemb1HbiCA",
  authDomain: "drawlys-notifications.firebaseapp.com",
  projectId: "drawlys-notifications",
  storageBucket: "drawlys-notifications.appspot.com",
  messagingSenderId: "421597835625",
  appId: "1:421597835625:web:32b670de64a88e8876cdf8",
  measurementId: "G-ZJWHJGD2YW",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const link = payload.data?.link || 'https://drawlys.com/admin/orders';
  const notificationTitle = payload.notification?.title || payload.data?.title;
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body,
    icon: payload.notification?.icon || payload.data?.icon || "https://drawlys.com:8444/images/logo.png",
    data: { url: link },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw.js] Notification click received.", event);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      const url = event.notification.data.url;

      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        console.log("Opening window with URL:", url);
        return clients.openWindow(url);
      }
    })
  );
});
