import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { rf } from "./tokens";

export function GlassSectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "",
        className
      )}
    >
      {eyebrow && <p className={rf.eyebrow}>{eyebrow}</p>}
      <h2 className={rf.marketingSectionTitle}>{title}</h2>
      {subtitle && <p className={rf.sectionSubtitle}>{subtitle}</p>}
    </div>
  );
}

export function GlassSection({
  id,
  alt = false,
  className,
  children,
}: {
  id?: string;
  alt?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(alt ? rf.sectionAlt : rf.section, className)}>
      <div className={rf.container}>{children}</div>
    </section>
  );
}
