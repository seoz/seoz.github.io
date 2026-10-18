import type { LocalizedText, PressContent } from "@/src/types/content";

const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const exactKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every((key) => key in value);
const localized = (value: unknown): value is LocalizedText => record(value) && exactKeys(value, ["en", "ko"]) && [value.en, value.ko].every((text) => typeof text === "string" && text.length > 0 && text.length <= 12000);
const webUrl = (value: unknown): value is string => typeof value === "string" && value.length <= 2048 && /^https?:\/\/[^\s]+$/.test(value);
const imageUrl = (value: unknown) => value === "" || webUrl(value) || (typeof value === "string" && value.length <= 2048 && /^\/[a-zA-Z0-9_][a-zA-Z0-9_./-]*$/.test(value));

/** Mirrors the bounded nested Press schema in firestore.rules. Array order is display order. */
export function isValidPress(value: unknown): value is PressContent {
  return record(value) && exactKeys(value, ["eyebrow", "title", "body", "cards"])
    && localized(value.eyebrow) && localized(value.title) && localized(value.body)
    && Array.isArray(value.cards) && value.cards.length <= 12
    && new Set(value.cards.map((card) => record(card) ? card.id : undefined)).size === value.cards.length
    && value.cards.every((card: unknown) => record(card)
      && exactKeys(card, ["id", "kind", "meta", "title", "image", "imageAlt", "url"])
      && card.id !== "main" && typeof card.id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(card.id)
      && ["linkedin", "book", "video", "article"].includes(card.kind as string)
      && localized(card.meta) && localized(card.title) && localized(card.imageAlt)
      && imageUrl(card.image) && webUrl(card.url));
}

/** A missing configuration uses seed content; a saved empty list is intentional. */
export function resolvePressContent(documents: Array<{ id: string; data: Record<string, unknown> }>, fallback: PressContent): PressContent {
  const introduction = documents.find((item) => item.id === "main")?.data;
  if (!introduction || !Array.isArray(introduction.cardIds)) return fallback;
  const cards = new Map(documents.filter((item) => item.id !== "main").map((item) => [item.id, item.data]));
  const press = {
    eyebrow: introduction.eyebrow,
    title: introduction.title,
    body: introduction.body,
    cards: introduction.cardIds.map((id) => cards.get(id)),
  };
  return isValidPress(press) ? press : fallback;
}
