"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildPageNumbers,
  pageItemRange,
} from "@/shared/lib/pagination";
import { cn } from "@/shared/lib/cn";

type AdminPaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

const pageButtonBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors";

export function AdminPagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
}: AdminPaginationProps) {
  if (totalItems === 0) return null;

  const { start, end } = pageItemRange(page, pageSize, totalItems);
  const pageNumbers = buildPageNumbers(page, pageCount);

  return (
    <nav
      className="flex flex-col gap-3 border-t border-white/40 pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm tabular-nums text-muted-foreground">
        Showing {start}–{end} of {totalItems}
      </p>

      {pageCount > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className={cn(
              pageButtonBase,
              "gap-1 border-white/55 bg-white/40 text-foreground hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            <ChevronLeft size={16} aria-hidden />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {pageNumbers.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  pageButtonBase,
                  item === page
                    ? "border-primary/40 bg-primary text-primary-foreground"
                    : "border-white/55 bg-white/40 text-foreground hover:bg-white/55"
                )}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
            className={cn(
              pageButtonBase,
              "gap-1 border-white/55 bg-white/40 text-foreground hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      )}
    </nav>
  );
}
