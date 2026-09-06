"use client";
/* eslint-disable @next/next/no-img-element -- Vinext serves local and Firebase-hosted images directly. */

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  ChevronDown,
  ExternalLink,
  Github,
  Linkedin,
  Menu,
  Moon,
  Newspaper,
  Play,
  Search,
  Sparkles,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import { usePortfolioContent } from "@/src/hooks/usePortfolioContent";
import { talkEngagementMetrics } from "@/src/data/profileArchive";
import { DEFAULT_LANGUAGE, localize, normalizeLanguage, uiCopy } from "@/src/lib/i18n";
import type { Language, PortfolioContent, TimelineItem } from "@/src/types/content";

type PortfolioAppProps = {
  previewContent?: PortfolioContent;
};

const pressHighlights = [
  {
    id: "linkedin",
    kind: "linkedin",
    meta: { en: "LinkedIn profile", ko: "LinkedIn 프로필" },
    title: { en: "Connect with Daniel on LinkedIn", ko: "LinkedIn에서 Daniel과 연결하기" },
    image: "/seoz.jpg",
    imageAlt: { en: "Portrait of Daniel Seo", ko: "Daniel Seo 프로필 사진" },
    url: "https://www.linkedin.com/in/seoz/",
  },
  {
    id: "better-programmer",
    kind: "book",
    meta: { en: "Book interview · 2024", ko: "도서 인터뷰 · 2024" },
    title: {
      en: "Featured interview in “How to Become a Better Programmer”",
      ko: "도서 ‘더 나은 프로그래머 되는 법’ 인터뷰 수록",
    },
    image: "/press/better-programmer.jpg",
    imageAlt: { en: "Cover of How to Become a Better Programmer", ko: "도서 ‘더 나은 프로그래머 되는 법’ 표지" },
    url: "https://www.yes24.com/Product/Goods/126110870",
  },
  {
    id: "the-twelve-months",
    kind: "video",
    meta: { en: "YouTube interview · 2023", ko: "YouTube 인터뷰 · 2023" },
    title: { en: "The Twelve Months interview", ko: "더열두달 인터뷰" },
    image: "/press/twelve-months.jpg",
    imageAlt: { en: "Daniel Seo in The Twelve Months interview", ko: "더열두달 인터뷰에 출연한 Daniel Seo" },
    url: "https://www.youtube.com/watch?v=vcwiAsRbCac",
  },
  {
    id: "hong-jeong-mo",
    kind: "video",
    meta: { en: "YouTube interview · 2019", ko: "YouTube 인터뷰 · 2019" },
    title: { en: "Interview on Hong Jeong-mo’s YouTube channel", ko: "홍정모 YouTube 채널 인터뷰" },
    image: "/press/hong-jeong-mo.jpg",
    imageAlt: { en: "Thumbnail for Daniel Seo’s interview on Hong Jeong-mo’s channel", ko: "홍정모 채널 Daniel Seo 인터뷰 썸네일" },
    url: "https://www.youtube.com/watch?v=_rUqBN4-pt8",
  },
  {
    id: "zdnet",
    kind: "article",
    meta: { en: "ZDNet interview · 2018", ko: "ZDNet 인터뷰 · 2018" },
    title: {
      en: "“Coding is communication… Build software skills through open source”",
      ko: "‘코딩도 소통… SW 실력 늘려면 공개SW 활동해야’",
    },
    image: "/press/zdnet-interview.jpg",
    imageAlt: { en: "Daniel Seo during his ZDNet interview", ko: "ZDNet 인터뷰 중인 Daniel Seo" },
    url: "http://www.zdnet.co.kr/view/?no=20181107095322",
  },
] as const;

const archiveSectionAccents: Record<string, string> = {
  career: "#2c61b7",
  talks: "#7755d9",
  mentoring: "#b87113",
  "open-source": "#547c1f",
  publications: "#bd4f80",
  awards: "#9b6a16",
  education: "#476174",
};

function ProfileImage({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-[var(--surface)] text-6xl font-black text-[var(--ink)] sm:min-h-[496px]">
        {name
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")}
      </div>
    );
  }

  return (
    <img
      className="h-full min-h-[400px] w-full object-cover object-top grayscale-[8%] sm:min-h-[496px]"
      src={src}
      alt={`Portrait of ${name}`}
      onError={() => setFailed(true)}
    />
  );
}

function TimelineCard({
  item,
  language,
  labelLookup,
  featuredLabel,
  expanded,
  onToggle,
  detailsLabel,
  collapseLabel,
}: {
  item: TimelineItem;
  language: Language;
  labelLookup: Map<string, { name: string; accent: string }>;
  featuredLabel: string;
  expanded: boolean;
  onToggle: () => void;
  detailsLabel: string;
  collapseLabel: string;
}) {
  const detailsId = `timeline-details-${item.id}`;
  const highlights = item.highlights ?? [];
  const itemAccent = archiveSectionAccents[item.section] ?? "var(--accent)";
  const isCareerItem = item.section === "career";
  const isSingleYear = /^\d{4}$/.test(item.period.trim());

  return (
    <article className="group border-t border-[var(--line)] py-5 first:border-t-0 md:py-6">
      <div className="grid gap-4 md:grid-cols-[132px_minmax(0,1fr)_auto] md:gap-6">
        <div>
          <p
            className={`inline-flex border px-2.5 py-1 font-mono font-black tracking-tight ${isSingleYear ? "min-w-16 justify-center text-sm" : "text-[11px]"}`}
            style={{
              borderColor: itemAccent,
              color: itemAccent,
              backgroundColor: `color-mix(in srgb, ${itemAccent} 8%, var(--surface))`,
            }}
          >
            {item.period}
          </p>
          <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
            {localize(item.location, language)}
          </p>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {item.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lime)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.09em] text-[#10243e]">
                <Sparkles size={11} aria-hidden="true" /> {featuredLabel}
              </span>
            )}
            {item.tags.map((tag) => {
              const label = labelLookup.get(tag);
              return (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--muted)]"
                >
                  <span
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: label?.accent ?? "var(--accent)" }}
                  />
                  {label?.name ?? tag}
                </span>
              );
            })}
          </div>

          <h3 className="text-balance text-xl font-black leading-tight tracking-[-0.03em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] md:text-2xl">
            {localize(item.title, language)}
          </h3>
          {isCareerItem ? (
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <p className="text-xs font-bold text-[var(--ink)] sm:text-sm">{localize(item.role, language)}</p>
              <span
                className="inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-black sm:text-sm"
                style={{
                  borderColor: itemAccent,
                  color: "white",
                  backgroundColor: itemAccent,
                }}
              >
                <Building2 size={14} aria-hidden="true" />
                {localize(item.organization, language)}
              </span>
            </div>
          ) : (
            <p className="mt-1.5 text-xs font-bold text-[var(--ink)] sm:text-sm">
              {localize(item.role, language)}
              <span className="px-2 text-[var(--muted)]">·</span>
              <span className="text-[var(--muted)]">{localize(item.organization, language)}</span>
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-3 md:justify-end">
          {item.imageUrl && (
            <img className="h-14 w-20 object-cover" src={item.imageUrl} alt="" loading="lazy" />
          )}
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-xs font-black text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={onToggle}
          >
            {expanded ? collapseLabel : detailsLabel}
            <ChevronDown className={`transition-transform ${expanded ? "rotate-180" : ""}`} size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded && (
        <div id={detailsId} className="mt-4 border-t border-dashed border-[var(--line)] pt-4 md:ml-[158px]">
          {highlights.length > 0 ? (
            <ol className="max-w-4xl divide-y divide-[var(--line)]" aria-label={localize(item.title, language)}>
              {highlights.map((highlight, index) => {
                const highlightTitle = localize(highlight.title, language);
                const highlightDescription = localize(highlight.description, language);
                const highlightLinks = highlight.links.filter((link) => link.url.trim());

                return (
                  <li key={highlight.id} className="grid gap-3 py-3 first:pt-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-4">
                    <span className="font-mono text-[10px] font-black leading-6 text-[var(--accent)]" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="prose-copy text-sm font-semibold leading-6 text-[var(--muted)]">
                        <ReactMarkdown>{highlightTitle}</ReactMarkdown>
                      </div>
                      {highlightDescription && (
                        <div className="prose-copy mt-1 text-xs leading-5 text-[var(--muted)]">
                          <ReactMarkdown>{highlightDescription}</ReactMarkdown>
                        </div>
                      )}
                      {highlightLinks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                          {highlightLinks.map((link) => (
                            <a
                              key={link.id}
                              className="inline-flex items-center gap-1 text-xs font-black text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:text-[var(--accent)]"
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {localize(link.label, language)} <ExternalLink size={12} aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {highlight.imageUrl && (
                      <img
                        className="h-20 w-28 border border-[var(--line)] object-cover sm:ml-3"
                        src={highlight.imageUrl}
                        alt={highlightTitle}
                        loading="lazy"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="prose-copy max-w-3xl text-sm leading-6 text-[var(--muted)]">
              <ReactMarkdown>{localize(item.description, language)}</ReactMarkdown>
            </div>
          )}
          {item.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {item.links.map((link) => (
                <a
                  key={link.id}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:text-[var(--accent)]"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {localize(link.label, language)} <ExternalLink size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function PortfolioApp({ previewContent }: PortfolioAppProps) {
  const portfolio = usePortfolioContent();
  const content = previewContent ?? portfolio.content;
  const loading = previewContent ? false : portfolio.loading;
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTag, setActiveTag] = useState("all");
  const [grouped, setGrouped] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(content.timeline.filter((item) => item.section === "talks").map((item) => item.id)),
  );
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = normalizeLanguage(params.get("lang"));
      const fromStorage = normalizeLanguage(window.localStorage.getItem("portfolio-language"));
      setLanguage(fromQuery ?? fromStorage ?? DEFAULT_LANGUAGE);

      const storedTheme = window.localStorage.getItem("portfolio-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(storedTheme === "dark" || (!storedTheme && prefersDark) ? "dark" : "light");
      setPreferencesReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.lang = language;
    window.localStorage.setItem("portfolio-language", language);
    document.cookie = `portfolio-language=${language}; path=/; max-age=31536000; SameSite=Lax`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    window.history.replaceState({}, "", url);
  }, [language, preferencesReady]);

  useEffect(() => {
    if (!preferencesReady) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("portfolio-theme", theme);
  }, [preferencesReady, theme]);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  const copy = uiCopy[language];
  const profile = content.profile;
  const visibleSections = useMemo(
    () => [...content.sections].filter((section) => section.visible).sort((a, b) => a.order - b.order),
    [content.sections],
  );
  const labels = useMemo(() => [...content.labels].sort((a, b) => a.order - b.order), [content.labels]);
  const labelLookup = useMemo(
    () => new Map(labels.map((label) => [label.id, { name: localize(label.name, language), accent: label.accent }])),
    [labels, language],
  );
  const filteredItems = useMemo(() => {
    const queryText = search.trim().toLocaleLowerCase();
    return [...content.timeline]
      .sort((a, b) => a.order - b.order)
      .filter((item) => activeTag === "all" || item.tags.includes(activeTag))
      .filter((item) => {
        if (!queryText) return true;
        const haystack = [
          localize(item.title, language),
          localize(item.role, language),
          localize(item.organization, language),
          localize(item.description, language),
          ...(item.highlights ?? []).flatMap((highlight) => [
            localize(highlight.title, language),
            localize(highlight.description, language),
          ]),
          item.period,
        ]
          .join(" ")
          .toLocaleLowerCase();
        return haystack.includes(queryText);
      });
  }, [activeTag, content.timeline, language, search]);
  const allVisibleExpanded = filteredItems.length > 0 && filteredItems.every((item) => expandedItems.has(item.id));
  const toggleItem = (itemId: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };
  const toggleAllVisible = () => {
    setExpandedItems((current) => {
      const next = new Set(current);
      filteredItems.forEach((item) => {
        if (allVisibleExpanded) next.delete(item.id);
        else next.add(item.id);
      });
      return next;
    });
  };
  const groupedArchive = useMemo(() => {
    const groups = visibleSections
      .map((section) => ({
        section,
        items: filteredItems.filter((item) => item.section === section.id),
      }))
      .filter((group) => group.items.length > 0);

    const configuredSectionIds = new Set(content.sections.map((section) => section.id));
    const fallbackItems = groups.length === 0
      ? filteredItems
      : filteredItems.filter((item) => !configuredSectionIds.has(item.section));

    if (fallbackItems.length > 0) {
      groups.push({
        section: {
          id: "archive-more",
          title: { en: "More from the archive", ko: "아카이브 더보기" },
          eyebrow: { en: "More milestones", ko: "더 많은 발자취" },
          order: Number.MAX_SAFE_INTEGER,
          visible: true,
          updatedAt: "",
        },
        items: fallbackItems,
      });
    }

    return groups;
  }, [content.sections, filteredItems, visibleSections]);

  const headline = localize(profile.headline, language);
  const headlineWords = headline.split(" ");
  const emphasisTerm = language === "en" ? "impact" : "영향력";
  const emphasisIndex = headlineWords.findIndex((word) => word.toLowerCase().includes(emphasisTerm));
  const today = new Date();
  const googleYears = Math.max(0, today.getFullYear() - 2015 - (today.getMonth() < 2 ? 1 : 0));

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--canvas)] text-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a className="text-sm font-black tracking-[0.18em]" href="#top" onClick={() => setMenuOpen(false)}>
            DANIEL SEO<span className="text-[var(--accent)]">.</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <a className="nav-link" href="#press">{copy.navPress}</a>
            <a className="nav-link" href="#story">{copy.navStory}</a>
            <a className="nav-link" href="#connect">{copy.navConnect}</a>
            <a className="nav-link" href="#work">{copy.navWork}</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="icon-button"
              type="button"
              aria-label={theme === "light" ? copy.themeDark : copy.themeLight}
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <div className="hidden items-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-1 sm:flex">
              {(["en", "ko"] as const).map((option) => (
                <button
                  key={option}
                  className={`rounded-full px-3 py-1.5 text-xs font-black transition ${language === option ? "bg-[var(--ink)] text-[var(--canvas)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
                  type="button"
                  onClick={() => changeLanguage(option)}
                  aria-pressed={language === option}
                >
                  {option === "en" ? "EN" : "한국어"}
                </button>
              ))}
            </div>
            <button className="icon-button md:hidden" type="button" aria-label="Open menu" onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[var(--line)] bg-[var(--canvas)] px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {[["#press", copy.navPress], ["#story", copy.navStory], ["#connect", copy.navConnect], ["#work", copy.navWork]].map(([href, label]) => (
                <a key={href} className="py-3 text-lg font-black" href={href} onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
            </nav>
            <div className="mt-4 flex gap-2 border-t border-[var(--line)] pt-5">
              <button className={`language-button ${language === "en" ? "active" : ""}`} onClick={() => changeLanguage("en")}>English</button>
              <button className={`language-button ${language === "ko" ? "active" : ""}`} onClick={() => changeLanguage("ko")}>한국어</button>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="mx-auto grid w-full max-w-[1480px] gap-8 px-5 pb-8 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,.55fr)] lg:px-12 lg:pb-12 lg:pt-12">
        <div className="flex min-w-0 flex-col">
          <div>
            <p className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              {localize(profile.location, language)} · {language === "en" ? "Global technology leader" : "글로벌 테크놀로지 리더"}
            </p>
            <h1 className="max-w-5xl text-[clamp(3.35rem,8vw,8.35rem)] font-black leading-[0.86] tracking-[-0.068em]">
              {headlineWords.map((word, index) => (
                <span key={`${word}-${index}`} className={index === emphasisIndex ? "text-[var(--accent)]" : ""}>
                  {word}{index < headlineWords.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)] md:text-xl">
              {localize(profile.summary, language)}
            </p>
          </div>

          <div className="mt-auto pt-8">
            <a className="secondary-link" href={`mailto:${profile.contactEmail}`}>
              {copy.contact}
            </a>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[var(--line)] py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent)]">{copy.focusLabel}</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {copy.focusAreas.map((area) => (
                  <li key={area} className="flex items-center gap-2 text-xs font-extrabold text-[var(--muted)] sm:text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]" aria-hidden="true" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="relative min-h-[430px] p-2 sm:min-h-[520px] sm:p-3">
          <div className="absolute inset-2 translate-x-3 translate-y-3 border border-[var(--line-strong)] bg-[var(--surface-soft)] sm:inset-3 sm:translate-x-4 sm:translate-y-4" aria-hidden="true" />
          <div className="absolute -left-1 top-14 z-20 h-28 w-1 bg-[var(--accent)]" aria-hidden="true" />
          <div className="relative h-full overflow-hidden border border-[var(--line-strong)] bg-[var(--surface)] shadow-[0_28px_70px_rgba(16,36,62,0.16)]">
            <div className="absolute left-5 top-5 z-10 border border-white/25 bg-[#10243e]/95 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
              {language === "en" ? "Open source since 2010" : "2010년부터 오픈소스 활동"}
            </div>
            <ProfileImage src={profile.avatarUrl} name={localize(profile.name, language)} />
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/15 bg-[#10243e]/95 p-5 text-white backdrop-blur sm:p-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#ff7a68]">{copy.current}</p>
                <p className="mt-1 text-lg font-black sm:text-xl">YouTube · Google</p>
                <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-white/70 sm:text-base">{localize(profile.title, language)}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-soft)]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex min-h-28 items-center justify-between gap-4 bg-[var(--surface)] px-5 py-5 sm:px-7 lg:px-8">
            <p className="text-[clamp(2.5rem,4vw,4rem)] font-black leading-none tracking-[-0.06em] text-[var(--accent)]">30+</p>
            <p className="max-w-28 text-right text-sm font-bold leading-5 text-[var(--muted)] lg:text-base">{copy.stats[0]}</p>
          </div>

          <div className="grid min-h-28 grid-cols-[minmax(0,1fr)_minmax(0,.95fr)] items-center gap-5 bg-[var(--surface)] px-5 py-5 sm:px-7 lg:px-8">
            <div>
              <p className="text-[clamp(2.5rem,4vw,4rem)] font-black leading-none tracking-[-0.06em] text-[var(--accent)]">{googleYears}+</p>
              <p className="mt-1.5 text-sm font-black leading-5 text-[var(--ink)]">{copy.stats[1]}</p>
            </div>
            <div className="grid gap-3 border-l border-[var(--line-strong)] pl-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-2xl font-black leading-none text-[var(--ink)]">6</p>
                <p className="max-w-20 text-right text-[11px] font-bold leading-4 text-[var(--muted)]">{copy.stats[2]}</p>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-2xl font-black leading-none text-[var(--ink)]">6+</p>
                <p className="max-w-20 text-right text-[11px] font-bold leading-4 text-[var(--muted)]">{copy.stats[3]}</p>
              </div>
            </div>
          </div>

          <div className="flex min-h-28 items-center justify-between gap-4 bg-[var(--surface)] px-5 py-5 sm:px-7 lg:px-8">
            <p className="text-[clamp(2.5rem,4vw,4rem)] font-black leading-none tracking-[-0.06em] text-[var(--accent)]">60+</p>
            <p className="max-w-28 text-right text-sm font-bold leading-5 text-[var(--muted)] lg:text-base">{copy.stats[4]}</p>
          </div>

          <div className="flex min-h-28 items-center justify-between gap-4 bg-[var(--surface)] px-5 py-5 sm:px-7 lg:px-8">
            <p className="text-[clamp(2.5rem,4vw,4rem)] font-black leading-none tracking-[-0.06em] text-[var(--accent)]">3,250+</p>
            <p className="max-w-28 text-right text-sm font-bold leading-5 text-[var(--muted)] lg:text-base">{copy.stats[5]}</p>
          </div>
        </div>
      </section>

      <section id="press" className="scroll-mt-24 border-b border-[var(--line)] bg-[var(--surface-soft)] px-5 pb-10 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pb-12 lg:pt-20">
        <div className="mx-auto max-w-[1384px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.62fr)] lg:items-end">
            <div>
              <p className="section-eyebrow">{copy.pressEyebrow}</p>
              <h2 className="section-title">{copy.pressTitle}</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--muted)] lg:justify-self-end">{copy.pressBody}</p>
          </div>

          <div className="mt-8 grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-3">
              {pressHighlights.map((item) => {
                const ItemIcon = item.kind === "linkedin" ? Linkedin : item.kind === "book" ? BookOpen : item.kind === "video" ? Play : Newspaper;

                return (
                  <a
                    key={item.id}
                    className="group flex min-h-full flex-col bg-[var(--surface)] transition-colors hover:bg-[var(--canvas)] focus-visible:bg-[var(--canvas)]"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${localize(item.title, language)} — ${copy.pressOpen}`}
                  >
                    <span className={`relative block aspect-video overflow-hidden ${item.kind === "book" ? "bg-white p-4" : "bg-[var(--surface-soft)]"}`}>
                      <img
                        className={`h-full w-full transition duration-500 group-hover:scale-[1.025] ${item.kind === "book" ? "object-contain object-center" : item.kind === "article" ? "object-cover object-top" : item.kind === "linkedin" ? "object-cover object-[center_28%]" : "object-cover object-center"}`}
                        src={item.image}
                        alt={localize(item.imageAlt, language)}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#10243e] text-white shadow-lg" aria-hidden="true">
                        <ItemIcon size={16} />
                      </span>
                    </span>
                    <span className="flex grow flex-col p-5">
                      <span className="block text-[10px] font-black uppercase tracking-[0.13em] text-[var(--accent)]">{localize(item.meta, language)}</span>
                      <span className="mt-2 block text-balance text-lg font-black leading-snug tracking-[-0.03em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] sm:text-xl">
                        {localize(item.title, language)}
                      </span>
                      <span className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-3 text-[11px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
                        {copy.pressOpen}
                        <ArrowUpRight className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" size={18} aria-hidden="true" />
                      </span>
                    </span>
                  </a>
                );
              })}
          </div>
        </div>
      </section>

      <section id="story" className="scroll-mt-24 border-y border-[var(--line)] bg-[var(--ink)] px-5 py-12 text-[var(--canvas)] sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1384px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.7fr)] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--lime)]">{copy.storyEyebrow}</p>
              <h2 className="mt-3 max-w-4xl text-[clamp(2.65rem,4.4vw,4.5rem)] font-black leading-[0.94] tracking-[-0.055em]">{copy.storyTitle}</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[color-mix(in_srgb,var(--canvas)_68%,transparent)]">{copy.storyBody}</p>
          </div>

          <a
            className="group mt-8 grid items-center gap-5 border border-[color-mix(in_srgb,var(--canvas)_22%,transparent)] bg-[color-mix(in_srgb,var(--canvas)_5%,transparent)] p-5 transition-colors hover:bg-[color-mix(in_srgb,var(--canvas)_9%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--canvas)_9%,transparent)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-6"
            href="https://donation-mentoring.org/?m=d9mm9slu"
            target="_blank"
            rel="noreferrer"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)] text-[#10243e]" aria-hidden="true">
              <UsersRound size={22} />
            </span>
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.16em] text-[var(--lime)]">{copy.mentoringProgram}</span>
              <span className="mt-2 block max-w-3xl text-base font-semibold leading-7 text-[color-mix(in_srgb,var(--canvas)_72%,transparent)] sm:text-lg">
                {copy.mentoringProgramBody}
              </span>
            </span>
            <span className="flex items-center gap-3 text-sm font-black text-[var(--canvas)] sm:justify-self-end">
              {copy.mentoringProfile}
              <ArrowUpRight className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={19} aria-hidden="true" />
            </span>
          </a>
        </div>
      </section>

      <section id="connect" className="scroll-mt-24 border-y border-[var(--line-strong)] bg-[var(--surface)] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1384px]">
          <p className="section-eyebrow">{copy.connectEyebrow}</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.55fr)] lg:items-end">
            <h2 className="text-[clamp(2.75rem,5vw,5rem)] font-black leading-[0.9] tracking-[-0.06em]">{copy.connectTitle}</h2>
            <div className="lg:justify-self-end">
              <p className="max-w-lg text-base leading-7 text-[var(--muted)]">{copy.connectBody}</p>
              <a className="primary-button mt-5" href={`mailto:${profile.contactEmail}`}>{profile.contactEmail} <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="scroll-mt-24 bg-[var(--canvas)] px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-20 lg:pt-12">
        <div className="mx-auto max-w-[1384px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.62fr)] lg:items-end">
            <div>
              <p className="section-eyebrow">{copy.archiveEyebrow}</p>
              <h2 className="mt-3 max-w-3xl text-[clamp(2.4rem,5vw,5rem)] font-black leading-[0.95] tracking-[-0.055em] text-balance">{copy.archiveTitle}</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted)] lg:justify-self-end">{copy.archiveBody}</p>
          </div>

          <div className="mt-8 border-y border-[var(--line)] py-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="scrollbar-none flex max-w-full gap-2 overflow-x-auto pb-1">
                <button className={`filter-button ${activeTag === "all" ? "active" : ""}`} onClick={() => setActiveTag("all")}>{copy.all}</button>
                {labels.map((label) => (
                  <button key={label.id} className={`filter-button ${activeTag === label.id ? "active" : ""}`} onClick={() => setActiveTag(label.id)}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: label.accent }} />
                    {localize(label.name, language)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex min-h-[2.55rem] shrink-0 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-xs font-black text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
                  type="button"
                  onClick={toggleAllVisible}
                  aria-pressed={allVisibleExpanded}
                >
                  {allVisibleExpanded ? copy.collapseAll : copy.expandAll}
                  <ChevronDown className={`transition-transform ${allVisibleExpanded ? "rotate-180" : ""}`} size={15} aria-hidden="true" />
                </button>
                <label className="relative min-w-0 flex-1 sm:min-w-[240px]">
                  <span className="sr-only">{copy.search}</span>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                  <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} />
                </label>
                <div className="flex shrink-0 rounded-full border border-[var(--line)] p-1">
                  <button className={`view-button ${grouped ? "active" : ""}`} onClick={() => setGrouped(true)}>{copy.grouped}</button>
                  <button className={`view-button ${!grouped ? "active" : ""}`} onClick={() => setGrouped(false)}>{copy.chronological}</button>
                </div>
              </div>
            </div>
          </div>

          {grouped && filteredItems.length > 0 && (
            <nav className="mt-4 flex items-center gap-4 overflow-hidden border-b border-[var(--line)] pb-4" aria-label={copy.archiveSections}>
              <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">{copy.archiveSections}</span>
              <div className="scrollbar-none flex min-w-0 gap-2 overflow-x-auto pb-1">
                {groupedArchive.map(({ section }) => {
                  const sectionAccent = archiveSectionAccents[section.id] ?? "var(--accent)";

                  return (
                    <a
                      key={section.id}
                      className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-extrabold text-[var(--muted)] no-underline transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                      href={`#archive-section-${section.id}`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sectionAccent }} aria-hidden="true" />
                      {localize(section.title, language)}
                    </a>
                  );
                })}
              </div>
            </nav>
          )}

          {loading && filteredItems.length === 0 ? (
            <div className="space-y-4 py-10" aria-label="Loading portfolio items">
              {[0, 1, 2, 3].map((item) => <div key={item} className="skeleton h-36 w-full" />)}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="my-10 border border-dashed border-[var(--line-strong)] py-16 text-center">
              <p className="text-xl font-black">{copy.noResults}</p>
              <button className="mt-4 text-sm font-black text-[var(--accent)] underline underline-offset-4" onClick={() => { setActiveTag("all"); setSearch(""); }}>{copy.clear}</button>
            </div>
          ) : grouped ? (
            <div className="mt-7 space-y-7">
              {groupedArchive.map(({ section, items }, sectionIndex) => {
                const sectionAccent = archiveSectionAccents[section.id] ?? "var(--accent)";
                const isTalksSection = section.id === "talks";
                const countLabel = isTalksSection
                  ? language === "en"
                    ? `${talkEngagementMetrics.engagements}+ engagements · ${talkEngagementMetrics.activeYears} years`
                    : `${talkEngagementMetrics.engagements}+개 활동 · ${talkEngagementMetrics.activeYears}년`
                  : language === "en"
                  ? `${items.length} ${items.length === 1 ? copy.archiveEntry : copy.archiveEntries}`
                  : `${items.length}${copy.archiveEntries}`;
                const talkMetrics = [
                  [talkEngagementMetrics.talksLecturesPresentations, copy.talkMetricTalks],
                  [talkEngagementMetrics.interviewsMedia, copy.talkMetricMedia],
                  [talkEngagementMetrics.panelsRoundtables, copy.talkMetricPanels],
                  [talkEngagementMetrics.mentoringSessions, copy.talkMetricMentoring],
                ] as const;

                return (
                  <section
                    key={section.id}
                    id={`archive-section-${section.id}`}
                    className="scroll-mt-28 overflow-hidden border border-l-4 border-[var(--line-strong)] bg-[var(--surface)]"
                    style={{ borderLeftColor: sectionAccent }}
                    aria-labelledby={`section-${section.id}`}
                  >
                    <div className="flex flex-wrap items-center gap-4 border-b border-[var(--line)] bg-[var(--surface-soft)] px-5 py-4 sm:flex-nowrap sm:px-6 lg:px-7">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--surface)] font-mono text-xs font-black"
                        style={{ color: sectionAccent }}
                        aria-hidden="true"
                      >
                        {String(sectionIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-[12rem] flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: sectionAccent }}>{localize(section.eyebrow, language)}</p>
                        <h3 id={`section-${section.id}`} className="mt-1 text-xl font-black tracking-[-0.03em] sm:text-2xl">{localize(section.title, language)}</h3>
                      </div>
                      <span className="ml-14 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-black text-[var(--muted)] sm:ml-0">
                        {countLabel}
                      </span>
                    </div>
                    {isTalksSection && (
                      <div className="grid grid-cols-2 border-b border-[var(--line)] bg-[var(--surface)] sm:grid-cols-4" aria-label={copy.talkMetricsLabel}>
                        {talkMetrics.map(([value, label], metricIndex) => (
                          <div
                            key={label}
                            className={`px-5 py-4 sm:px-6 ${metricIndex % 2 === 1 ? "border-l border-[var(--line)]" : ""} ${metricIndex > 1 ? "border-t border-[var(--line)] sm:border-t-0" : ""} ${metricIndex > 0 ? "sm:border-l sm:border-[var(--line)]" : ""}`}
                          >
                            <p className="text-2xl font-black leading-none tracking-[-0.045em]" style={{ color: sectionAccent }}>{value}+</p>
                            <p className="mt-1.5 text-[11px] font-bold leading-4 text-[var(--muted)]">{label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="px-5 sm:px-6 lg:px-7">{items.map((item) => <TimelineCard key={item.id} item={item} language={language} labelLookup={labelLookup} featuredLabel={copy.featured} expanded={expandedItems.has(item.id)} onToggle={() => toggleItem(item.id)} detailsLabel={copy.details} collapseLabel={copy.collapse} />)}</div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">{filteredItems.map((item) => <TimelineCard key={item.id} item={item} language={language} labelLookup={labelLookup} featuredLabel={copy.featured} expanded={expandedItems.has(item.id)} onToggle={() => toggleItem(item.id)} detailsLabel={copy.details} collapseLabel={copy.collapse} />)}</div>
          )}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1384px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.14em]">DANIEL SEO<span className="text-[var(--accent)]">.</span></p>
            <p className="mt-2 text-xs font-semibold text-[var(--muted)]">© {new Date().getFullYear()} Daniel Juyung Seo.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {profile.socialLinks.map((social) => (
              <a key={social.id} className="social-link" href={social.url} target="_blank" rel="noreferrer">
                {social.id === "linkedin" ? <Linkedin size={16} /> : social.id === "github" ? <Github size={16} /> : <ExternalLink size={16} />}
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
