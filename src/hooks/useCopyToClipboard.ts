"use client";
import { useState } from "react";

const useCopyToClipboard = (): [boolean, (text: string) => void] => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = (text: string) => {
    // Make sure text is not null/undefined before copying
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      // Reset the "copied" state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return [isCopied, copy];
};

export default useCopyToClipboard;
