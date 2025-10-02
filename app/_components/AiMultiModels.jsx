"use client";
import React, { useState } from "react";
import AiModelList from "./../../shared/AiModelList";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

function AiMultiModels() {
  const [aiModelList, setAiModelList] = useState(AiModelList);

  // Proper state update
  const onToggleChange = (modelName, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === modelName ? { ...m, enable: value } : m))
    );
  };

  return (
    <div className="flex flex-1 h-[75vh] border-b">
      {aiModelList?.map((model, index) => (
        <div
          key={index}
          className={`flex flex-col border-r h-full overflow-auto
            ${model.enable ? "flex-1 min-w-[400px]" : "w-[100px] flex-none"}`}
        >
          <div className="flex w-full h-[70px] items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Image
                src={model.icon}
                alt={model.model}
                width={24}
                height={24}
              />

              {model.enable && (
                <Select defaultValue={model.subModel[0]?.name}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select submodel" />
                  </SelectTrigger>
                  <SelectContent>
                    {model.subModel.map((submodel, idx) => (
                      <SelectItem key={idx} value={submodel.name}>
                        {submodel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

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
        {model.premium&&model.enable&&  <div className="flex items-center justify-center h-full">
          <Button><Lock /> Upgrade to unlock</Button>
          </div>}
        </div>
      ))}
    </div>
  );
}

export default AiMultiModels;
