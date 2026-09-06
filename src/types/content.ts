export type Language = "en" | "ko";

export type LocalizedText = {
  en: string;
  ko: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
};

export type Profile = {
  id: "main";
  name: LocalizedText;
  title: LocalizedText;
  headline: LocalizedText;
  summary: LocalizedText;
  contactEmail: string;
  location: LocalizedText;
  avatarUrl: string;
  socialLinks: SocialLink[];
  updatedAt: string;
};

export type TimelineLink = {
  id: string;
  label: LocalizedText;
  url: string;
};

export type TimelineHighlight = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  imageUrl: string;
  links: TimelineLink[];
};

export type TimelineItem = {
  id: string;
  title: LocalizedText;
  role: LocalizedText;
  organization: LocalizedText;
  period: string;
  location: LocalizedText;
  description: LocalizedText;
  links: TimelineLink[];
  highlights?: TimelineHighlight[];
  tags: string[];
  section: string;
  imageUrl: string;
  featured: boolean;
  order: number;
  updatedAt: string;
};

export type PortfolioSection = {
  id: string;
  title: LocalizedText;
  eyebrow: LocalizedText;
  order: number;
  visible: boolean;
  updatedAt: string;
};

export type PortfolioLabel = {
  id: string;
  name: LocalizedText;
  accent: string;
  order: number;
  updatedAt: string;
};

export type PortfolioContent = {
  profile: Profile;
  timeline: TimelineItem[];
  sections: PortfolioSection[];
  labels: PortfolioLabel[];
};
