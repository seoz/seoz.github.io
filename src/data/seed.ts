import { profileArchiveTimeline } from "@/src/data/profileArchive";
import type { PortfolioContent, PortfolioLabel, PortfolioSection, Profile } from "@/src/types/content";

const UPDATED_AT = "2026-09-01T00:00:00.000Z";

export const seedProfile: Profile = {
  id: "main",
  name: { en: "Daniel Juyung Seo", ko: "서주영" },
  title: { en: "Global Head of Partner Innovations & Engagement", ko: "글로벌 파트너 혁신 및 참여 총괄" },
  headline: { en: "Daniel turns ideas into impact.", ko: "Daniel은 아이디어를 실질적인 영향력으로 바꿉니다." },
  summary: {
    en: "At Google, I lead global partner innovation and engagement for YouTube Device Operations & Partner Engineering—bringing engineering teams, open-source communities, and partners together at a global scale.",
    ko: "Google YouTube 디바이스 운영 및 파트너 엔지니어링 조직에서 글로벌 파트너 혁신과 참여를 이끌며, 엔지니어링 팀과 오픈소스 커뮤니티, 파트너를 전 세계적으로 연결합니다.",
  },
  contactEmail: "seojuyung@gmail.com",
  location: { en: "San Francisco Bay Area, CA, USA", ko: "미국 캘리포니아 샌프란시스코 베이 지역" },
  avatarUrl: "/seoz.jpg",
  socialLinks: [
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/seoz/" },
    { id: "github", label: "GitHub", url: "https://github.com/seoz" },
  ],
  updatedAt: UPDATED_AT,
};

export const seedLabels: PortfolioLabel[] = [
  { id: "leadership", name: { en: "Leadership", ko: "리더십" }, accent: "#ff5b45", order: 0, updatedAt: UPDATED_AT },
  { id: "lecture", name: { en: "Lecture", ko: "강연" }, accent: "#7755d9", order: 1, updatedAt: UPDATED_AT },
  { id: "presentation", name: { en: "Presentation", ko: "발표" }, accent: "#0e8792", order: 2, updatedAt: UPDATED_AT },
  { id: "career", name: { en: "Career", ko: "경력" }, accent: "#2c61b7", order: 3, updatedAt: UPDATED_AT },
  { id: "open-source", name: { en: "Open source", ko: "오픈소스" }, accent: "#547c1f", order: 4, updatedAt: UPDATED_AT },
  { id: "publication", name: { en: "Publication", ko: "논문·기고" }, accent: "#bd4f80", order: 5, updatedAt: UPDATED_AT },
  { id: "mentoring", name: { en: "Mentoring", ko: "멘토링" }, accent: "#b87113", order: 6, updatedAt: UPDATED_AT },
  { id: "education", name: { en: "Education", ko: "교육" }, accent: "#476174", order: 7, updatedAt: UPDATED_AT },
  { id: "award", name: { en: "Award", ko: "수상" }, accent: "#9b6a16", order: 8, updatedAt: UPDATED_AT },
];

export const seedSections: PortfolioSection[] = [
  { id: "career", title: { en: "Career journey", ko: "커리어 여정" }, eyebrow: { en: "Building at scale", ko: "규모 있는 기술을 만들다" }, order: 0, visible: true, updatedAt: UPDATED_AT },
  { id: "mentoring", title: { en: "Mentoring & community", ko: "멘토링과 커뮤니티" }, eyebrow: { en: "Helping others grow", ko: "함께 성장하는 일" }, order: 1, visible: true, updatedAt: UPDATED_AT },
  { id: "open-source", title: { en: "Open-source contribution", ko: "오픈소스 기여" }, eyebrow: { en: "Learning in public", ko: "함께 배우고 기여하다" }, order: 2, visible: true, updatedAt: UPDATED_AT },
  { id: "publications", title: { en: "Research & publications", ko: "논문과 기고" }, eyebrow: { en: "Ideas in print", ko: "기록으로 남긴 생각" }, order: 3, visible: true, updatedAt: UPDATED_AT },
  { id: "awards", title: { en: "Awards", ko: "수상" }, eyebrow: { en: "Recognition along the way", ko: "여정에서 받은 인정" }, order: 4, visible: true, updatedAt: UPDATED_AT },
  { id: "education", title: { en: "Education", ko: "교육" }, eyebrow: { en: "A foundation in computing", ko: "컴퓨팅의 기초" }, order: 5, visible: true, updatedAt: UPDATED_AT },
  { id: "talks", title: { en: "Presentations, lectures & interviews", ko: "발표·강연·인터뷰" }, eyebrow: { en: "Sharing what works", ko: "경험을 나누는 일" }, order: 6, visible: true, updatedAt: UPDATED_AT },
];

export const seedTimeline = profileArchiveTimeline;

export const seedContent: PortfolioContent = {
  profile: seedProfile,
  timeline: seedTimeline,
  sections: seedSections,
  labels: seedLabels,
};
