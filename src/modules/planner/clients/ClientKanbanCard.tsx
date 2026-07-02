"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckSquare,
  ClipboardList,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import type { ClientPipelineCard } from "@/modules/planner/clients/plannerClientHelpers";
import {
  PLANNER_PHASE_LABELS,
  PLANNER_PRIORITY_STYLES,
  plannerBadge,
} from "@/modules/planner/theme/plannerWorkspaceTheme";
import { cn } from "@/shared/lib/cn";

type ClientKanbanCardProps = {
  client: ClientPipelineCard;
  dragging: boolean;
  saving: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

export function ClientKanbanCard({
  client,
  dragging,
  saving,
  onDragStart,
  onDragEnd,
}: ClientKanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const priority = PLANNER_PRIORITY_STYLES[client.priority];
  const PriorityIcon = priority.icon;
  const phaseLabel = PLANNER_PHASE_LABELS[client.taskPlanPhase];
  const timelineHref = `/planner/tasks?eventId=${encodeURIComponent(client.id)}`;
  const procurementHref = `/planner/procurement?eventId=${encodeURIComponent(client.id)}`;

  return (
    <article
      draggable={!saving}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", client.id);
        onDragStart(client.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative cursor-grab rounded border border-[#DFE1E6] border-l-[3px] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.25)]",
        "transition-[box-shadow,background-color] duration-150 active:cursor-grabbing",
        "hover:bg-[#FAFBFC] hover:shadow-[0_4px_8px_rgba(9,30,66,0.15)]",
        priority.border,
        (dragging || saving) && "opacity-55 ring-2 ring-primary/20"
      )}
    >
      <div className="p-2.5">
        {/* Issue key row */}
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <Link
            href={timelineHref}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-medium text-[#5E6C84] hover:text-primary hover:underline"
          >
            {client.eventKey}
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Card actions"
              aria-expanded={menuOpen}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((open) => !open);
              }}
              className={cn(
                "rounded p-0.5 text-[#5E6C84] opacity-0 transition-opacity hover:bg-[#EBECF0] group-hover:opacity-100",
                menuOpen && "opacity-100"
              )}
            >
              <MoreHorizontal size={14} aria-hidden />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[148px] overflow-hidden rounded-md border border-[#DFE1E6] bg-white py-1 shadow-lg">
                  <CardMenuLink href={timelineHref} icon={ExternalLink} onSelect={() => setMenuOpen(false)}>
                    Open timeline
                  </CardMenuLink>
                  <CardMenuLink href={procurementHref} icon={ClipboardList} onSelect={() => setMenuOpen(false)}>
                    Procurement
                  </CardMenuLink>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary + priority */}
        <div className="flex items-start gap-1.5">
          <span
            className="mt-0.5 shrink-0"
            title={`${priority.label} priority`}
            aria-label={`${priority.label} priority`}
          >
            <PriorityIcon size={14} className={priority.iconClass} strokeWidth={2.5} aria-hidden />
          </span>
          <Link
            href={timelineHref}
            className="line-clamp-2 text-[13px] font-medium leading-snug text-[#172B4D] hover:text-primary"
          >
            {client.title}
          </Link>
        </div>

        {/* Labels */}
        <div className="mt-2 flex flex-wrap gap-1">
          {phaseLabel && (
            <span
              className={cn(
                "inline-flex max-w-full truncate rounded px-1.5 py-px text-[10px] font-semibold leading-4",
                phaseLabel.className
              )}
            >
              {phaseLabel.text}
            </span>
          )}
          {client.needsSetup && (
            <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[10px] font-semibold leading-4", plannerBadge.setup)}>
              <AlertCircle size={9} aria-hidden />
              Setup
            </span>
          )}
          {client.overdueCount > 0 && (
            <span className={cn("inline-flex rounded px-1.5 py-px text-[10px] font-semibold leading-4", plannerBadge.overdue)}>
              {client.overdueCount} overdue
            </span>
          )}
          {client.budget > 0 && (
            <span className={cn("inline-flex rounded px-1.5 py-px text-[10px] font-semibold leading-4", plannerBadge.budget)}>
              {client.budgetLabel}
            </span>
          )}
        </div>

        {/* Footer metadata */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#EBECF0] pt-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#5E6C84]">
            <span className="inline-flex items-center gap-1" title={client.weddingDateShort}>
              <Calendar size={12} className="shrink-0 text-[#97A0AF]" aria-hidden />
              <span className="tabular-nums">{client.daysUntil}d</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckSquare size={12} className="shrink-0 text-[#97A0AF]" aria-hidden />
              <span className="tabular-nums">
                {client.taskTotal > 0
                  ? `${client.taskCompleted}/${client.taskTotal}`
                  : "—"}
              </span>
            </span>
            {client.taskProgress !== null && (
              <span className="tabular-nums text-[#5E6C84]">{client.taskProgress}%</span>
            )}
          </div>
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DFE1E6] text-[10px] font-bold text-[#42526E]"
            title="Client"
          >
            {client.clientInitials}
          </span>
        </div>
      </div>
    </article>
  );
}

function CardMenuLink({
  href,
  icon: Icon,
  children,
  onSelect,
}: {
  href: string;
  icon: typeof ExternalLink;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#172B4D] hover:bg-[#EBECF0]"
    >
      <Icon size={13} className="text-[#5E6C84]" aria-hidden />
      {children}
    </Link>
  );
}
