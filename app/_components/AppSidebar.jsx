"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function AppSidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className=" flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src={"/logo.svg"}
                alt="..."
                width={60}
                height={60}
                className="w-[40px] h-[50px]"
              />
              <h2 className="font-bold text-xl">BenchAI</h2>
            </div>
            <div>
              {theme === "light" ? (
                <Button
                  className={"cursor-pointer"}
                  variant={"ghost"}
                  onClick={() => setTheme("dark")}
                >
                  <Sun />
                </Button>
              ) : (
                <Button
                  className={"cursor-pointer"}
                  variant={"ghost"}
                  onClick={() => setTheme("light")}
                >
                  {" "}
                  <Moon />{" "}
                </Button>
              )}
            </div>
          </div>
          <Button className={"mt-7 w-full"} size={"lg"}>
            + New Chat
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className={"p-3"}>
            <h2 className="font-bold text-lg">Chat</h2>
            <p className="text-sm text-gray-400">
              Sign in to start chating with multiple model
            </p>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-3 mb-10">
          <Button className={"w-full"} size={"lg"}>
            Sign In/Sign Up
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
