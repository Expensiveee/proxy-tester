"use client";

import { useUpdater } from "@/hooks/useUpdater";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export default function UpdateDialog() {
  const { update, status, downloadProgress, error, startInstall } =
    useUpdater();

  const showDialog = !!update;
  const isInstalling = status === "DOWNLOADING" || status === "INSTALLING";

  return (
    <AlertDialog open={showDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Available!</AlertDialogTitle>
          <AlertDialogDescription>
            A new version ({update?.version}) is available.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="prose prose-sm dark:prose-invert max-h-48 overflow-y-auto rounded-md border p-4">
          <p>{update?.body || "No release notes provided."}</p>
        </div>

        {isInstalling && (
          <div className="flex flex-col gap-2 pt-4">
            <Progress value={downloadProgress} />
            <p className="text-center text-xs text-muted-foreground">
              {status === "DOWNLOADING"
                ? `Downloading... ${downloadProgress}%`
                : "Download complete. Installing..."}
            </p>
          </div>
        )}

        <p className="text-center text-xs text-destructive">{error}</p>

        <AlertDialogFooter>
          <Button variant="transparent" disabled={isInstalling}>
            Later
          </Button>
          <Button onClick={startInstall} disabled={isInstalling}>
            {isInstalling ? "Installing..." : "Install Now"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
