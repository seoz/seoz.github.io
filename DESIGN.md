# System Design

## 1. Goals and constraints

The product is a public, highly available portfolio with a very small trusted-author set: exactly one administrator. Reads should remain useful if Firebase is unavailable, while writes must fail closed. Content must have first-class English and Korean representations and remain manageable without code changes.

The application uses the Next.js App Router API through Vinext, TypeScript, Tailwind CSS, Firebase Authentication, Cloud Firestore, and Firebase Storage. The generated server output is Cloudflare Worker-compatible for Sites hosting.

## 2. High-level architecture

```text
Public browser ─┬─> Next/Vinext UI ──> bundled seed fallback
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

Identity and global presentation data: localized name, title, headline, summary, location, contact email, avatar URL, social links, and an ISO update timestamp.

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
- Grouped archive entries render as compact chapter cards with a section navigator, numbered color cues, chapter-colored period markers, live filtered counts, accessible per-item disclosure controls, and a filter-aware expand-all toggle. Career records elevate the employer into a high-contrast identity badge so company context does not compete with role copy. The final talks chapter adds a curated format breakdown derived from all 60 documented digest entries, uses a distinct editorial title for each year, and is the only chapter expanded on initial load.
- Optional timeline highlights preserve a restrained numbered list while allowing an individual line to carry a short bilingual note, thumbnail, and supporting links. Records without highlights continue to render their Markdown description unchanged.
- The bundled Archive seed is derived from Daniel's public `profile.md`. Dense speaking history is normalized into bilingual yearly digests, while career, mentoring, open-source, publication, award, and education milestones remain independently searchable records. This keeps the source history complete without sacrificing scanability.
- Missing images render initials rather than broken media.
- The fallback profile portrait is a checked-in asset at `public/seoz.jpg`; Firebase may replace it at runtime with an uploaded CMS image using the same profile field.
- The hero uses a concise bilingual promise about turning ideas into impact alongside a neutral offset editorial portrait frame, a high-contrast information panel, broad regional location copy without precise coordinates, and a compact bilingual focus strip that uses the former empty lower-left area.
- The compact statistics strip calculates completed Google tenure from March 2015 at runtime and keeps it visually dominant; the six-year Samsung and 6+ year startup tenures are grouped as supporting experience without crowding the page.
- The compact bilingual Donation Mentoring and Connect sections appear before the long-form archive so visitors encounter the primary relationship and contact paths before deep exploration. Connect uses the lighter elevated surface with stronger top and bottom rules, creating a clear transition into the cream archive canvas. Mentoring has one explicit external profile link and remains bundled editorial content rather than a Firestore collection.
- The Press & Interviews section is compact bundled editorial content with English and Korean labels, source-specific card imagery under `public/press/`, and direct external links. It does not add a Firestore collection or broaden the security rules.
- Empty filters have a purposeful reset state.
- Loading remote content uses motion-respecting skeletons.
- Markdown is rendered with `react-markdown`; raw HTML is not enabled.
- The admin fails closed when environment variables, identity, or Firebase authorization are missing.

## 8. CMS behavior

The CMS provides profile editing, bilingual timeline CRUD, multiple links per item, optional per-line highlights with image upload and links, label assignment, image upload, section and label CRUD, feature flags, and timeline reordering. Reordering uses a Firestore batch so swapped order values commit atomically.

The public view is a direct toggle from the CMS. Firestore snapshots make saved edits visible without a rebuild or redeploy.

## 9. Performance and accessibility

- The public route has no blocking Firebase dependency because seed content is bundled.
- Images use lazy loading outside the hero and have explicit fallbacks.
- Controls have visible focus states, accessible labels, adequate touch targets, and reduced-motion behavior.
- The primary navigation stays sticky and is intentionally kept outside any vertical overflow container so it remains accessible throughout long archive pages.
- Layouts are fluid from small mobile screens to wide desktop canvases.
- The theme uses color variables and preserves contrast in both modes.

## 10. Deployment and operations

The build produces Cloudflare Worker-compatible Sites output. Runtime values belong in the host’s environment configuration; local values live in ignored `.env.local`. Firebase rules are versioned beside source and deployed separately because they are the authorization boundary.

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
