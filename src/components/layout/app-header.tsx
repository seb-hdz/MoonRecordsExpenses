import Image from "next/image";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/Logo.png";

export function AppBrand({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex justify-center md:justify-start w-full items-center gap-2",
        className
      )}
    >
      <Image
        src={logoMark}
        alt=""
        width={48}
        height={48}
        className="shrink-0 object-contain"
      />
      <p className="text-lg font-bold tracking-wide leading-5 ml-1">
        <span className="md:hidden block">
          Moon Records
          <span className="text-xs text-muted-foreground ml-1">®</span>
        </span>
        <span className="md:block hidden">
          Moon
          <br />
          Records <span className="text-xs text-muted-foreground -ml-1">®</span>
        </span>
      </p>
    </div>
  );
}

/** Brand header for viewports without the sidebar (below `md`). */
export function AppHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "md:hidden -mx-4 mb-6 border-b bg-card px-5 py-3 sm:-mx-6 lg:-mx-8",
        className
      )}
    >
      <AppBrand />
    </header>
  );
}
