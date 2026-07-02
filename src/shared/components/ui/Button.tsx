"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/20",
  secondary:
    "bg-card text-foreground border border-border hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  accent: "bg-accent text-accent-foreground hover:opacity-90",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

type ButtonAsButton = ButtonBaseProps & { href?: undefined };

type ButtonAsLink = ButtonBaseProps & {
  href: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClass =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    disabled,
    type = "button",
    onClick,
  } = props;
  const classes = cn(baseClass, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
