import type { LocalizedText, TimelineItem } from "@/src/types/content";

function primaryFormat(entry: LocalizedText) {
  const text = `${entry.en} ${entry.ko}`;
  if (/\b(panel(?:ist)?s?|round[ -]?tables?)\b|패널|간담회/i.test(text)) return "panelsRoundtables";
  if (/\b(interviews?|media|documentar(?:y|ies)|filmed|video)\b|인터뷰|다큐멘터리|영상\s*출연/i.test(text)) return "interviewsMedia";
  if (/\bmentor(?:ing)?\b|멘토링/i.test(text)) return "mentoringSessions";
  return "talksLecturesPresentations";
}

function descriptionEntries(item: TimelineItem): LocalizedText[] {
  const bullets = (text: string) => text.split("\n").filter((line) => /^\s*(?:[-*+] |\d+[.)] )/.test(line)).map((line) => line.replace(/^\s*(?:[-*+] |\d+[.)] )/, "").trim());
  const en = bullets(item.description.en);
  const ko = bullets(item.description.ko);
  if (!en.length && !ko.length) return [item.title];
  return Array.from({ length: Math.max(en.length, ko.length) }, (_, index) => ({ en: en[index] ?? "", ko: ko[index] ?? "" }));
}

/** Count documented entries once, using the same live records displayed in the archive. */
export function getTalkMetrics(timeline: TimelineItem[]) {
  const metrics = { engagements: 0, activeYears: 0, talksLecturesPresentations: 0, interviewsMedia: 0, panelsRoundtables: 0, mentoringSessions: 0 };
  const years = new Set<string>();
  for (const item of timeline.filter((entry) => entry.section === "talks")) {
    const year = item.period.match(/\b(?:19|20)\d{2}\b/)?.[0];
    if (year) years.add(year);
    // Highlights replace the Markdown description in the archive; never count both.
    const entries = item.highlights?.length ? item.highlights.map((highlight) => highlight.title) : descriptionEntries(item);
    for (const entry of entries) {
      if (!entry.en.trim() && !entry.ko.trim()) continue;
      metrics[primaryFormat(entry)] += 1;
      metrics.engagements += 1;
    }
  }
  metrics.activeYears = years.size;
  return metrics;
}
