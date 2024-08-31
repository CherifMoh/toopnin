importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyDyFIybEpZrroHDpHnyiLb3X7DusBuTfL0",
  authDomain: "toopnin.firebaseapp.com",
  projectId: "toopnin",
  storageBucket: "toopnin.appspot.com",
  messagingSenderId: "68238425120",
  appId: "1:68238425120:web:4e929ef233de9ce0b11045",
  measurementId: "G-S05NM7G6PH"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: "https://drawlys.com:8444/images/logo.png",
    data: { url: payload.data.link },
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
