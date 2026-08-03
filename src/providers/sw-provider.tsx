"use client";

import { useEffect } from "react";
import { appBasePath } from "@/lib/app-base-path";

export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(`${appBasePath}/sw.js`, { scope: `${appBasePath}/` })
        .catch(() => {});
    }
  }, []);

  return <>{children}</>;
}
