"use client";

import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";
import React from "react";
import AiMultiModels from "./AiMultiModels";

function ChatInputBox() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Top content */}
      <div className="flex-1">
        <AiMultiModels />
      </div>

      {/* Chat input at bottom */}
      <div className="sticky bottom-0 left-0 w-full flex justify-center px-4 pb-4 bg-white/80 backdrop-blur-md">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-3 flex flex-col gap-3">
          {/* Input field */}
          <input
            type="text"
            className="border-0 outline-none w-full px-2 py-2 rounded-md bg-transparent"
            placeholder="Ask me anything..."
          />

          {/* Buttons row */}
          <div className="flex justify-between items-center">
            <Button size="icon" variant="ghost">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex gap-3">
              <Button size="icon" variant="ghost">
                <Mic className="h-5 w-5" />
              </Button>
              <Button size="icon" className="bg-gray-500 text-white">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
