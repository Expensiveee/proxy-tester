"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ChevronRight } from "lucide-react";

export default function Header() {
  return (
    <div className="w-full flex justify-between px-8 py-6 mb-20">
      <Image
        src="/brand/logo-icon-text-long.svg"
        alt="Vital Proxies Logo"
        width={190}
        height={190}
      />
      <Button
        variant="white"
        size="default"
        onClick={() =>
          openUrl(
            "https://www.vital-proxies.com/?utm_source=vital-tester&utm_medium=app&utm_campaign=buy-proxies"
          )
        }
      >
        Try Vital Proxies For Free <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
