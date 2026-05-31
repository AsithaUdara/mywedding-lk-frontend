"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type HeaderSearchFieldProps = {
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
};

export function HeaderSearchField({
  className,
  inputClassName,
  autoFocus = false,
}: HeaderSearchFieldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();

    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    const qs = params.toString();
    router.push(qs ? `/vendors/search?${qs}` : "/vendors/search");
  };

  return (
    <form onSubmit={submit} className={cn("relative w-full min-w-0", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search vendors, categories, cities…"
        className={cn(
          "h-10 w-full min-w-0 rounded-full border border-border/80 bg-white/85 py-2 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors",
          "placeholder:text-muted-foreground focus:border-primary/35 focus:ring-2 focus:ring-primary/15",
          inputClassName
        )}
        aria-label="Search vendors"
      />
    </form>
  );
}
