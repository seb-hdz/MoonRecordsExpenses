"use client";

import { cn } from "@/lib/utils";

/**
 * Dos blobs: movimiento `drift-mesh-blob-*-move` + brillo lento `*-glow` (globals.css).
 * Colocar dentro de un ancestro `relative overflow-hidden`.
 */
export function DriftingMeshBackground({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-[20%] -left-[25%] size-[min(85vw,520px)] rounded-full bg-linear-to-br from-[#8BFF9E]/45 via-[#5DE073]/35 to-[#429D51]/28 blur-3xl motion-safe:will-change-[transform,filter] dark:from-[#5DE073]/30 dark:via-[#429D51]/25 dark:to-[#0F180F]/40",
          "drift-mesh-blob-a",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-[20%] -bottom-[25%] size-[min(80vw,480px)] rounded-full bg-linear-to-tl from-[#5DE073]/40 via-[#8BFF9E]/30 to-[#429D51]/35 blur-3xl motion-safe:will-change-[transform,filter] dark:from-[#429D51]/35 dark:via-[#5DE073]/22 dark:to-[#0F180F]/45",
          "drift-mesh-blob-b",
        )}
      />
    </div>
  );
}
