import { z } from "zod";

/** Parse API array payloads safely (empty array on invalid shape). */
export function parseApiArray<T>(schema: z.ZodType<T>, data: unknown): T[] {
  const result = z.array(schema).safeParse(data);
  return result.success ? result.data : [];
}

/** Pick first defined camelCase or PascalCase field from a raw API object. */
export function pickField(raw: Record<string, unknown>, camel: string, pascal: string): unknown {
  if (raw[camel] !== undefined) return raw[camel];
  return raw[pascal];
}

export function pickString(raw: Record<string, unknown>, camel: string, pascal: string, fallback = ""): string {
  const value = pickField(raw, camel, pascal);
  return value == null ? fallback : String(value);
}

export function pickNullableString(
  raw: Record<string, unknown>,
  camel: string,
  pascal: string
): string | null {
  const value = pickField(raw, camel, pascal);
  return value == null ? null : String(value);
}

export function pickNumber(raw: Record<string, unknown>, camel: string, pascal: string, fallback = 0): number {
  const value = pickField(raw, camel, pascal);
  return value == null ? fallback : Number(value);
}

export function pickBoolean(
  raw: Record<string, unknown>,
  camel: string,
  pascal: string,
  fallback = false
): boolean {
  const value = pickField(raw, camel, pascal);
  return value == null ? fallback : Boolean(value);
}
