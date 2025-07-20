"use client";

import { useProxyTesterStore } from "@/store/proxy";
import { type Proxy, type ProxyStreamResult } from "@/types"; // Make sure to export ProxyStreamResult from types if needed
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XSquare, Zap } from "lucide-react";
import useSticky from "@/hooks/useSticky";
import { cn } from "@/lib/utils";

export default function ProxyToolbar() {
  const { ref: toolbarRef, isSticky } = useSticky<HTMLDivElement>();

  const {
    loadedProxies,
    testedProxies,
    testStatus,
    targetUrl,
    latencyCheck,
    ipLookup,
    // Actions
    prepareForTest,
    addTestResult,
    finalizeTest,
    stopTest,
    clearAll,
  } = useProxyTesterStore();

  const runTest = async () => {
    // Prevent starting a new test if one is already running
    if (loadedProxies.length === 0 || testStatus === "testing") return;

    // 1. Prepare the test and get the AbortController for this specific run
    const controller = new AbortController();
    prepareForTest(controller);

    try {
      const response = await fetch("/api/proxy-check", {
        // CORRECTED: API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          proxies: loadedProxies.map((p) => ({
            formatted: p.formatted,
            raw: p.raw,
          })),
          targetUrl,
          latencyCheck,
          ipLookup,
        }),
      });

      if (!response.body) {
        throw new Error("Response body is empty.");
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = value.split("\n\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const result: ProxyStreamResult = JSON.parse(line.substring(6));
            addTestResult({
              ...result,
              raw: result.raw,
              formatted: result.formatted,
            });
          }
        }
      }
    } catch (error) {
      // Gracefully handle the expected error when the user clicks "Stop"
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Test successfully stopped by user.");
      } else {
        console.error("Test run failed:", error);
      }
    } finally {
      // Always finalize the state
      finalizeTest();
    }
  };

  const isTestActive = testStatus === "testing" || testStatus === "stopping";

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "sticky top-0 z-20 transition-all duration-200 ease-in-out",
        isSticky ? "bg-accent !text-white" : "text-text-secondary py-6"
      )}
    >
      <div className="w-full flex items-center justify-between px-1 py-2">
        <div className="flex min-w-[250px] items-center gap-2 text-sm ">
          {testStatus === "testing" && (
            <Loader2 className="size-4 animate-spin text-blue-500" />
          )}
          {testStatus === "stopping" && (
            <Loader2 className="size-4 animate-spin text-red-500" />
          )}
          {testStatus === "finished" && (
            <CheckCircle className="size-4 text-green-500" />
          )}

          <span>
            {testStatus === "idle" &&
              `${loadedProxies.length} ${
                loadedProxies.length === 1 ? "proxy" : "proxies"
              } loaded`}
            {testStatus === "testing" &&
              `Testing... (${testedProxies.length}/${loadedProxies.length})`}
            {testStatus === "stopping" && "Stopping test..."}
            {testStatus === "finished" &&
              `Test finished. ${testedProxies.length} proxies tested.`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={clearAll} disabled={isTestActive}>
            Clear All
          </Button>

          {testStatus === "testing" ? (
            <Button variant="destructive" onClick={stopTest}>
              <XSquare className="mr-2 size-4" />
              Stop
            </Button>
          ) : (
            <Button
              variant={isSticky ? "white" : "default"}
              onClick={runTest}
              disabled={loadedProxies.length === 0 || isTestActive}
            >
              <Zap className="mr-2 size-4" />
              Run Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
