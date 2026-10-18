# System Design

## 1. Goals and constraints

The product is a public, highly available portfolio with a very small trusted-author set: exactly one administrator. Reads should remain useful if Firebase is unavailable, while writes must fail closed. Content must have first-class English and Korean representations and remain manageable without code changes.

The application uses the Next.js App Router, TypeScript, Tailwind CSS, Firebase Authentication, Cloud Firestore, and Firebase Storage. Next.js exports static HTML and browser assets to `out/` for Firebase Hosting. The historical Vinext/Sites configuration is retained but is not used by the production scripts.

## 2. High-level architecture

```text
Public browser ─┬─> Next.js UI ──> bundled seed fallback
                └─> Firestore public read snapshots

Admin browser ──> Google OAuth (Firebase Auth)
             ├──> client route guard (exact verified email + google.com provider)
             ├──> Firestore writes ──> rules repeat identity + schema checks
             └──> Storage uploads ──> rules repeat identity + file checks
```

The public page renders immediately from realistic local seed data. When Firebase is configured, live snapshots from the named `seozcom` Firestore database replace each content collection independently. A failed remote read keeps the last usable data instead of blanking the page.

## 3. Data model

Localized fields are maps with exactly `en` and `ko` string keys. This avoids duplicate documents and guarantees that the CMS edits both representations together.

### `profile/main`

Identity and global presentation data: localized name, title, headline, summary, location, contact email, avatar URL, social links, optional `focus` (`label` and an ordered `items` array), and an ISO update timestamp. Focus supports up to six entries; label and item fields require both languages with 1–120 characters each. Admin Profile edits the label and list; missing focus falls back to seed content, while an empty list hides the strip. Client and Firestore rules validate the same bounds without broadening admin access. Storage rules remain unchanged.

### `press/main` and `press/{cardId}`

`main` holds bilingual `eyebrow`, `title`, `body`, and a unique ordered `cardIds` list (maximum 12). Each card document has a matching `id`, a `kind` enum, bilingual `meta`, `title`, and `imageAlt`, plus `image` and `url`. Section configuration cannot be deleted; removing all cards explicitly leaves the introduction visible. Card writes and removal are admin-only; section and card edits publish atomically. Missing configuration preserves seed content for existing installations without a migration.

### `timeline/{itemId}`

An ordered activity entity containing localized title, role, organization, location, and Markdown description; period; external links; label IDs; section ID; optional image; feature flag; numeric order; and timestamp. An optional `highlights` list represents compact sub-entries with bilingual titles and notes, one image, and multiple links. The parent Markdown description remains the fallback for older records.

### `sections/{sectionId}` and `labels/{labelId}`

Sections define public grouping and visibility. Labels define filtering vocabulary and an accent color. Referencing them by stable IDs keeps timeline documents compact and makes renaming safe.

## 4. Internationalization

The language state has this precedence:

1. Valid `lang` query parameter.
2. Saved local preference.
3. English default.

Changes update the URL with `history.replaceState`, `localStorage`, a `SameSite=Lax` cookie, and the document language attribute. Content and interface copy use the same `Language` union, so unsupported language states are not representable in application code.

## 5. Authentication and authorization

Authentication uses Firebase Google OAuth. The admin UI requires all three conditions:

- normalized email equals `seojuyung@gmail.com`;
- Firebase reports the email as verified;
- the linked provider is `google.com`.

This client check improves UX but is not trusted. Firestore and Storage rules repeat the email, verification, and provider checks for every mutation. Unknown collections and paths end with explicit deny rules. Public reads are intentional because the portfolio is public.

No server credential is shipped to the browser. Firebase Web App configuration and the named database ID are runtime-validated before SDK initialization. The local seed script uses an explicitly configured Application Default Credential when present and otherwise uses the locally authenticated Firebase CLI account; neither credential path is bundled into the application.

## 6. Schema validation

Firestore rules use `keys().hasOnly(...)`, type checks, length limits, bounded list sizes, bounded order values, and document-ID equality. Storage rules accept only authenticated admin uploads under `portfolio/*`, limit files to 5 MB, and require an image MIME type.

Firestore Rules cannot deeply iterate arbitrary nested arrays. The rule set therefore bounds `links`, `socialLinks`, and per-record `highlights`, while the typed CMS owns their detailed shape. A future server mutation layer could add deep validation if the author set expands or untrusted collaborators are introduced.

## 7. Rendering and failure behavior

- Public content starts with visible seed data and upgrades to Firebase snapshots without hiding the archive during connection setup.
- Grouped archives render unmatched records in a bilingual fallback group, preventing partial section metadata from silently dropping otherwise valid timeline content.
- Grouped archive entries render as compact chapter cards with a section navigator, numbered color cues, chapter-colored period markers, live filtered counts, accessible per-item disclosure controls, and a filter-aware expand-all toggle. Career records place the employer badge before the entry heading, with the role below it. Single-year period badges use larger type, and generic “Various locations” / “여러 지역” labels are hidden while specific locations stay visible. The talks chapter computes its format breakdown from the current filtered timeline records, uses a distinct editorial title for each year, and is the only chapter expanded on initial load.
- Optional timeline highlights preserve a restrained numbered list while allowing an individual line to carry a short bilingual note, thumbnail, and supporting links. Records without highlights continue to render their Markdown description unchanged.
- The bundled Archive seed is derived from Daniel's public `profile.md`. Dense speaking history is normalized into bilingual yearly digests, while career, mentoring, open-source, publication, award, and education milestones remain independently searchable records. This keeps the source history complete without sacrificing scanability.
- Missing images render initials rather than broken media.
- The fallback profile portrait is a checked-in asset at `public/seoz.jpg`; Firebase may replace it at runtime with an uploaded CMS image using the same profile field.
- The hero uses a concise bilingual promise about turning ideas into impact alongside a neutral offset editorial portrait frame, a high-contrast information panel, broad regional location copy without precise coordinates, and a compact bilingual focus strip below the summary. The hero provides a bilingual LinkedIn link below the summary; the email call-to-action lives in Connect.
- The compact statistics strip calculates completed Google tenure from March 2015 at runtime and keeps it visually dominant; the six-year Samsung and 6+ year startup tenures are grouped as supporting experience without crowding the page. Its three engagement counts use `getTalkMetrics(content.timeline)` from live `timeline` snapshots, independently of archive filters. The chapter uses the same function on its filtered items. Highlights take precedence over Markdown list lines; standalone records count once. Primary format is inferred from English/Korean titles in the order panel/roundtable, interview/media, mentoring, then talk/lecture/presentation. Each authored entry counts once even if it covers multiple appearances; no totals are stored or hardcoded. Seed content uses the identical calculation. This introduces no schema, collection, or security rule changes. The portrait has no top badge. Career and open-source statistics occupy the first row, with the three live engagement counts in a separate row below; both rows stack on narrow screens.
- The compact bilingual Donation Mentoring and Connect sections follow the complete archive, in that order. Connect uses the lighter elevated surface with stronger top and bottom rules. Mentoring has one explicit external profile link and remains bundled editorial content rather than a Firestore collection.
- The Press heading uses a smaller responsive 2–3.5rem size with 1.05 line height. The Press section reads `press/main` and `press/{cardId}` through one collection snapshot. Its bilingual introduction and ordered list of up to 12 cards are editable in the admin Press tab, including image upload, type, source labels, title, alt text, and destination URL. Missing or malformed configuration uses `src/data/press.ts` through the tested seed fallback; empty saved lists remain empty. Saves atomically write the introduction, ordered IDs, and cards while deleting removed cards, independently of the profile. A separate document per card keeps full validation within Firestore's rule expression budget. The collection allows public reads and only verified Google admin writes, with explicit document identity and schema rules, bounded bilingual text, icon kinds, IDs, HTTP(S) destinations, and safe image locations. Storage continues to enforce the existing admin-only `portfolio/*` image path, MIME type, and size bound.
- Empty filters have a purposeful reset state.
- Loading remote content uses motion-respecting skeletons.
- Markdown is rendered with `react-markdown`; raw HTML is not enabled.
- The admin fails closed when environment variables, identity, or Firebase authorization are missing.

## 8. CMS behavior

The CMS provides Press introduction and card editing, profile editing, bilingual timeline CRUD, multiple links per item, optional per-line highlights with image upload and links, label assignment, image upload, section and label CRUD, feature flags, and timeline reordering. Reordering uses a Firestore batch so swapped order values commit atomically.

The public view is a direct toggle from the CMS. Firestore snapshots make saved edits visible without a rebuild or redeploy.

## 9. Performance and accessibility

- The public route has no blocking Firebase dependency because seed content is bundled.
- Images use lazy loading outside the hero and have explicit fallbacks.
- Controls have visible focus states, accessible labels, adequate touch targets, and reduced-motion behavior.
- The primary navigation stays sticky and is intentionally kept outside any vertical overflow container so it remains accessible throughout long archive pages.
- Layouts are fluid from small mobile screens to wide desktop canvases. The hero headline uses a responsive clamp(3.15rem, 7.5vw, 7.8rem) size, -0.025em letter spacing and 0.92 line height to keep characters and lines legible. Header navigation follows page order; mobile links share the compact top header row, and language controls remain visible at all widths.
- The theme uses color variables and preserves contrast in both modes.

## 10. Deployment and operations

The production build exports `/` and `/admin/` to `out/`; Firebase Hosting serves each exported route without a catch-all SPA rewrite. Hashed Next.js assets use immutable caching. Public Firebase environment values are embedded at build time and must be supplied in the GitHub build environment or ignored local `.env.local`. A configuration change requires a rebuild. No application server is required: Authentication, Firestore snapshots, and Storage uploads run through the browser SDK.

The default Firebase project is `seoz-com`, with named Firestore database `seozcom`. Firebase rules are versioned beside source and deployed separately because they are the authorization boundary. Seed imports are deliberate operations that overwrite matching document IDs, never part of automatic deployment. GitHub remains the source repository; Gabia remains the registrar. Custom-domain DNS must be edited at the authoritative DNS provider. Firebase Hosting manages TLS certificates for each connected hostname. See README for the deployment and cutover runbook.

Recommended operational checks:

1. Run lint and production build on every change.
2. Test Firebase rules with the Emulator Suite before changing schemas.
3. Rotate and revoke service-account credentials independently from Web App config.
4. Monitor Auth sign-ins, denied Firestore requests, Storage usage, and broken external links.

## 11. Future extensions

- Cloud Functions can create optimized image variants and remove unreferenced uploads.
- An immutable audit collection can record admin mutations.
- Scheduled link checking can mark stale external URLs in the CMS.
- If multiple editors are added, replace the literal allowlist with custom claims and role-based rules.

Single-year talks digests hide the repeated header block (feature/tag badges, title, and role/organization). Year badges, engagement lists, and accessible year-specific disclosure controls align on the same desktop grid row without an empty header or divider. On mobile, engagement details stack beneath the year and control. The underlying fields remain stored for CMS editing, search, and filtering. Other archive entries retain their existing header structure.

The public archive and its section navigator place “Presentations, lectures & interviews” directly after “Career journey” in both languages, including when live section ordering differs. Other chapters retain their configured relative order.

### Editable yearly engagements

In **Admin → Timeline**, edit a speaking year to create, edit, or remove its detailed entries, then **Save item**. Legacy bilingual Markdown bullets are converted to editable entries on read without reseeding; Markdown links remain intact. Each entry supports bilingual title/detail, up to 12 label IDs from **Labels**, up to 3 links, and up to six photos (HTTP(S), local path, or image upload). Removing all entries preserves an empty year without reviving its legacy description. Years remain the public grouping; label and search filters select individual entries and recalculate the chapter metrics. Label buttons display counts across the full archive. Existing single-image entries remain compatible.

Saved speaking years use `timeline/{id}.entryIds` (up to 40 ordered document IDs) and an empty `highlights` list. Each `talkEntries/{yearId}--{entryId}` document contains `id`, `yearId`, and `entry`, with bilingual title/detail, links, optional `tags`, and optional `images`. Legacy highlights remain readable. Saving a year atomically writes its entries and removes deleted documents. Deleting a year also removes its saved entries. Individual documents keep full validation within the Firestore expression budget. Firestore validates entry identities, bilingual fields, links, label IDs, photo paths, and bounded lists. Storage continues to use verified-Google-admin-only `portfolio/*` writes with image MIME and 5 MB limits. Deploy updated rules with `npm run firebase:deploy` before saving the new fields in production. The local preview does not deploy rules. Verify with `npx tsx scripts/test-talk-entries.ts` and `npx firebase emulators:exec --only firestore --project demo-portfolio 'npx tsx scripts/test-talk-entries.ts --emulator'`.

The bundled profile has an empty headline in both languages. The hero renders its headline only when nonempty CMS content is available (or in an admin preview). Initial loading, missing profiles, and offline fallback show no default headline; the remaining seed content stays available. No schema or security rule changes are required.

Archive entry labels follow the title inline as fixed-height compact badges and wrap with the text on narrow screens. Photos occupy a separate wrapping row below the entry text and links, so gallery images never stretch label height.

The admin timeline editor starts with Section, followed by the bilingual Title fields and Date / period, before the remaining item fields.

On mobile and tablet (below the `lg` breakpoint), the hero portrait appears before the headline and introduction. At desktop widths, the introduction stays on the left and the portrait on the right. The portrait appears once in the document and precedes the introduction in reading order.

Header and footer name labels use **Admin → Profile → Name**, selecting the English or Korean field for the active language. Live profile updates and the bundled profile fallback use the same localization path; no schema or security rules change is needed.

On mobile and tablet, the location/leader line sits above the portrait and the current-role panel occupies its own row above the photo without covering it. Desktop keeps the location above the left introduction and the role overlay at the bottom of the right portrait.

The mobile header is a single 64px row containing the localized name, navigation, theme toggle, and language controls. Navigation can scroll horizontally on narrow screens without adding a second row; desktop retains the 72px header.

In the admin timeline editor, each detailed line has **Move up** and **Move down** buttons, including keyboard access and disabled boundary controls. Reordering moves the complete bilingual entry with its labels, photos, and links; **Save item** publishes the chosen order through the existing ordered highlights/entry IDs. Upload results follow the entry identity if a line is removed or reordered. These controls reuse the current schema and security rules.
