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
