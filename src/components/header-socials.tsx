"use client";

import { openUrl } from "@tauri-apps/plugin-opener";
import Image from "next/image";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";

export default function HeaderSocials() {
  return (
    <div className="flex flex-row items-center gap-3">
      <Button
        onClick={() =>
          openUrl(
            "https://www.vital-proxies.com/?utm_source=vital-tester&utm_medium=app&utm_campaign=buy-proxies"
          )
        }
        variant={"transparent"}
        size={"icon"}
      >
        <Globe className="size-4" />
      </Button>
      <Button
        onClick={() => openUrl("https://discord.com/invite/vital-proxies")}
        variant={"transparent"}
        size={"icon"}
      >
        <Image
          src="/social/discord.svg"
          width={18}
          height={18}
          alt="Discord Logo"
        />
      </Button>
      <Button
        onClick={() => openUrl("https://t.me/vitalproxies")}
        variant={"transparent"}
        size={"icon"}
      >
        <Image
          src="/social/telegram.svg"
          width={18}
          height={18}
          alt="Telegram Logo"
        />
      </Button>
      <Button
        onClick={() => openUrl("https://github.com/vital-proxies/proxy-tester")}
        variant={"transparent"}
        size={"icon"}
      >
        <Image
          src="/social/github.svg"
          width={18}
          height={18}
          alt="Github Logo"
        />
      </Button>
    </div>
  );
}
