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
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialDark,
  materialLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

function AiMultiModels() {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const { aiSelectedModels, setAiSelectedModels, message, setMessage } =
    useContext(AiSelectedModelContext);

  // ✅ Corrected onToggleChange function
  const onToggleChange = (modelName, value) => {
    // update local list state
    setAiModelList((prev) =>
      prev.map((m) => (m.model === modelName ? { ...m, enable: value } : m))
    );

    // update global context state safely
    setAiSelectedModels((prev) => ({
      ...prev,
      [modelName]: {
        ...(prev?.[modelName] ?? {}),
        enable: value,
      },
    }));
  };

  // ✅ Proper model selection handler
  const onSelectedValue = async (parentModel, value) => {
    const updatedPref = {
      ...aiSelectedModels,
      [parentModel]: { modelId: value },
    };

    const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);

    try {
      await updateDoc(docRef, { selectedModelPref: updatedPref });
    } catch (error) {
      if (error.code === "not-found") {
        await setDoc(
          docRef,
          { selectedModelPref: updatedPref },
          { merge: true }
        );
      } else {
        console.error("Firestore update error:", error);
      }
    }
  };

  return (
    <div className="flex flex-1 h-[75vh] border-b">
      {aiModelList?.map((model, index) => (
        <div
          key={index}
          className={`flex flex-col border-r h-full overflow-auto
            ${model.enable ? "flex-1 min-w-[400px]" : "w-[100px] flex-none"}`}
        >
          {/* Header Section */}
          <div className="flex w-full h-[70px] items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Image
                src={model.icon}
                alt={model.model}
                width={24}
                height={24}
              />

              {model.enable && (
                <Select
                  defaultValue={aiSelectedModels?.[model.model]?.modelId}
                  onValueChange={(value) => onSelectedValue(model.model, value)}
                  disabled={model.premium}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={aiSelectedModels?.[model.model]?.modelId}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-gray-400">Free</SelectLabel>
                      {model.subModel.map(
                        (submodel, id) =>
                          !submodel.premium && (
                            <SelectItem key={id} value={submodel.id}>
                              {submodel.name}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>

                    <SelectGroup className="px-3">
                      <SelectLabel className="text-gray-400">
                        Premium
                      </SelectLabel>
                      {model.subModel.map(
                        (submodel, idx) =>
                          submodel.premium && (
                            <SelectItem
                              key={idx}
                              value={submodel.name}
                              disabled
                            >
                              {submodel.name}{" "}
                              {submodel.premium && (
                                <LockIcon className="w-4 h-4" />
                              )}
                            </SelectItem>
                          )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Toggle switch / icon */}
            {model.enable ? (
              <Switch
                checked={model.enable}
                onCheckedChange={(v) => onToggleChange(model.model, v)}
              />
            ) : (
              <MessageSquare
                onClick={() => onToggleChange(model.model, true)}
              />
            )}
          </div>

          {/* Locked view */}
          {model.premium && model.enable && (
            <div className="flex items-center justify-center h-full">
              <Button>
                <Lock /> Upgrade to unlock
              </Button>
            </div>
          )}

          {/* Chat messages */}
          {model.enable && (
            <div className="flex-1 p-4 space-y-2">
              {message?.[model.model]?.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-md ${
                    m.role === "user"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {m.role === "assistant" && (
                    <span className="text-sm text-gray-400">
                      {m.model ?? model.model}
                    </span>
                  )}
                  <div className="flex gap-3 items-center">
                    {m.content === "Thinking..." && (
                      <>
                        <Loader className="animate-spin" />{" "}
                        <span>Thinking...</span>
                      </>
                    )}
                  </div>
                  {m.content !== "Thinking..." && (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={materialDark} // choose VS Code-like theme
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="bg-gray-100 rounded p-1 font-mono text-sm"
                              {...props}
                            >
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
