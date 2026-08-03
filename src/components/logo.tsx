import { cn } from "@/lib/utils";
import { APP_SHORT_NAME } from "@/lib/app-brand";

export function Logo({
  className,
  muted,
  showAuthor,
}: {
  className?: string;
  /** Marca secundaria en tonos muted (p. ej. cabecera móvil) */
  muted?: boolean;
  /** Muestra el autor */
  showAuthor?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "font-bold text-lg tracking-tight",
          muted && "text-muted-foreground",
          className
        )}
      >
        {APP_SHORT_NAME}
      </span>
      {showAuthor ? (
        <p className="text-xs text-muted-foreground/50 -mt-1">by @seb-hdz</p>
      ) : null}
    </div>
  );
}
