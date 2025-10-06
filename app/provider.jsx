"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { DefaultModel } from "@/shared/AiModels";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children, ...props }) {
  const { user } = useUser();
  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel);
  const [userDetail, setUserDetail] = useState();
  const [message, setMessage] = useState();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      CreateNewUser();
    }
  }, [user]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && aiSelectedModels) {
      updatedAIModelSelectionPref();
    }
  }, [aiSelectedModels]);

  // ✅ Update AI Model Preferences by email
  const updatedAIModelSelectionPref = async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    const docRef = doc(db, "users", email);

    try {
      await updateDoc(docRef, { selectedModelPref: aiSelectedModels });
    } catch (error) {
      // If document doesn't exist, create it
      if (error.code === "not-found") {
        await setDoc(
          docRef,
          { selectedModelPref: aiSelectedModels },
          { merge: true }
        );
      } else {
        console.error("Firestore update error:", error);
      }
    }
  };

  // ✅ Create new user document using email as ID
  const CreateNewUser = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("Existing User...");
        const userInfo = userSnap.data();
        setAiSelectedModels(userInfo?.selectedModelPref ?? DefaultModel);
        setUserDetail(userInfo);
        return;
      }

      const userData = {
        name: user.fullName,
        email: email,
        createdAt: new Date(),
        remainingMsg: 5,
        plan: "Free",
        credits: 100,
        selectedModelPref: DefaultModel,
      };

      await setDoc(userRef, userData);
      console.log("New User Data Saved ✅");
      setUserDetail(userData);
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
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        <AiSelectedModelContext.Provider
          value={{
            aiSelectedModels,
            setAiSelectedModels,
            message,
            setMessage,
          }}
        >
          <SidebarProvider>
            <AppSidebar />
            <div className="w-full">
              <AppHeader />
              {children}
            </div>
          </SidebarProvider>
        </AiSelectedModelContext.Provider>
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
}

export default Provider;
