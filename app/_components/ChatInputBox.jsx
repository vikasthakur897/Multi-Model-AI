"use client";

import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import AiMultiModels from "./AiMultiModels";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const { aiSelectedModels,setAiSelectedModels, message, setMessage } = useContext(AiSelectedModelContext);
  const [chatId, setChatId] = useState();

    const { user } = useUser(); 
  
  useEffect(() => {
    setChatId(uuidv4())
  },[])
  
  // alias for consistency


  const setMessages = setMessage;

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;
    setUserInput("");

    // 1️⃣ Add user message to all enabled models only
    setMessages((prev) => {
      const updated = { ...prev };

      Object.entries(aiSelectedModels).forEach(([modelKey]) => {
        if(aiSelectedModels[modelKey].enable){
          updated[modelKey] = [
          ...(updated[modelKey] ?? []),
          { role: "user", content: userInput },
        ];
        }
        
      });

      return updated;
    });

    // 2️⃣ Make API calls for only enabled models
    Object.entries(aiSelectedModels).forEach(async ([parentModel, modelInfo]) => {
      if (!modelInfo?.modelId || aiSelectedModels[parentModel].enable==false) return; // ✅ skip disabled or missing models

      // Add temporary loading message
      setMessages((prev) => ({
        ...prev,
        [parentModel]: [
          ...(prev[parentModel] ?? []),
          { role: "assistant", content: "Thinking...", model: parentModel, loading: true },
        ],
      }));

      try {
        const result = await axios.post("/api/ai-multi-model", {
          model: modelInfo.modelId,
          msg: [{ role: "user", content: currentInput }],
          parentModel,
        });

        const { aiResponse, model } = result.data;

        // Replace loading message with AI response
        setMessages((prev) => {
          const updated = [...(prev[parentModel] ?? [])];
          const loadingIndex = updated.findIndex((m) => m.loading);

          if (loadingIndex !== -1) {
            updated[loadingIndex] = {
              role: "assistant",
              content: aiResponse,
              model,
              loading: false,
            };
          } else {
            updated.push({
              role: "assistant",
              content: aiResponse,
              model,
              loading: false,
            });
          }

          return { ...prev, [parentModel]: updated };
        });
      } catch (err) {
        console.error(`Error fetching response for ${parentModel}:`, err);
        setMessages((prev) => ({
          ...prev,
          [parentModel]: [
            ...(prev[parentModel] ?? []),
            { role: "assistant", content: "⚠️ Error fetching response." },
          ],
        }));
      }
    });
  };

  useEffect(() => {
    if(message){
      SaveMessages()
    }
  }, [message]);


  const SaveMessages = async() => {
     const  docRef = doc(db, 'chatHistory', chatId);

     await setDoc(docRef, {
      chatId: chatId,
      message: message,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      lastUpdated: Date.now()
     })
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Chat content */}
      <div className="flex-1">
        <AiMultiModels />
      </div>

      {/* Chat input at bottom */}
      <div className="sticky bottom-0 left-0 w-full flex justify-center px-4 pb-4">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-3 flex flex-col gap-3  backdrop-blur-md">
          {/* Input field */}
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="border-0 outline-none w-full px-2 py-2 rounded-md "
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
              <Button
                size="icon"
                className="bg-gray-500 text-white"
                onClick={handleSend}
              >
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
