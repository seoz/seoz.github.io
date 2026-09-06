# Daniel Juyung Seo — Portfolio & CMS

A bilingual personal portfolio for Daniel Juyung Seo, with an English/Korean public archive and a private Firebase-backed content workspace.

## What visitors can do

- Switch between English and Korean. The choice is reflected in `?lang=en` or `?lang=ko` and remembered on the device.
- Keep navigation controls accessible in a sticky header while scrolling through the archive.
- Explore a compact bilingual Press section with selected articles, book features, video interviews, and Daniel's LinkedIn profile.
- See career statistics that calculate Google tenure from the March 2015 start date, with six years at Samsung and more than six years at startups grouped as supporting experience.
- Learn about Daniel's donation-based mentoring and open his direct Donation Mentoring profile.
- Connect with Daniel before browsing the compact career archive, which includes a section navigator, distinct chapter-style groups, color-coded period markers, prominent employer badges in the Career chapter, live item counts, label filters, search, and on-demand details. The talks chapter summarizes its 60+ documented engagements by format and opens its yearly records by default.
- Switch between light and dark themes.
- Follow verified LinkedIn and GitHub links or start an email conversation.
- Use the site comfortably on phones, tablets, laptops, and wide screens.

The bundled fallback portrait is stored at `public/seoz.jpg`. Replacing that file updates the public hero while preserving the CMS and seed-data path. The hero uses a direct impact-focused promise, a neutral editorial frame, and only the broad San Francisco Bay Area rather than a precise location. Press cards use checked-in source imagery under `public/press/`; their companion links and bilingual labels are defined in the public page component. The Connect call-to-action sits on an elevated surface so it remains visually distinct from the cream archive canvas that follows it.

If Firebase is temporarily unavailable, slow to connect, or has not been configured yet, the public portfolio immediately uses the included seed content instead of showing an empty archive. Live records replace the fallback as they arrive. Items with missing section metadata remain visible in a bilingual fallback group. The Archive fallback is curated from Daniel's public [`profile.md`](https://seoz.github.io/profile.md): talks are grouped into compact yearly digests, while career, mentoring, open-source work, research, awards, and education retain dedicated records in English and Korean.

## Using the private CMS

1. Open `/admin`.
2. Choose **Continue with Google**.
3. Sign in as `seojuyung@gmail.com`.
4. Use the tabs to update the profile, add and reorder timeline items, manage sections, upload images, and edit filter labels. Timeline records can optionally replace one long description with compact detailed lines; every line supports bilingual copy, a short note, one image, and multiple links.
5. Choose **Public view** to inspect published changes in a new tab.

All other Google accounts are signed out and denied. Firebase rules independently enforce the same allowlist for every database and storage mutation.

## Local setup

Requirements: Node.js 22.13 or newer, a Firebase project, and a Google OAuth provider enabled in Firebase Authentication.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with the Web App configuration from the `seoz-com` Firebase project. Browser Firebase identifiers use `NEXT_PUBLIC_` because Firebase Web SDK configuration identifies the project but does not authorize access; Firestore and Storage rules are the security boundary. Never place service-account JSON, Gemini keys, or other server credentials in a `NEXT_PUBLIC_` variable.

Open the local URL printed by the development server. The default port is normally `3000`.

## Firebase setup

In the Firebase console:

1. Enable **Authentication → Sign-in method → Google**.
2. Add the production domain and local development domain to **Authorized domains**.
3. Create a Firestore database and a Storage bucket.
4. Deploy the checked-in security rules:

```bash
npm run firebase:deploy
```

5. Seed initial bilingual content. The script uses `GOOGLE_APPLICATION_CREDENTIALS` when it is set and otherwise uses the account from `npx firebase login`:

```bash
npm run seed
```

The seed operation is idempotent for the included document IDs. It overwrites those seed records, so run it deliberately on the intended project.

## Environment variables

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web App identifier | Browser |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | OAuth redirect/auth domain | Browser |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project | Browser |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Portfolio image bucket | Browser |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Web App configuration | Browser |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web App identifier | Browser |
| `NEXT_PUBLIC_FIREBASE_DATABASE_ID` | Named Firestore database used by the web app (`seozcom`) | Browser |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Analytics identifier | Browser |
| `NEXT_PUBLIC_SITE_URL` | Canonical metadata origin | Browser/build |
| `FIREBASE_PROJECT_ID` | Project used by the server-side seed script | Server only |
| `FIREBASE_DATABASE_ID` | Named Firestore database used by the seed script (`seozcom`) | Server only |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional local path to service-account JSON for seeding | Server only; never commit |

No Gemini integration is used. If one is added later, keep its key in Firebase Secret Manager or the hosting platform’s server-only secret store.

## Content model

- `profile/main`: bilingual identity, headline, summary, contact, portrait, and social links.
- `timeline/{id}`: bilingual activity records with dates, roles, organizations, Markdown descriptions, links, labels, images, sections, and ordering. An optional bounded `highlights` list adds bilingual per-line notes, images, and links while preserving the Markdown description as a compatibility fallback.
- `sections/{id}`: bilingual group names, visibility, and ordering.
- `labels/{id}`: bilingual filter labels and accessible accent colors.
- Storage path `portfolio/*`: uploaded public portfolio images.

## Quality checks

```bash
npm run lint
npm run build
```

Security and architecture decisions are documented in [DESIGN.md](./DESIGN.md).
