"use client";

import React, { useEffect, useState } from "react";
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
import { SignInButton, useUser } from "@clerk/nextjs";
import UsageCreaditProgress from "./UsageCreaditProgress";

function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

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

            {/* Prevent hydration mismatch */}
            {mounted && (
              <div>
                {theme === "light" ? (
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    onClick={() => setTheme("dark")}
                  >
                    <Sun />
                  </Button>
                ) : (
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    onClick={() => setTheme("light")}
                  >
                    <Moon />
                  </Button>
                )}
              </div>
            )}
          </div>

        {user ? <Button className="mt-7 w-full" size="lg">
            <Plus /> New Chat
          </Button> : 
          <SignInButton>
            <Button className="mt-7 w-full" size="lg">
            <Plus /> New Chat
          </Button> 
          </SignInButton> }  
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chat</h2>
          {!user&&<p className="text-sm text-gray-400">
              Sign in to start chatting with multiple models
            </p>}  
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">
        {!user ?  <SignInButton mode="modal">
          <Button className="w-full" size="lg">
            Sign In/Sign Up
          </Button>
          </SignInButton> : 

          <div >
            <UsageCreaditProgress/>
            <Button className={'w-full mb-3'}>
             <Zap /> Upgrade Plan
            </Button>
          <Button className="flex w-full" variant={'ghost'}>
            <User2 /> <h2>Settings</h2>
          </Button>
          </div> } 
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
