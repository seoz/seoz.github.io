import type { TimelineHighlight, TimelineItem } from "@/src/types/content";

/** Legacy Markdown digests become editable entries without a database migration. */
export function talkEntries(item: TimelineItem): TimelineHighlight[] {
  if (item.highlights !== undefined) return item.highlights;
  if (item.section !== "talks" || !/^\d{4}$/.test(item.period.trim())) return [];
  const bullets = (text: string) => text.split("\n").filter((line) => /^\s*[-*+] /.test(line)).map((line) => line.replace(/^\s*[-*+] /, "").trim());
  const en = bullets(item.description.en);
  const ko = bullets(item.description.ko);
  return Array.from({ length: Math.max(en.length, ko.length) }, (_, index) => ({
    id: `${item.id}-entry-${index + 1}`,
    title: { en: en[index] ?? "", ko: ko[index] ?? "" },
    description: { en: "", ko: "" }, imageUrl: "", images: [], links: [], tags: [...item.tags],
  }));
}

export function normalizeTalkItem(item: TimelineItem): TimelineItem {
  return item.section === "talks" && /^\d{4}$/.test(item.period.trim())
    ? { ...item, highlights: talkEntries(item).map((entry) => ({ ...entry, tags: entry.tags ?? [...item.tags] })) } : item;
}

export function entryImages(entry: TimelineHighlight): string[] {
  return entry.images ?? (entry.imageUrl ? [entry.imageUrl] : []);
}

export function validEntry(entry: TimelineHighlight): boolean {
  const safeImage = (url: string) => url.length <= 2048 && /^(https?:\/\/[^\s]+|\/[a-zA-Z0-9_][a-zA-Z0-9_./-]*)$/.test(url);
  return /^[a-zA-Z0-9_-]{1,160}$/.test(entry.id) && !!entry.title.en.trim() && !!entry.title.ko.trim()
    && entry.title.en.length <= 12000 && entry.title.ko.length <= 12000
    && entry.description.en.length <= 12000 && entry.description.ko.length <= 12000
    && (entry.tags ?? []).length <= 12 && (entry.tags ?? []).every((tag) => /^[a-zA-Z0-9_-]{1,80}$/.test(tag))
    && entryImages(entry).length <= 6 && entryImages(entry).every(safeImage)
    && entry.links.length <= 3 && entry.links.every((link) => /^https?:\/\/[^\s]+$/.test(link.url) && link.url.length <= 2048);
}

export type SavedTalkEntry = { id: string; yearId: string; entry: TimelineHighlight };

export function resolveTalkEntries(item: TimelineItem, entries: SavedTalkEntry[]): TimelineItem {
  if (item.entryIds === undefined) return normalizeTalkItem(item);
  return { ...item, highlights: item.entryIds.flatMap((id) => {
    const saved = entries.find((candidate) => candidate.id === id && candidate.yearId === item.id);
    return saved ? [saved.entry] : [];
  }) };
}

export function filterTalkEntries(item: TimelineItem, tag: string, query: string, language: "en" | "ko"): TimelineItem {
  if (item.section !== "talks" || item.highlights === undefined) return item;
  return { ...item, highlights: item.highlights.filter((entry) =>
    (tag === "all" || (entry.tags ?? item.tags).includes(tag)) &&
    (!query || [item.period, entry.title[language], entry.description[language]].join(" ").toLocaleLowerCase().includes(query))) };
}
