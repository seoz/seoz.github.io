# Development Conventions

- Keep the public portfolio useful without Firebase by preserving `src/data/seed.ts` as the tested fallback.
- Treat `firestore.rules` and `storage.rules` as part of every data-model change. No collection may be added without explicit identity and schema rules.
- Initialize Firebase only through `src/lib/firebase.ts`; required environment variables must be validated before SDK initialization.
- Never commit `.env.local`, service-account JSON, API keys, OAuth secrets, or generated credentials.
- Preserve English and Korean fields together. New public copy must be represented in both languages.
- Use semantic HTML, visible keyboard focus, reduced-motion support, and responsive behavior for every interface change.
- Use `react-markdown` without raw HTML support for authored descriptions.
- Keep admin authorization fail-closed and repeat all client checks in backend security rules.
- Update `README.md` and `DESIGN.md` whenever behavior, setup, schema, security, or architecture changes.
- Before handoff, run `npm run lint` and `npm run build`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
