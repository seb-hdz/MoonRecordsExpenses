"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Shared sync UI is disabled; keep the route for old links / share targets. */
export default function SyncSharedPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
