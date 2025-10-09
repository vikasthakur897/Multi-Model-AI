"use client";
import React, { useContext, useState } from "react";
import AiModelList from "./../../shared/AiModelList";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader, Lock, LockIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function AiMultiModels() {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const { aiSelectedModels, setAiSelectedModels, message } = useContext(AiSelectedModelContext);

  // ✅ Toggle model activation
  const onToggleChange = (modelName, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === modelName ? { ...m, enable: value } : m))
    );

    setAiSelectedModels((prev) => ({
      ...prev,
      [modelName]: {
        ...(prev?.[modelName] ?? {}),
        enable: value,
      },
    }));
  };

  // ✅ Handle selected sub-model
  const onSelectedValue = async (parentModel, value) => {
    if (!user) return;

    const updatedPref = {
      ...aiSelectedModels,
      [parentModel]: { modelId: value },
    };

    const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, { selectedModelPref: updatedPref });
      } else {
        await setDoc(docRef, { selectedModelPref: updatedPref }, { merge: true });
      }
    } catch (error) {
      console.error("Firestore update error:", error);
    }
  };

  return (
    <div className="flex flex-1 h-[75vh] border-b">
      {aiModelList?.map((model, index) => (
        <div
          key={index}
          className={`flex flex-col border-r h-full overflow-auto ${
            model.enable ? "flex-1 min-w-[400px]" : "w-[100px] flex-none"
          }`}
        >
          {/* Header */}
          <div className="flex w-full h-[70px] items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Image src={model.icon} alt={model.model} width={24} height={24} />

              {model.enable && (
                <Select
                  defaultValue={aiSelectedModels?.[model.model]?.modelId}
                  onValueChange={(value) => onSelectedValue(model.model, value)}
                  disabled={model.premium}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={aiSelectedModels?.[model.model]?.modelId || "Select model"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-gray-400">Free</SelectLabel>
                      {model.subModel
                        .filter((s) => !s.premium)
                        .map((submodel, id) => (
                          <SelectItem key={id} value={submodel.id}>
                            {submodel.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>

                    <SelectGroup className="px-3">
                      <SelectLabel className="text-gray-400">Premium</SelectLabel>
                      {model.subModel
                        .filter((s) => s.premium)
                        .map((submodel, idx) => (
                          <SelectItem key={idx} value={submodel.name} disabled>
                            {submodel.name} <LockIcon className="w-4 h-4 inline" />
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            {model.enable ? (
              <Switch checked={model.enable} onCheckedChange={(v) => onToggleChange(model.model, v)} />
            ) : (
              <MessageSquare onClick={() => onToggleChange(model.model, true)} className="cursor-pointer" />
            )}
          </div>

          {/* Locked model */}
          {model.premium && model.enable && (
            <div className="flex items-center justify-center h-full">
              <Button>
                <Lock /> Upgrade to unlock
              </Button>
            </div>
          )}

          {/* Chat */}
          {model.enable && (
            <div className="flex-1 p-4 space-y-2">
              {message?.[model.model]?.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-md ${
                    m.role === "user" ? "bg-gray-100 text-gray-900" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {m.role === "assistant" && (
                    <span className="text-sm text-gray-400">{m.model ?? model.model}</span>
                  )}

                  {m.content === "Thinking..." ? (
                    <div className="flex gap-3 items-center">
                      <Loader className="animate-spin" /> <span>Thinking...</span>
                    </div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={materialDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-gray-100 rounded p-1 font-mono text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AiMultiModels;
