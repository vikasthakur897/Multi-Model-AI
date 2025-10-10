"use client";

import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import AiMultiModels from "./AiMultiModels";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const { aiSelectedModels, message, setMessage } = useContext(AiSelectedModelContext);
  const params = useSearchParams();
  const { user } = useUser();
  const chatExists = useRef(false);

  // ✅ Determine if user is a paid user
  const paidUser = user?.publicMetadata?.plan === "unlimited_plan";

  // ✅ Fetch or create chat ID
  useEffect(() => {
    const idFromParams = params.get("chatId");
    setChatId(idFromParams || uuidv4());
  }, [params]);

  // ✅ Load existing chat messages from Firestore
  useEffect(() => {
    if (chatId) GetMessages();
  }, [chatId]);

  const GetMessages = async () => {
    if (!chatId) return;
    try {
      const docRef = doc(db, "chatHistory", chatId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMessage(docSnap.data().message || {});
        chatExists.current = true;
      } else {
        chatExists.current = false;
      }
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  };

  // ✅ Auto-save messages when they change
  useEffect(() => {
    if (message && chatId && chatExists.current) {
      SaveMessages();
    }
  }, [message]);

  const SaveMessages = async () => {
    if (!chatId) return;
    try {
      await setDoc(
        doc(db, "chatHistory", chatId),
        {
          chatId,
          message,
          userEmail: user?.primaryEmailAddress?.emailAddress || "anonymous",
          lastUpdated: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  };

  // ✅ Handle message send
  const handleSend = async () => {
    if (!userInput.trim()) return;

    try {
      if (!paidUser) {
        const result = await axios.post("/api/user-remaning-msg", { token: 1 });
        const remainingToken = result?.data?.remainingToken;
        if (remainingToken <= 0) {
          toast.error("Maximum Daily Limit Exceeded");
          return;
        }
      }
    } catch {
      toast.error("Token validation failed");
      return;
    }

    const currentInput = userInput;
    setUserInput("");

    // 1️⃣ Add user message to all enabled models
    setMessage((prev) => {
      const updated = { ...prev };
      Object.entries(aiSelectedModels).forEach(([modelKey, modelValue]) => {
        if (modelValue.enable) {
          updated[modelKey] = [
            ...(updated[modelKey] ?? []),
            { role: "user", content: currentInput },
          ];
        }
      });
      return updated;
    });

    chatExists.current = true;

    // 2️⃣ Fetch AI response for enabled models
    for (const [parentModel, modelInfo] of Object.entries(aiSelectedModels)) {
      if (!modelInfo?.modelId || !modelInfo?.enable) continue;

      setMessage((prev) => ({
        ...prev,
        [parentModel]: [
          ...(prev[parentModel] ?? []),
          { role: "assistant", content: "Thinking...", model: parentModel, loading: true },
        ],
      }));

      try {
        const res = await axios.post("/api/ai-multi-model", {
          model: modelInfo.modelId,
          msg: [{ role: "user", content: currentInput }],
          parentModel,
        });

        const { aiResponse, model } = res.data;

        setMessage((prev) => {
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
        setMessage((prev) => ({
          ...prev,
          [parentModel]: [
            ...(prev[parentModel] ?? []),
            { role: "assistant", content: "⚠️ Error fetching response." },
          ],
        }));
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1">
        <AiMultiModels />
      </div>

      <div className="sticky bottom-0 left-0 w-full flex justify-center px-4 pb-4">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-3 flex flex-col gap-3 backdrop-blur-md">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="border-0 outline-none w-full px-2 py-2 rounded-md"
            placeholder="Ask me anything..."
          />
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
