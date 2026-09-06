import type { LocalizedText, TimelineHighlight, TimelineItem } from "@/src/types/content";

const UPDATED_AT = "2026-09-01T00:00:00.000Z";

type ArchiveItemInput = {
  id: string;
  title: LocalizedText;
  role: LocalizedText;
  organization: LocalizedText;
  period: string;
  location?: LocalizedText;
  description: LocalizedText;
  tags: string[];
  section: string;
  highlights?: TimelineHighlight[];
  featured?: boolean;
  order: number;
};

const defaultLocation: LocalizedText = { en: "Various locations", ko: "여러 지역" };

function archiveItem(input: ArchiveItemInput): TimelineItem {
  return {
    ...input,
    location: input.location ?? defaultLocation,
    links: [],
    imageUrl: "",
    featured: input.featured ?? false,
    updatedAt: UPDATED_AT,
  };
}

type YearDigest = {
  year: number;
  title: LocalizedText;
  en: string[];
  ko: string[];
  featured?: boolean;
};

const talkDigests: YearDigest[] = [
  {
    year: 2026,
    title: { en: "Leading through the AI shift", ko: "AI 전환기의 리더십" },
    featured: true,
    en: [
      "Aug 25 — ‘AI-centered work’ lecture for POSCO International employees",
      "Jul 28 — ‘How to build a career in the AI era’ for the Global Software Education Program",
      "Apr 22 — Lightning talk for Samsung Research Display Innovation Lab",
      "Feb 19 and Feb 16 — Two career and startup mentoring sessions for the 16th SW Maestro cohort",
      "Jan 25 — Panelist, ‘Working wisely: Big Tech,’ BayAreaKGroup Young Professional Network",
      "Jan 6 — Panelist, Digital Youth Talent Talk Concert at CES 2026, hosted by MSIT and IITP",
    ],
    ko: [
      "8월 25일 — 포스코인터내셔널 직원 대상 ‘AI 중심 업무’ 강연",
      "7월 28일 — 글로벌 SW교육 프로그램 학생 대상 ‘AI 시대, 어떻게 커리어를 개척할 것인가’ 강의",
      "4월 22일 — 삼성리서치 디스플레이 이노베이션랩 라이트닝 토크",
      "2월 19일·16일 — SW마에스트로 16기 취·창업 멘토링 2회",
      "1월 25일 — BayAreaKGroup YPN ‘슬기로운 직장생활: 빅테크편’ 패널",
      "1월 6일 — 과학기술정보통신부·IITP 주관 CES 2026 디지털 청년인재 토크콘서트 패널",
    ],
  },
  {
    year: 2025,
    title: { en: "From Silicon Valley to the next generation", ko: "실리콘밸리에서 다음 세대로" },
    featured: true,
    en: [
      "Sep 8 — Welcome address for Google Campus Outreach at Ajou University",
      "Jul 29 — ‘Becoming a global team leader in Silicon Valley,’ KIC Silicon Valley and Soongsil Spartan SW",
      "May 24 — Ringle webinar, ‘How a Korea-trained developer became a YouTube engineering manager’",
      "May 16 — Korean-American researcher roundtable with MSIT, ETRI, and NIPA",
      "Mar — Filmed an internal LG Group documentary",
      "Jan 27 — Career and startup mentoring for the 15th SW Maestro cohort",
      "Jan 10 — ICT Mentoring roundtable at Google Silicon Valley",
    ],
    ko: [
      "9월 8일 — 아주대학교 Google Campus Outreach 환영사(녹화영상)",
      "7월 29일 — KIC 실리콘밸리·숭실대 스파르탄SW ‘실리콘밸리에서 글로벌팀장이 되기까지’ 강의",
      "5월 24일 — 링글 ‘국내파 개발자가 유튜브 엔지니어링 매니저가 된 비결’ 웨비나",
      "5월 16일 — 과학기술정보통신부·ETRI·NIPA 재미 한인 연구자 간담회",
      "3월 — LG그룹 사내 다큐멘터리 촬영",
      "1월 27일 — SW마에스트로 15기 취·창업 멘토링",
      "1월 10일 — 구글 실리콘밸리 ICT멘토링 간담회",
    ],
  },
  {
    year: 2024,
    title: { en: "Global leadership, partnership & growth", ko: "글로벌 리더십과 파트너십, 성장" },
    en: [
      "Apr 30 — Special interview, ‘Becoming a programmer with global leadership,’ in [How to Become a Better Programmer](https://www.yes24.com/Product/Goods/126110870)",
      "Apr 27 — Ringle Career Up webinar, ‘From struggling with English to leading a global Google team in Silicon Valley’",
      "Apr 23 — ‘NFL Sunday Ticket,’ YouTube Partner Summit 2024 in Seoul",
    ],
    ko: [
      "4월 30일 — 도서 [더 나은 프로그래머 되는 법](https://www.yes24.com/Product/Goods/126110870) 특별부록 ‘글로벌 리더십을 가진 프로그래머 되기’ 인터뷰",
      "4월 27일 — 링글 커리어업 ‘영알못이 실리콘밸리에서 구글 글로벌팀장이 되기까지’ 웨비나",
      "4월 23일 — 서울 YouTube Partner Summit 2024 ‘NFL Sunday Ticket’ 발표",
    ],
  },
  {
    year: 2023,
    title: { en: "Connecting classrooms and industry", ko: "교실과 산업을 연결하다" },
    en: [
      "Jul 26 — ‘From computer science student to global team leader in Silicon Valley,’ KIC Silicon Valley and Soongsil Spartan SW",
      "Jun 13 — Ajou University software career seminar",
      "Apr 28 — ‘Collaborations on Industry Innovations,’ YouTube Device Partner Summit 2023 at COEX",
      "Apr 13 — Industry lecture at Kookmin University",
    ],
    ko: [
      "7월 26일 — KIC 실리콘밸리·숭실대 스파르탄SW ‘컴퓨터 공학도가 실리콘밸리에서 글로벌팀장이 되기까지’ 강의",
      "6월 13일 — 아주대학교 SW커리어세미나 강의",
      "4월 28일 — 코엑스 YouTube Device Partner Summit 2023 ‘Collaborations on Industry Innovations’ 발표",
      "4월 13일 — 국민대학교 산업체 특강",
    ],
  },
  {
    year: 2022,
    title: { en: "Culture, partnership & candid conversations", ko: "문화와 파트너십, 솔직한 대화" },
    en: [
      "Dec 23 — ‘The Samsung and Google cultures I experienced,’ Samsung SWITCH seminar",
      "Oct — Samsung Electronics Gen Z Lab interview",
      "Aug 6 — Speaker and panelist, Ringle Meetup at San Mateo",
      "May 19 — ‘Technical Requirements Overview,’ YouTube Device Partner Summit at YouTube headquarters",
      "Mar — Korea Daily Times interview",
      "Jan — Featured in Ringle’s video, [Why a Google YouTube engineer chose Ringle](https://www.youtube.com/watch?v=X1fIuXDkZxs)",
    ],
    ko: [
      "12월 23일 — 삼성전자 SWITCH 사무국 ‘내가 경험한 삼성과 구글의 문화’ 세미나 발표",
      "10월 — 삼성전자 Gen Z Lab 인터뷰",
      "8월 6일 — 링글 밋업 @ San Mateo 연사·패널",
      "5월 19일 — 유튜브 본사 YouTube Device Partner Summit ‘Technical Requirements Overview’ 발표",
      "3월 — 코리아데일리타임즈 인터뷰",
      "1월 — 링글 [구글 YouTube 엔지니어가 링글을 선택한 이유](https://www.youtube.com/watch?v=X1fIuXDkZxs) 광고 출연",
    ],
  },
  {
    year: 2021,
    title: { en: "From a love of coding to leadership", ko: "코딩을 좋아하던 아이에서 리더로" },
    en: ["Aug 25 — ‘From a child who loved coding to an engineering manager in Silicon Valley,’ Republic of Korea Army V Corps seminar"],
    ko: ["8월 25일 — 육군 5군단 ‘코딩을 좋아하던 아이가 실리콘밸리에서 엔지니어링 매니저가 되기까지’ 세미나"],
  },
  {
    year: 2020,
    title: { en: "Open source as a career compass", ko: "커리어의 나침반이 된 오픈소스" },
    featured: true,
    en: [
      "Nov 30 — Keynote, ‘Open source and the developer’s career,’ 2020 Open Source Software Festival",
      "Jun 19 — Ringle Career Talk for developers and UI/UX designers",
      "Jan 25 — ‘From open-source developer to Silicon Valley team lead,’ KIC Silicon Valley and SW Maestro",
    ],
    ko: [
      "11월 30일 — 2020 공개SW 페스티벌 ‘오픈소스, 그리고 개발자의 커리어’ 키노트",
      "6월 19일 — 개발자·UI/UX 디자이너 대상 링글 커리어 토크",
      "1월 25일 — KIC 실리콘밸리·SW마에스트로 ‘오픈소스 개발자가 실리콘밸리에서 팀리드가 되기까지’ 강의",
    ],
  },
  {
    year: 2019,
    title: { en: "The road from open source to Silicon Valley", ko: "오픈소스에서 실리콘밸리까지" },
    en: [
      "Jul 20 — Guest on Hong Jeong-mo’s YouTube channel: [full interview](https://www.youtube.com/watch?v=_rUqBN4-pt8), [working at Google](https://www.youtube.com/watch?v=lnbYdqf2T4Y), and [learning English](https://www.youtube.com/watch?v=V0190bveFWM)",
      "Jul 19 — ‘An open-source developer’s path to Silicon Valley,’ KIC Silicon Valley Spartan SW",
    ],
    ko: [
      "7월 20일 — 홍정모 YouTube 채널 출연: [전체 영상](https://www.youtube.com/watch?v=_rUqBN4-pt8), [미국 구글 취업 준비](https://www.youtube.com/watch?v=lnbYdqf2T4Y), [영어 공부](https://www.youtube.com/watch?v=V0190bveFWM)",
      "7월 19일 — KIC 실리콘밸리 스파르탄SW ‘오픈소스 개발자가 실리콘밸리에 오기까지’ 강의",
    ],
  },
  {
    year: 2018,
    title: { en: "Coding, communication & community", ko: "코딩과 소통, 커뮤니티" },
    en: [
      "Nov 6 — ZDNet interview, [‘Coding is communication… Build software skills through open source’](http://www.zdnet.co.kr/view/?no=20181107095322)",
      "Oct 12 — ‘Open source and the software engineer,’ Kyung Hee University technology colloquium",
    ],
    ko: [
      "11월 6일 — ZDNet [‘코딩도 소통… SW실력 늘려면 공개SW 활동해야’](http://www.zdnet.co.kr/view/?no=20181107095322) 인터뷰",
      "10월 12일 — 경희대학교 최신기술 콜로키움 ‘오픈소스와 소프트웨어 엔지니어’ 강의",
    ],
  },
  {
    year: 2017,
    title: { en: "Taking open source back to campus", ko: "캠퍼스로 찾아간 오픈소스" },
    en: [
      "Nov 17 and Nov 10 — ‘Give your university life wings with open source,’ Chung-Ang and Kwangwoon Universities",
      "Sep 20 and May 29 — Open-source lectures at Myongji and Kyung Hee Universities",
      "Jul 1 — ‘Open source and code review,’ OSS Developers Forum",
      "Feb 7 — ‘Patching open-source security vulnerabilities with IoTcube,’ IoTcubeCon",
    ],
    ko: [
      "11월 17일·10일 — 중앙대학교·광운대학교 ‘오픈 소스로 대학 생활에 날개달기’ 강의",
      "9월 20일·5월 29일 — 명지대학교·경희대학교 오픈소스 특강",
      "7월 1일 — OSS개발자포럼 ‘오픈 소스와 코드 리뷰’ 발표",
      "2월 7일 — IoTcubeCon ‘IoTcube를 활용한 오픈소스 보안 취약점 패치 사례’ 발표",
    ],
  },
  {
    year: 2016,
    title: { en: "Teaching open source from code to career", ko: "코드부터 커리어까지, 오픈소스를 가르치다" },
    en: [
      "Nov — Open-source lectures at Kyung Hee, Myongji, and Ajou Universities, plus GDG DevFest Seoul",
      "Oct — ‘Developer self-development through open source,’ OSS Developers Forum",
      "Jul–Sep — Internal coding course for non-engineers at Google Korea",
      "Jun 20 — ‘Contributing to Enlightenment Foundation Libraries,’ KRnet 2016",
      "Mar 30 — ‘Security and the software engineer,’ Ajou University",
    ],
    ko: [
      "11월 — 경희대·명지대·아주대 오픈소스 특강 및 GDG DevFest Seoul 발표",
      "10월 — OSS개발자포럼 ‘오픈소스를 활용한 개발자 자기 개발’ 발표",
      "7~9월 — 구글코리아 비엔지니어 대상 사내 코딩 강의",
      "6월 20일 — KRnet 2016 ‘Contributing to Enlightenment Foundation Libraries’ 발표",
      "3월 30일 — 아주대학교 ‘보안과 소프트웨어 엔지니어’ 강의",
    ],
  },
  {
    year: 2015,
    title: { en: "Growing into a global software engineer", ko: "글로벌 소프트웨어 엔지니어로 성장하다" },
    en: [
      "Dec–Feb 2016 — Internal coding course for non-engineers at Google Korea",
      "Dec 5 — ‘Growing into a global software engineer,’ Ajou Greative Software Concert",
      "Nov 19 — ‘Google culture and Googlers,’ Chungbuk National University",
      "Oct 28 — ‘How a 16-year-old EFL project is managed and released,’ SOSCON",
      "Aug 13 — ‘Living well as a developer,’ OSS Developers Forum and Kookmin University summer camp",
      "Jan 14 — ‘Tizen App Development,’ Samsung Z1 launch partner event in Bangalore",
    ],
    ko: [
      "12월~2016년 2월 — 구글코리아 비엔지니어 대상 사내 코딩 강의",
      "12월 5일 — Ajou Greative 소프트웨어 콘서트 ‘글로벌 SW엔지니어로 성장하기’ 발표",
      "11월 19일 — 충북대학교 ‘구글의 문화와 구글러’ 특강",
      "10월 28일 — SOSCON ‘16살 된 EFL은 어떻게 관리하고 배포할까?’ 발표",
      "8월 13일 — OSS개발자포럼·국민대 여름캠프 ‘개발자로 멋지게 살아보자’ 발표",
      "1월 14일 — 인도 방갈로 Samsung Z1 파트너 행사 ‘Tizen App Development’ 발표",
    ],
  },
  {
    year: 2014,
    title: { en: "Taking Tizen and EFL worldwide", ko: "Tizen과 EFL을 세계로" },
    en: [
      "Dec — Tizen webinar ‘Native UI Application Development’ and Developer Day EFL Korea presentation",
      "Nov — Tizen/EFL online course, Korea Community Day, and Korea LUG seminar",
      "Sep–Oct — EFL Korea Seminar, Samsung Software Membership, and internal open-source talks",
      "Jul 23 and Jun 3 — ‘The Art of Tizen UI Theme Technology’ at OSCON Portland and Tizen Developer Conference San Francisco",
      "Jun 28 — OSS Developers Forum talk, [‘Open source and English’](https://www.youtube.com/watch?v=pkjnpTH0IwU)",
      "Feb–Apr — EFL code review, Open Source Fundamentals, and Web OS public seminar talks",
    ],
    ko: [
      "12월 — Tizen 웨비나 ‘Native UI Application Development’ 및 Developer Day EFL 한국 커뮤니티 소개",
      "11월 — Tizen·EFL 온라인 강의, 대한민국 커뮤니티 데이, 한국 LUG 세미나 발표",
      "9~10월 — EFL 한국 세미나, 삼성 소프트웨어멤버십, 사내 오픈소스 발표",
      "7월 23일·6월 3일 — OSCON 포틀랜드·Tizen Developer Conference 샌프란시스코 ‘The Art of Tizen UI Theme Technology’ 발표",
      "6월 28일 — OSS개발자포럼 [‘오픈소스와 영어’](https://www.youtube.com/watch?v=pkjnpTH0IwU) 발표",
      "2~4월 — EFL 코드리뷰, Open Source Fundamentals, Web OS 공개 세미나 발표",
    ],
  },
  {
    year: 2013,
    title: { en: "Building the EFL learning community", ko: "EFL 학습 커뮤니티를 만들다" },
    en: [
      "Jun and Mar — Tizen UIFW EFL Development courses at Samsung Electronics",
      "May 11 — Organized EFL Korean Seminar 2013 and presented the community session",
      "Feb — EFL use-case talk in Samsung Open Source Fundamentals",
    ],
    ko: [
      "6월·3월 — 삼성전자 Tizen UIFW EFL Development 강의",
      "5월 11일 — EFL Korean Seminar 2013 주최 및 커뮤니티 세션 발표",
      "2월 — 삼성전자 Open Source Fundamentals EFL 활용 사례 발표",
    ],
  },
  {
    year: 2012,
    title: { en: "The first public stages", ko: "첫 공개 무대" },
    en: [
      "Oct — Daum DevOn ‘Building rich, lightweight, fast apps with EFL’ and Samsung Open Source Contributor Day",
      "Aug — ‘Enlightenment,’ GNOME Korea meetup",
    ],
    ko: [
      "10월 — 다음 DevOn ‘EFL 툴킷으로 화려하면서도 가볍고 빠른 앱 만들기’ 및 삼성 오픈소스 컨트리뷰터 데이 발표",
      "8월 — 그놈 한국 정기 모임 ‘Enlightenment’ 발표",
    ],
  },
];

const talkHighlightEnhancements: Record<string, Partial<TimelineHighlight>> = {
  "2024-1": {
    title: {
      en: "Apr 30 — Special interview in How to Become a Better Programmer",
      ko: "4월 30일 — 도서 ‘더 나은 프로그래머 되는 법’ 특별 인터뷰",
    },
    description: {
      en: "A long-form conversation about technical growth and leading across cultures.",
      ko: "기술적 성장과 다양한 문화를 아우르는 리더십에 관한 심층 대화입니다.",
    },
    imageUrl: "/press/better-programmer.jpg",
    links: [
      {
        id: "book-interview",
        label: { en: "View the book", ko: "도서 보기" },
        url: "https://www.yes24.com/Product/Goods/126110870",
      },
    ],
  },
  "2022-6": {
    title: {
      en: "Jan — Featured in Ringle’s video on learning English at Google",
      ko: "1월 — 구글 YouTube 엔지니어의 영어 학습을 다룬 링글 영상 출연",
    },
    links: [
      {
        id: "ringle-video",
        label: { en: "Watch video", ko: "영상 보기" },
        url: "https://www.youtube.com/watch?v=X1fIuXDkZxs",
      },
    ],
  },
  "2019-1": {
    title: {
      en: "Jul 20 — Guest interview on Hong Jeong-mo’s YouTube channel",
      ko: "7월 20일 — 홍정모 YouTube 채널 인터뷰",
    },
    description: {
      en: "A three-part conversation about Google, career transitions, and learning English.",
      ko: "Google 취업과 커리어 전환, 영어 학습을 다룬 3부작 대화입니다.",
    },
    imageUrl: "/press/hong-jeong-mo.jpg",
    links: [
      { id: "full-interview", label: { en: "Full interview", ko: "전체 영상" }, url: "https://www.youtube.com/watch?v=_rUqBN4-pt8" },
      { id: "working-at-google", label: { en: "Working at Google", ko: "미국 구글 취업 준비" }, url: "https://www.youtube.com/watch?v=lnbYdqf2T4Y" },
      { id: "learning-english", label: { en: "Learning English", ko: "영어 공부" }, url: "https://www.youtube.com/watch?v=V0190bveFWM" },
    ],
  },
  "2018-1": {
    title: {
      en: "Nov 6 — ZDNet interview on coding, communication, and open source",
      ko: "11월 6일 — 코딩과 소통, 오픈소스에 관한 ZDNet 인터뷰",
    },
    description: {
      en: "An interview on how public collaboration sharpens practical software skills.",
      ko: "공개 협업이 실전 소프트웨어 역량을 키우는 방법을 다룬 인터뷰입니다.",
    },
    imageUrl: "/press/zdnet-interview.jpg",
    links: [
      { id: "zdnet-interview", label: { en: "Read interview", ko: "인터뷰 읽기" }, url: "http://www.zdnet.co.kr/view/?no=20181107095322" },
    ],
  },
  "2014-5": {
    title: {
      en: "Jun 28 — ‘Open source and English,’ OSS Developers Forum",
      ko: "6월 28일 — OSS개발자포럼 ‘오픈소스와 영어’ 발표",
    },
    links: [
      { id: "open-source-and-english", label: { en: "Watch talk", ko: "발표 보기" }, url: "https://www.youtube.com/watch?v=pkjnpTH0IwU" },
    ],
  },
};

function buildTalkHighlights(digest: YearDigest): TimelineHighlight[] {
  return digest.en.map((entry, index) => {
    const enhancement = talkHighlightEnhancements[`${digest.year}-${index + 1}`];
    return {
      id: `${digest.year}-${index + 1}`,
      title: enhancement?.title ?? { en: entry, ko: digest.ko[index] ?? entry },
      description: enhancement?.description ?? { en: "", ko: "" },
      imageUrl: enhancement?.imageUrl ?? "",
      links: enhancement?.links ?? [],
    };
  });
}

// Each format count classifies one documented digest entry by its primary format.
// A few entries cover multiple appearances, so the UI presents these as minimums.
export const talkEngagementMetrics = {
  engagements: talkDigests.reduce((total, digest) => total + digest.en.length, 0),
  activeYears: talkDigests.length,
  talksLecturesPresentations: 46,
  interviewsMedia: 7,
  panelsRoundtables: 5,
  mentoringSessions: 2,
} as const;

const talkItems = talkDigests.map((digest, index) =>
  archiveItem({
    id: `talks-${digest.year}`,
    title: digest.title,
    role: { en: "Speaker, panelist, and mentor", ko: "연사·패널·멘토" },
    organization: { en: "Selected public and industry events", ko: "주요 공개·산업 행사" },
    period: String(digest.year),
    description: {
      en: digest.en.map((entry) => `- ${entry}`).join("\n"),
      ko: digest.ko.map((entry) => `- ${entry}`).join("\n"),
    },
    highlights: buildTalkHighlights(digest),
    tags: ["lecture", "presentation", "leadership"],
    section: "talks",
    featured: digest.featured,
    order: 100 + index,
  }),
);

export const profileArchiveTimeline: TimelineItem[] = [
  archiveItem({
    id: "google-career",
    title: { en: "YouTube Partner Engineering", ko: "YouTube 파트너 엔지니어링" },
    role: { en: "Senior Staff Partner Engineering Manager · Global Team Manager", ko: "시니어 스태프 파트너 엔지니어링 매니저 · 글로벌팀장·상무" },
    organization: { en: "Google", ko: "Google" },
    period: "2015-03 — Present",
    location: { en: "San Francisco Bay Area, California", ko: "미국 캘리포니아 샌프란시스코 베이 지역" },
    description: {
      en: "Leads global partner engineering for YouTube, connecting technical strategy, device ecosystems, partner innovation, and team development.",
      ko: "Google YouTube 파트너 엔지니어링 글로벌팀장으로 기술 전략과 디바이스 생태계, 파트너 혁신, 팀 성장을 이끌고 있습니다.",
    },
    tags: ["career", "leadership"],
    section: "career",
    featured: true,
    order: 0,
  }),
  archiveItem({
    id: "samsung-career",
    title: { en: "Software Center · DMC R&D", ko: "SW센터 · DMC 연구소" },
    role: { en: "Senior Software Engineer", ko: "수석 소프트웨어 엔지니어" },
    organization: { en: "Samsung Electronics", ko: "삼성전자" },
    period: "2009-03 — 2015-03",
    location: { en: "Suwon, Korea", ko: "대한민국 수원" },
    description: {
      en: "Developed and improved EFL and the Tizen platform, contributing to products including the NX300 camera, Gear 2, and Gear S while serving as a technical leader and mentor.",
      ko: "EFL과 Tizen 플랫폼을 개발·개선하고 NX300 카메라, Gear 2, Gear S 제품에 참여했으며 기술 리더와 멘토 역할을 맡았습니다.",
    },
    tags: ["career", "open-source", "leadership"],
    section: "career",
    order: 1,
  }),
  archiveItem({
    id: "early-web-career",
    title: { en: "Early web development & programming leadership", ko: "초기 웹 개발과 프로그래밍 리더십" },
    role: { en: "Web developer and programming team lead", ko: "웹 개발자·프로그래밍 팀장" },
    organization: { en: "KBN, NiceEye, Ajou4U, DMC, Eif, and Anystudy", ko: "KBN·나이스아이·Ajou4U·DMC·Eif·애니스터디" },
    period: "2000 — 2008",
    location: { en: "Korea", ko: "대한민국" },
    description: {
      en: "Built and maintained community, education, medical-device, and company websites; served as programming team lead for NiceEye and Ajou4U.",
      ko: "커뮤니티·교육·의료기기·기업 웹사이트를 구축·유지보수하고 나이스아이와 Ajou4U 프로그래밍 팀장을 맡았습니다.",
    },
    tags: ["career", "leadership"],
    section: "career",
    order: 2,
  }),
  ...talkItems,
  archiveItem({
    id: "donation-mentoring",
    title: { en: "Donation Mentoring", ko: "기부멘토링" },
    role: { en: "Volunteer mentor", ko: "기부 멘토" },
    organization: { en: "donation-mentoring.org", ko: "기부멘토링" },
    period: "2025-10 — Present",
    location: { en: "Global · Online", ko: "글로벌·온라인" },
    description: {
      en: "Provides volunteer mentoring through Donation Mentoring, sharing practical guidance on software careers and technical leadership. [View Daniel’s mentor page](https://donation-mentoring.org/?m=d9mm9slu).",
      ko: "기부멘토링을 통해 소프트웨어 커리어와 기술 리더십에 관한 실질적인 조언을 나눕니다. [Daniel의 멘토 페이지 보기](https://donation-mentoring.org/?m=d9mm9slu).",
    },
    tags: ["mentoring", "leadership"],
    section: "mentoring",
    featured: true,
    order: 200,
  }),
  archiveItem({
    id: "nipa-open-frontier-mentor",
    title: { en: "Open Frontier Program", ko: "오픈프론티어 사업" },
    role: { en: "Technical mentor", ko: "기술 멘토" },
    organization: { en: "National IT Industry Promotion Agency (NIPA)", ko: "정보통신산업진흥원(NIPA)" },
    period: "2013-12 — 2014-11",
    location: { en: "Korea", ko: "대한민국" },
    description: {
      en: "Mentored open-source contributors in a Korean government program supporting globally competitive open-source developers.",
      ko: "글로벌 경쟁력을 갖춘 오픈소스 개발자를 지원하는 정부 주관 사업에서 멘토로 활동했습니다.",
    },
    tags: ["mentoring", "open-source"],
    section: "mentoring",
    order: 201,
  }),
  archiveItem({
    id: "samsung-efl-mentor-2013",
    title: { en: "EFL open-source mentoring program", ko: "EFL 오픈소스 멘토링 프로그램" },
    role: { en: "Mentor · Excellence Award", ko: "멘토 · 우수상" },
    organization: { en: "Samsung Electronics", ko: "삼성전자" },
    period: "2013-03 — 2013-10",
    location: { en: "Korea", ko: "대한민국" },
    description: {
      en: "Guided contributors through hands-on EFL open-source work; the mentoring program received an Excellence Award.",
      ko: "EFL 오픈소스 기여 활동을 실습 중심으로 멘토링했으며 우수상을 받았습니다.",
    },
    tags: ["mentoring", "open-source"],
    section: "mentoring",
    order: 202,
  }),
  archiveItem({
    id: "google-ml-study-2016",
    title: { en: "Google Korea machine-learning study group", ko: "구글코리아 머신러닝 스터디 그룹" },
    role: { en: "Founder and organizer", ko: "창설·운영" },
    organization: { en: "Google Korea", ko: "구글코리아" },
    period: "2016 — 2017",
    location: { en: "Korea", ko: "대한민국" },
    description: {
      en: "Founded and ran four seasons of an internal machine-learning study group.",
      ko: "사내 머신러닝 스터디 그룹을 창설하고 시즌 1~4를 운영했습니다.",
    },
    tags: ["mentoring", "leadership"],
    section: "mentoring",
    order: 203,
  }),
  archiveItem({
    id: "efl-committer",
    title: { en: "Enlightenment Foundation Libraries", ko: "Enlightenment Foundation Libraries" },
    role: { en: "Official committer, release manager, and community leader", ko: "공식 커미터·릴리스 매니저·커뮤니티 리더" },
    organization: { en: "Enlightenment Project", ko: "Enlightenment 프로젝트" },
    period: "2011-02 — Present",
    location: { en: "Global", ko: "글로벌" },
    description: {
      en: "One of the first Korean EFL committers. Contributed more than 3,250 commits by November 2014 and served in release, community, and mentoring roles.",
      ko: "한국인 최초 EFL 커미터 중 한 명으로 2014년 11월 기준 3,250회 이상 커밋했으며 릴리스·커뮤니티·멘토링 역할을 맡았습니다.",
    },
    tags: ["open-source", "leadership", "mentoring"],
    section: "open-source",
    featured: true,
    order: 300,
  }),
  archiveItem({
    id: "tizen-open-source",
    title: { en: "Tizen open-source platform", ko: "Tizen 오픈소스 플랫폼" },
    role: { en: "Contributor and technical advocate", ko: "기여자·기술 전파자" },
    organization: { en: "Tizen Project", ko: "Tizen 프로젝트" },
    period: "2012 — Present",
    location: { en: "Global", ko: "글로벌" },
    description: {
      en: "Contributed to Tizen UI technology and shared practical development knowledge through products, conference sessions, webinars, articles, and community events.",
      ko: "Tizen UI 기술에 기여하고 제품 개발, 컨퍼런스 발표, 웨비나, 기고, 커뮤니티 행사를 통해 실무 지식을 나눴습니다.",
    },
    tags: ["open-source", "presentation", "publication"],
    section: "open-source",
    order: 301,
  }),
  archiveItem({
    id: "open-source-community-service",
    title: { en: "Open-source community service", ko: "오픈소스 커뮤니티 활동" },
    role: { en: "Organizer, translator, contributor, and advisor", ko: "운영자·번역자·기여자·전문위원" },
    organization: { en: "EFL Korea, GNOME Asia, Mozilla, Bodhi Linux, IoTcubeCon, and others", ko: "EFL 한국·GNOME Asia·Mozilla·Bodhi Linux·IoTcubeCon 등" },
    period: "2010 — Present",
    location: { en: "Global", ko: "글로벌" },
    description: {
      en: "Organized EFL Korean Seminar 2013, served on the GNOME Asia Summit organizing committee and as an IoTcubeCon expert, translated TED content, and contributed to Mozilla and Bodhi Linux localization.",
      ko: "EFL Korean Seminar 2013 개최, GNOME Asia Summit 준비위원, IoTcubeCon 전문위원, TED 번역, Mozilla 위키·Bodhi Linux 한글화 등에 참여했습니다.",
    },
    tags: ["open-source", "leadership"],
    section: "open-source",
    order: 302,
  }),
  archiveItem({
    id: "embedded-world-series-2013",
    title: { en: "Tizen: A Linux-based open-source platform", ko: "타이젠, 리눅스 기반 오픈소스 플랫폼" },
    role: { en: "Magazine series author", ko: "잡지 연재 저자" },
    organization: { en: "Embedded World", ko: "임베디드월드" },
    period: "2013-05 — 2014-02",
    location: { en: "Publication", ko: "기고" },
    description: {
      en: "Wrote a technical magazine series explaining the Tizen platform and its open-source foundations.",
      ko: "Tizen 플랫폼과 그 오픈소스 기반을 설명하는 기술 연재를 기고했습니다.",
    },
    tags: ["publication", "open-source"],
    section: "publications",
    order: 400,
  }),
  archiveItem({
    id: "microsoftware-articles-2012",
    title: { en: "EFL and Enlightenment technical articles", ko: "EFL·Enlightenment 기술 기고" },
    role: { en: "Contributing author", ko: "기고자" },
    organization: { en: "Micro Software magazine", ko: "마이크로소프트웨어 잡지" },
    period: "2012-07 — 2012-11",
    location: { en: "Publication", ko: "기고" },
    description: {
      en: "Published ‘Understanding the EFL GUI toolkit’ in July and ‘Using the Enlightenment window manager’ in November.",
      ko: "7월 ‘GUI 툴킷 EFL 알아보기’와 11월 ‘Enlightenment 윈도우 매니저 활용’을 기고했습니다.",
    },
    tags: ["publication", "open-source"],
    section: "publications",
    order: 401,
  }),
  archiveItem({
    id: "tor-thesis-2009",
    title: { en: "Enhancing performance and secrecy of Tor anonymous communication", ko: "Tor 익명통신 시스템의 성능 및 보안 향상 기법 연구" },
    role: { en: "Master’s thesis", ko: "석사학위 논문" },
    organization: { en: "Ajou University", ko: "아주대학교" },
    period: "2009-02",
    location: { en: "Suwon, Korea", ko: "대한민국 수원" },
    description: {
      en: "Research on improving both performance and secrecy in Tor-based anonymous communication systems.",
      ko: "Tor 기반 익명통신 시스템의 성능과 보안을 함께 향상하는 기법을 연구했습니다.",
    },
    tags: ["publication", "education"],
    section: "publications",
    order: 402,
  }),
  archiveItem({
    id: "olsr-paper-2008",
    title: { en: "Detecting and countering blackhole attacks on OLSR", ko: "OLSR 프로토콜상의 블랙홀 공격 탐지 및 대응 기술" },
    role: { en: "Co-author", ko: "공동 저자" },
    organization: { en: "Mobile ad hoc network security research", ko: "모바일 애드혹 네트워크 보안 연구" },
    period: "2008",
    location: { en: "Korea", ko: "대한민국" },
    description: {
      en: "Co-authored with Manpyo Hong on detection and countermeasure techniques for blackhole attacks in OLSR mobile ad hoc networks.",
      ko: "홍만표 교수와 OLSR 모바일 애드혹 네트워크의 블랙홀 공격 탐지·대응 기술을 공동 연구했습니다.",
    },
    tags: ["publication"],
    section: "publications",
    order: 403,
  }),
  archiveItem({
    id: "iccitt07-unobservable-mix",
    title: { en: "Unobservable Mix: Hiding communication with uniform network traffic", ko: "Unobservable Mix: 균일한 네트워크 트래픽으로 통신 은닉" },
    role: { en: "Co-author", ko: "공동 저자" },
    organization: { en: "ICCIT 2007", ko: "ICCIT 2007" },
    period: "2007-11",
    location: { en: "International conference", ko: "국제 학술대회" },
    description: {
      en: "Research with Manpyo Hong, Yuseok Jeong, and Kyungseok Lee on hiding communication patterns through uniformly shaped network traffic.",
      ko: "홍만표·정유석·이경석과 균일한 형태의 네트워크 트래픽으로 통신 패턴을 숨기는 기법을 연구했습니다.",
    },
    tags: ["publication"],
    section: "publications",
    order: 404,
  }),
  archiveItem({
    id: "open-source-mentoring-award-2013",
    title: { en: "Open-source Mentoring Excellence Award", ko: "오픈소스 멘토링 우수상" },
    role: { en: "Award recipient as mentor", ko: "멘토 부문 수상" },
    organization: { en: "Samsung Electronics", ko: "삼성전자" },
    period: "2013",
    location: { en: "Korea", ko: "대한민국" },
    description: { en: "Recognized for excellence as a mentor in Samsung’s open-source mentoring program.", ko: "삼성전자 오픈소스 멘토링 프로그램의 멘토 활동으로 우수상을 받았습니다." },
    tags: ["award", "mentoring", "open-source"],
    section: "awards",
    order: 500,
  }),
  archiveItem({
    id: "samsung-programming-award-2009",
    title: { en: "Department Programming Competition Champion", ko: "부서 프로그래밍 대회 우승" },
    role: { en: "Champion", ko: "우승" },
    organization: { en: "Samsung Electronics SPACE", ko: "삼성전자 SPACE" },
    period: "2009",
    location: { en: "Korea", ko: "대한민국" },
    description: { en: "Won Samsung Electronics’ departmental programming competition.", ko: "삼성전자 부서 프로그래밍 대회에서 우승했습니다." },
    tags: ["award", "career"],
    section: "awards",
    order: 501,
  }),
  archiveItem({
    id: "samsung-training-service-award-2009",
    title: { en: "Samsung Group Training Service Award", ko: "삼성 그룹연수 공로상" },
    role: { en: "Trainee council president and award recipient", ko: "자치회장·공로상 수상" },
    organization: { en: "Samsung Group", ko: "삼성그룹" },
    period: "2009-02",
    location: { en: "Korea", ko: "대한민국" },
    description: { en: "Served as president of the trainee council during Samsung’s 49th intake group training and received a service award.", ko: "삼성 49기 29차 그룹연수 상반기 자치회장을 역임하고 공로상을 받았습니다." },
    tags: ["award", "leadership"],
    section: "awards",
    order: 502,
  }),
  archiveItem({
    id: "ajou-masters",
    title: { en: "M.S. in Information and Communication", ko: "정보통신대학원 석사" },
    role: { en: "Graduate student", ko: "대학원생" },
    organization: { en: "Ajou University", ko: "아주대학교" },
    period: "2007 — 2008",
    location: { en: "Suwon, Korea", ko: "대한민국 수원" },
    description: { en: "Graduate research focused on anonymous communication and network security.", ko: "익명통신과 네트워크 보안을 중심으로 대학원 연구를 수행했습니다." },
    tags: ["education", "publication"],
    section: "education",
    order: 600,
  }),
  archiveItem({
    id: "stony-brook-exchange",
    title: { en: "International exchange program", ko: "교환학생" },
    role: { en: "Exchange student", ko: "교환학생" },
    organization: { en: "State University of New York at Stony Brook", ko: "뉴욕주립대학교 스토니브룩" },
    period: "2006",
    location: { en: "Stony Brook, New York", ko: "미국 뉴욕 스토니브룩" },
    description: { en: "Participated in an international exchange program in the United States.", ko: "미국 뉴욕주립대학교 스토니브룩 교환학생 프로그램에 참여했습니다." },
    tags: ["education"],
    section: "education",
    order: 601,
  }),
  archiveItem({
    id: "ajou-bachelors",
    title: { en: "B.S. in Information and Computer Engineering", ko: "정보컴퓨터공학부 학사" },
    role: { en: "Undergraduate student", ko: "학부생" },
    organization: { en: "Ajou University", ko: "아주대학교" },
    period: "1999 — 2006",
    location: { en: "Suwon, Korea", ko: "대한민국 수원" },
    description: { en: "Studied computer engineering while leading programming teams and building early web products.", ko: "컴퓨터공학을 공부하며 프로그래밍 팀을 이끌고 초기 웹 서비스를 개발했습니다." },
    tags: ["education", "career"],
    section: "education",
    order: 602,
  }),
  archiveItem({
    id: "changhyun-high-school",
    title: { en: "11th graduating class", ko: "11회 졸업" },
    role: { en: "Student · Hyemang Science Club", ko: "학생·과학동아리 혜망" },
    organization: { en: "Changhyun High School", ko: "창현고등학교" },
    period: "1996 — 1998",
    location: { en: "Suwon, Korea", ko: "대한민국 수원" },
    description: { en: "Participated in the Hyemang science club and graduated as part of the school’s 11th class.", ko: "과학 동아리 ‘혜망’에서 활동하고 창현고등학교 11회로 졸업했습니다." },
    tags: ["education"],
    section: "education",
    order: 603,
  }),
];
