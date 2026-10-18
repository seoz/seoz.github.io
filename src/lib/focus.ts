import type { LocalizedText, ProfileFocus } from "@/src/types/content";

const localized = (value: unknown): value is LocalizedText => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const text = value as Record<string, unknown>;
  return Object.keys(text).length === 2 && [text.en, text.ko].every((item) => typeof item === "string" && item.length > 0 && item.length <= 120);
};
export function isValidFocus(value: unknown): value is ProfileFocus {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const focus = value as Record<string, unknown>;
  return Object.keys(focus).length === 2 && localized(focus.label) && Array.isArray(focus.items) && focus.items.length <= 6 && focus.items.every(localized);
}
