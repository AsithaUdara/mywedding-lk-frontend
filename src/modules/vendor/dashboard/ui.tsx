"use client";

/**
 * Vendor dashboard UI — re-exports shared design system primitives.
 */
export {
  formatLKR,
  PageHeader,
  LoadingState,
  PageLoadingSkeleton,
  ErrorBanner,
  SuccessBanner,
  EmptyState,
  SectionCard,
  ProgressBar,
  StatCard,
  StatIcon,
  STAT_ICON_THEMES,
  type StatIconTheme,
  inputClass,
  Button,
  Badge,
  Card,
  getStatusBadgeClass,
} from "@/shared/components/ui";

/** @deprecated Use StatIcon */
export { StatIcon as IconCircle } from "@/shared/components/ui";
