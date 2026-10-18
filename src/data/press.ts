import type { PressCard, PressContent } from "@/src/types/content";

export const seedPressCards: PressCard[] = [
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
];

export const seedPress: PressContent = {
  eyebrow: { en: "Featured conversations", ko: "주요 기사와 대화" },
  title: { en: "Professional portfolio & interviews.", ko: "프로페셔널 포트폴리오와 인터뷰." },
  body: { en: "Selected interviews, features, and conversations about engineering, open source, and global leadership.", ko: "엔지니어링과 오픈소스, 글로벌 리더십에 관한 주요 인터뷰와 기사, 대화를 모았습니다." },
  cards: seedPressCards,
};
