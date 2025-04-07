"use client";

import { useEffect } from "react";
import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps } from "firebase/app";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      // Initialize Analytics on client-side only
      const firebaseConfig = {
        apiKey: "AIzaSyCkIag00HQANMU0iB_u1nDiARogD-s5YDI",
        authDomain: "makeportfolio-2bd67.firebaseapp.com",
        projectId: "makeportfolio-2bd67",
        storageBucket: "makeportfolio-2bd67.firebasestorage.app",
        messagingSenderId: "480588264480",
        appId: "1:480588264480:web:7fa57d1e6a1e22f84bf845",
        measurementId: "G-9NRDMGH57J"
      };

      // Get the Firebase app instance or initialize it
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      
      // Initialize analytics
      getAnalytics(app);
      
      console.log("Firebase Analytics initialized");
    } catch (error) {
      console.error("Error initializing Firebase Analytics:", error);
    }
  }, []);

  return <>{children}</>;
} 