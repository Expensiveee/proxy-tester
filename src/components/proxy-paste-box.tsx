"use client";

import { useState, useTransition } from "react";
import { useProxyTesterStore } from "@/store/proxy";
import { normalizeProxy } from "@/lib/utils";
import { type Proxy } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react"; // For visual feedback
import { Button } from "./ui/button";

export default function ProxyPasteBox() {
  // 1. Get the new 'replaceAllProxies' action and isLoading state
  const { replaceAllProxies, isLoading } = useProxyTesterStore();

  // 2. Local state for the textarea's value. This updates instantly.
  const [text, setText] = useState("");

  // 3. isPending is true while the background update (the transition) is running.
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // A. Update the local state immediately for a responsive input field.
    setText(value);

    // B. Start a non-blocking UI transition to process the text.
    startTransition(() => {
      // This code runs in the background. It will not block the user's typing.
      const rawProxies = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const newProxies: Proxy[] = rawProxies
        .map((raw, index) => {
          const formatted = normalizeProxy(raw);
          if (!formatted) return null;
          return {
            position: index,
            raw,
            formatted,
            status: "pending",
          } as Proxy;
        })
        .filter((p): p is Proxy => p !== null);

      // C. Replace the entire store list with the newly parsed list.
      replaceAllProxies(newProxies);
    });
  };

  return (
    <div className="relative">
      <Textarea
        onChange={handleChange}
        value={text}
        className="min-h-[200px] w-full resize-none border border-white/10 p-4"
        disabled={isLoading} // Disable if a test is running
        placeholder={
          "Here are some example formats:\n" +
          "- user:pass@host:port\n" +
          "- user:pass:host:port\n" +
          "- host:port:user:pass\n" +
          "- host:port\n" +
          "- All the above formats with or without a protocol prefix (http://, https://, socks5://, etc.)\n"
        }
      />
      {/* 4. Provide visual feedback that the parsing is happening in the background */}
      {isPending && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}
