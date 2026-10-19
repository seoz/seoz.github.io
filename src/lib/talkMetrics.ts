import type { LocalizedText, TimelineItem } from "@/src/types/content";

const categoryLabels = {
  talksLecturesPresentations: ["lecture", "presentation", "talk", "panel", "roundtable"],
  interviewsMedia: ["interview", "media"],
  panelsRoundtables: ["panel", "roundtable"],
  mentoringSessions: ["mentoring"],
} as const;

function descriptionEntries(item: TimelineItem): LocalizedText[] {
  const bullets = (text: string) => text.split("\n").filter((line) => /^\s*(?:[-*+] |\d+[.)] )/.test(line)).map((line) => line.replace(/^\s*(?:[-*+] |\d+[.)] )/, "").trim());
  const en = bullets(item.description.en);
  const ko = bullets(item.description.ko);
  if (!en.length && !ko.length) return [item.title];
  return Array.from({ length: Math.max(en.length, ko.length) }, (_, index) => ({ en: en[index] ?? "", ko: ko[index] ?? "" }));
}

/** Count each engagement once; category totals follow label IDs and may overlap. */
export function getTalkMetrics(timeline: TimelineItem[]) {
  const metrics = { engagements: 0, activeYears: 0, talksLecturesPresentations: 0, interviewsMedia: 0, panelsRoundtables: 0, mentoringSessions: 0 };
  const years = new Set<string>();
  for (const item of timeline.filter((entry) => entry.section === "talks")) {
    const year = item.period.match(/\b(?:19|20)\d{2}\b/)?.[0];
    if (year) years.add(year);
    // Highlights replace the Markdown description in the archive; never count both.
    const entries = item.highlights !== undefined ? item.highlights.map((highlight) => ({ title: highlight.title, tags: highlight.tags ?? item.tags })) : descriptionEntries(item).map((title) => ({ title, tags: item.tags }));
    for (const entry of entries) {
      if (!entry.title.en.trim() && !entry.title.ko.trim()) continue;
      for (const category of Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>) {
        if (categoryLabels[category].some((label) => entry.tags.includes(label))) metrics[category] += 1;
      }
      metrics.engagements += 1;
    }
  }
  metrics.activeYears = years.size;
  return metrics;
}
