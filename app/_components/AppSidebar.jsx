"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Moon, Plus, Sun, User2, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import UsageCreaditProgress from "./UsageCreaditProgress";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import moment from "moment";
import Link from "next/link";
import axios from "axios";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import PricingModal from "./PricingModal";

function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState([]);
  const [freeMsgCount, setFreeMsgCount] = useState(0);
  const { message } = useContext(AiSelectedModelContext);

  const { isSignedIn } =  useAuth();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (user) GetChatHistory();
  }, [user]);

  useEffect(() => {
    if (user) GetRemainingTokenMsgs();
  }, [message]);

  const GetChatHistory = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "chatHistory"),
        where("userEmail", "==", user?.primaryEmailAddress?.emailAddress)
      );
      const querySnapshot = await getDocs(q);
      const chats = [];
      querySnapshot.forEach((doc) => chats.push(doc.data()));
      setChatHistory(chats);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const GetRemainingTokenMsgs = async () => {
    try {
      const result = await axios.post("/api/user-remaning-msg", { token: 0 });
      setFreeMsgCount(result?.data?.remainingToken ?? 0);
    } catch (err) {
      console.error("Error getting remaining tokens:", err);
    }
  };

  const GetLastUserMessageFromChat = (chats) => {
    const allMessages = Object.values(chats.message || {}).flat();
    const userMessages = allMessages.filter((msg) => msg.role === "user");
    const lastUserMsg =
      userMessages[userMessages.length - 1]?.content || "No messages yet";
    const formattedDate = moment(chats.lastUpdated || Date.now()).fromNow();

    return {
      chatId: chats.chatId,
      message: lastUserMsg,
      lastMsgDate: formattedDate,
    };
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src={"/logo.svg"}
                alt="BenchAI Logo"
                width={60}
                height={60}
                className="w-[40px] h-[50px]"
              />
              <h2 className="font-bold text-xl">BenchAI</h2>
            </div>

            {mounted && (
              <Button
                variant="ghost"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Sun /> : <Moon />}
              </Button>
            )}
          </div>

          {user ? (
            <Link href={"/"}>
              <Button className="mt-7 w-full" size="lg">
                <Plus /> New Chat
              </Button>
            </Link>
          ) : (
            <SignInButton>
              <Button className="mt-7 w-full" size="lg">
                <Plus /> New Chat
              </Button>
            </SignInButton>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chat</h2>
            {!user && (
              <p className="text-sm text-gray-400">
                Sign in to start chatting with multiple models
              </p>
            )}

            {chatHistory.map((chat, index) => {
              const last = GetLastUserMessageFromChat(chat);
              return (
                <Link
                  href={`?chatId=${last.chatId}`}
                  key={index}
                  className="mt-2 block"
                >
                  <div className="hover:bg-gray-100 p-3 rounded-2xl cursor-pointer">
                    <h2 className="text-sm text-gray-400">
                      {last.lastMsgDate}
                    </h2>
                    <h2 className="text-lg line-clamp-1">{last.message}</h2>
                  </div>
                  <hr className="my-3" />
                </Link>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">
          {!user ? (
            <SignInButton mode="modal">
              <Button className="w-full" size="lg">
                Sign In/Sign Up
              </Button>
            </SignInButton>
          ) : (
            <div>
              {!isSignedIn && user?.publicMetadata?.plan !== "unlimited_plan" && (
                <div>
                  <UsageCreaditProgress remainingToken={freeMsgCount} />
                  <PricingModal>
                    <Button className="w-full mb-3">
                      <Zap /> Upgrade Plan
                    </Button>
                  </PricingModal>
                </div>
              )}

              <Button className="flex w-full" variant="ghost">
                <User2 /> <span>Settings</span>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
