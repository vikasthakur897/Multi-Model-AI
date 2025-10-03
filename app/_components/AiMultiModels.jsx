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
import { Lock, LockIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/nextjs";

function AiMultiModels() {
 
  const {user} =useUser();

  const [aiModelList, setAiModelList] = useState(AiModelList);
  const {aiSelectedModels, setAiSelectedModels} = useContext(AiSelectedModelContext)
  // Proper state update
  const onToggleChange = (modelName, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === modelName ? { ...m, enable: value } : m))
    );
  };

  const onSelectedValue = async (parentModel, value) => {
  const updatedPref = {
    ...aiSelectedModels,
    [parentModel]: { modelId: value }
  };

  const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);

  try {
    await updateDoc(docRef, {
      selectedModelPref: updatedPref
    });
  } catch (error) {
    if (error.code === "not-found") {
      // doc doesn't exist → create it
      await setDoc(docRef, { selectedModelPref: updatedPref }, { merge: true });
    } else {
      throw error;
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
          <div className="flex w-full h-[70px] items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Image
                src={model.icon}
                alt={model.model}
                width={24}
                height={24}
              />

              {model.enable && (
                <Select defaultValue={aiSelectedModels[model.model].modelId} onValueChange={(value) => onSelectedValue(model.model,value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={aiSelectedModels[model.model].modelId} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className='px-3'>
                      <SelectLabel className={'text-gray-400'}>Free</SelectLabel>
                    {model.subModel.map((submodel, id) => submodel.premium == false && (
                      <SelectItem key={id} value={submodel.id}>
                        {submodel.name}
                      </SelectItem>
                    ))}
                    </SelectGroup>

                    <SelectGroup className='px-3'>
                      <SelectLabel className={'text-gray-400'}>Premium</SelectLabel>
                    {model.subModel.map((submodel, idx) => submodel.premium == true && (
                      <SelectItem key={idx} value={submodel.name} disabled={submodel.premium}>
                        {submodel.name} {submodel.premium && <LockIcon className="w-4 h-4" />}
                      </SelectItem>
                    ))}
                    </SelectGroup>
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
