"use client";

import { useState, useEffect, useCallback } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

// The Update object from the plugin is already well-typed, so we can use it directly.
export type { Update };

// A more detailed status type for the UI
export type UpdateStatus =
  | "PENDING"
  | "DOWNLOADING"
  | "INSTALLING"
  | "DONE"
  | "ERROR";

export function useUpdater() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [status, setStatus] = useState<UpdateStatus>("PENDING");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // This effect runs once on mount to check for updates.
  useEffect(() => {
    const doCheckUpdate = async () => {
      try {
        const result = await check();
        if (result) {
          console.log(`Update available: version ${result.version}`);
          console.log(`Release notes: ${result}`);
          setUpdate(result);
        } else {
          console.log("You are running the latest version.");
        }
      } catch (e: any) {
        console.error(e);
        setError(e.toString());
      }
    };

    doCheckUpdate();
  }, []);

  // This function is what the "Install Now" button will call.
  // We use useCallback to ensure it has a stable reference.
  const startInstall = useCallback(async () => {
    if (!update) return;

    setError(null); // Clear previous errors
    setStatus("DOWNLOADING");

    try {
      // This is the core logic from your example.
      await update.downloadAndInstall((progressEvent) => {
        switch (progressEvent.event) {
          case "Started":
            console.log(
              `Started downloading ${progressEvent.data.contentLength} bytes`
            );
            break;
          case "Progress":
            // Calculate percentage
            const percent = Math.round(
              (progressEvent.data.chunkLength /
                progressEvent.data.chunkLength) *
                100
            );
            setDownloadProgress(percent);
            console.log(`Downloaded ${percent}%`);
            break;
          case "Finished":
            setStatus("INSTALLING");
            console.log("Download finished, installing...");
            break;
        }
      });

      console.log("Update installed successfully");
      setStatus("DONE");
      // Relaunch the application after a successful install
      await relaunch();
    } catch (e: any) {
      console.error("Installation failed:", e);
      setError(e.toString());
      setStatus("ERROR");
    }
  }, [update]); // The function depends on the `update` object

  return {
    update,
    status,
    downloadProgress,
    error,
    startInstall,
  };
}
