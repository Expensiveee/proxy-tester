"use client";

import { AnimatePresence } from "framer-motion";
import ProxyListRow from "./proxy-list-row";
import { useProxyTesterStore } from "@/store/proxy";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "./ui/table"; // Assuming shadcn/ui
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export default function ProxyList() {
  // Fetch all necessary state from the store
  const { testedProxies, ipLookup, latencyCheck, isLoading, testStatus } =
    useProxyTesterStore();

  if (testStatus === "testing" && testedProxies.length === 0) {
    return (
      <div className="flex h-80 flex-row items-center justify-center rounded-md border text-text-secondary">
        <Loader2 className="animate-spin mr-2" />
        <p className="block">Waiting for the first results to come in...</p>
      </div>
    );
  }

  if (testedProxies.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-md border flex-col">
        <h3 className="text-text-primary">
          Results will appear here live as they are tested.
        </h3>
        <p className="text-text-muted">
          You need proxies?{" "}
          <Button className="text-text-secondary" variant={"link"}>
            Try Vital Proxies for free
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-md">
      <Table>
        <TableHeader className="bg-accent sticky w-full top-0 z-10">
          <TableRow>
            <TableHead className="w-[240px] font-medium text-base">
              Proxy
            </TableHead>
            <TableHead className="text-center font-medium text-base">
              Status
            </TableHead>
            {/* The rendering of these headers controls the rendering of the cells */}
            {latencyCheck && (
              <TableHead className="font-medium text-base">Latency</TableHead>
            )}
            {ipLookup && (
              <TableHead className="font-medium text-base">
                IP Address
              </TableHead>
            )}
            <TableHead className="text-right font-medium text-base">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {testedProxies.map((proxy) => (
              <ProxyListRow
                key={proxy.raw}
                proxy={proxy}
                // Pass the booleans down as props
                latencyCheck={latencyCheck}
                ipLookup={ipLookup}
              />
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
