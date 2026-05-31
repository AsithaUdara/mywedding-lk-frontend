export interface UserNameFields {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}

const PLACEHOLDER_FIRST_NAMES = new Set(["user", "unknown"]);

export function isPlaceholderName(firstName?: string | null, lastName?: string | null): boolean {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();

  if (!first && !last) return true;
  if (last) return false;

  return PLACEHOLDER_FIRST_NAMES.has(first.toLowerCase());
}

export function nameFromEmail(email: string): string {
  const localPart = (email.split("@")[0] ?? email).trim();
  if (!localPart) return "Member";

  return localPart
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getUserDisplayName(user: UserNameFields): string {
  const first = (user.firstName ?? "").trim();
  const last = (user.lastName ?? "").trim();
  const fullName = `${first} ${last}`.trim();

  if (fullName && !isPlaceholderName(first, last)) {
    return fullName;
  }

  return nameFromEmail(user.email);
}

export function getUserInitials(user: UserNameFields): string {
  const first = (user.firstName ?? "").trim();
  const last = (user.lastName ?? "").trim();

  if (!isPlaceholderName(first, last)) {
    const fromNames = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
    if (fromNames) return fromNames;
  }

  const displayName = getUserDisplayName(user);
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (user.email[0] ?? "U").toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: "bg-primary/15", text: "text-primary", ring: "ring-primary/20" },
  { bg: "bg-accent/15", text: "text-accent", ring: "ring-accent/20" },
  { bg: "bg-emerald-500/15", text: "text-emerald-700", ring: "ring-emerald-500/20" },
  { bg: "bg-sky-500/15", text: "text-sky-700", ring: "ring-sky-500/20" },
  { bg: "bg-violet-500/15", text: "text-violet-700", ring: "ring-violet-500/20" },
  { bg: "bg-amber-500/15", text: "text-amber-800", ring: "ring-amber-500/20" },
] as const;

export function getAvatarPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
