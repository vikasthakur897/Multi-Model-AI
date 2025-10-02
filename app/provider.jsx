"use client";

import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";

function Provider({ children, ...props }) {
  const { user } = useUser();

  useEffect(() => {
    if (user?.id && user?.primaryEmailAddress?.emailAddress) {
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    try {
      const userRef = doc(db, "users", user.id); // use Clerk userId instead of email
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("Existing User...");
        return;
      }

      const userData = {
        name: user.fullName,
        email: user.primaryEmailAddress.emailAddress,
        createdAt: new Date(),
        remainingMsg: 5,
        plan: "Free",
        credits: 100,
      };

      await setDoc(userRef, userData);
      console.log("New User Data Saved ✅");
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <AppHeader />
          {children}
        </div>
      </SidebarProvider>
    </NextThemesProvider>
  );
}

export default Provider;
