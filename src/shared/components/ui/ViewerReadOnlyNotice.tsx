import { Eye } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function ViewerReadOnlyNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950",
        className
      )}
      role="status"
    >
      <Eye size={16} className="mt-0.5 shrink-0" aria-hidden />
      <p>
        You have <strong>Viewer</strong> access on this event. You can browse everything but cannot
        make changes.
      </p>
    </div>
  );
}
