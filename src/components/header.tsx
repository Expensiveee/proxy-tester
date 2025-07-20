"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ChevronRight } from "lucide-react";

export default function Header() {
  return (
    <>
      <div className="flex-1 justify-start">
        <Image
          src="/brand/logo-icon.svg"
          alt="Vital Proxies Icon"
          width={72}
          height={72}
        />
      </div>

      <div className="flex-1 flex flex-col gap-2 justify-center text-center">
        <h1 className="text-3xl font-normal text-text-secondary h-full">
          Vital Proxies
        </h1>
        <p className="text-3xl font-medium text-text-primary">Tester</p>
      </div>

      <div className="flex-1 flex justify-end">
        <Button
          variant="transparent"
          size="default"
          onClick={() =>
            openUrl(
              "https://www.vital-proxies.com/?utm_source=vital-tester&utm_medium=app&utm_campaign=buy-proxies"
            )
          }
        >
          Try Vital For Free <ChevronRight className="size-4" />
        </Button>
      </div>
    </>
  );
}
