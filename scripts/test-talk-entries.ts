import assert from "node:assert/strict";
import { seedContent } from "../src/data/seed";
import { filterTalkEntries, normalizeTalkItem, resolveTalkEntries, talkEntries, validEntry } from "../src/lib/talkEntries";
import { getTalkMetrics } from "../src/lib/talkMetrics";
const year = seedContent.timeline.find((item) => item.section === "talks")!;
const entry = { ...year.highlights![0], tags: ["talk"], images: ["/press/photo.jpg", "https://example.com/photo.jpg"] };
assert.ok(validEntry(entry));
assert.equal(validEntry({ ...entry, images: ["javascript:alert(1)"] }), false);
assert.equal(validEntry({ ...entry, images: Array(7).fill("/photo.jpg") }), false);
assert.equal(validEntry({ ...entry, tags: ["bad,label"] }), false);
assert.equal(validEntry({ ...entry, title: { en: "Title", ko: "" } }), false);
const empty = { ...year, highlights: [] };
assert.equal(talkEntries(empty).length, 0);
assert.equal(getTalkMetrics([empty]).engagements, 0);
const legacy = { ...year, highlights: undefined, description: { en: "- [Lecture](https://example.com)\n- Interview", ko: "- [강연](https://example.com)\n- 인터뷰" } };
assert.equal(normalizeTalkItem(legacy).highlights!.length, 2);
assert.equal(normalizeTalkItem(legacy).highlights![0].title.en, "[Lecture](https://example.com)");
assert.ok(seedContent.timeline.filter((item) => item.section === "talks").every((item) => item.highlights?.every(validEntry)));
const saved = { id: `${year.id}--${entry.id}`, yearId: year.id, entry };
assert.deepEqual(resolveTalkEntries({ ...year, entryIds: [saved.id] }, [saved]).highlights, [entry]);
assert.deepEqual(resolveTalkEntries({ ...year, entryIds: [] }, [saved]).highlights, []);
assert.deepEqual(resolveTalkEntries({ ...year, entryIds: [saved.id] }, [{ ...saved, yearId: "wrong" }]).highlights, []);
const labeledYear = { ...year, highlights: [entry, { ...entry, id: "another-entry", tags: ["interview"], title: {en: "Interview", ko: "인터뷰"} }] };
assert.equal(filterTalkEntries(labeledYear, "talk", "", "en").highlights!.length, 1);
assert.equal(filterTalkEntries(labeledYear, "all", "인터뷰", "ko").highlights![0].id, "another-entry");
assert.equal(getTalkMetrics([filterTalkEntries(labeledYear, "interview", "", "en")]).engagements, 1);
console.log("Entry fallback, bilingual content, deletion, gallery, and label checks passed.");

if (process.argv.includes("--emulator")) {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST);
  const base = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-portfolio/databases/seozcom/documents/timeline`;
  const encode = (value: unknown): unknown => {
    if (typeof value === "string") return { stringValue: value };
    if (typeof value === "boolean") return { booleanValue: value };
    if (typeof value === "number") return { integerValue: String(value) };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
    return { mapValue: { fields: Object.fromEntries(Object.entries(value as object).map(([key, item]) => [key, encode(item)])) } };
  };
  const token = (email: string, verified = true) => {
    const payload = { sub: "test-admin", user_id: "test-admin", aud: "demo-portfolio", iss: "https://securetoken.google.com/demo-portfolio", iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+3600, email, email_verified: verified, firebase: { sign_in_provider: "google.com" } };
    return `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.`;
  };
  const write = (item: unknown, auth?: string) => fetch(`${base}/${year.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, body: JSON.stringify((encode(item) as { mapValue: unknown }).mapValue) });
  const admin = token("seojuyung@gmail.com");

  const writeEntry = (value: typeof entry, auth = admin, identity = `${year.id}--${value.id}`) => fetch(`${base.replace('/timeline', '/talkEntries')}/${identity}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth}` }, body: JSON.stringify((encode({ id: identity, yearId: year.id, entry: value }) as { mapValue: unknown }).mapValue) });
  const cases: Array<[string, typeof entry, boolean]> = [
    ["photos and labels", entry, true],
    ["unsafe photo", { ...entry, images: ["javascript:alert(1)"] }, false],
    ["too many photos", { ...entry, images: Array(7).fill("/photo.jpg") }, false],
    ["missing translation", { ...entry, title: { en: "Hi", ko: "" } }, false],
    ["empty label", { ...entry, tags: [""] }, false],
    ["invalid label", { ...entry, tags: ["bad,label"] }, false],
    ["unsafe link", { ...entry, links: [{ id: "link", label: { en: "Link", ko: "링크" }, url: "javascript:alert(1)" }] }, false],
  ];
  for (const [name, value, expected] of cases) {
    const response = await writeEntry(value);
    assert.equal(response.ok, expected, `${name}: ${await response.text()}`);
  }
  for (const item of seedContent.timeline.filter((item) => item.section === "talks")) {
    for (const value of item.highlights ?? []) {
      const response = await writeEntry({ ...value, tags: value.tags ?? [], images: value.images ?? [] });
      assert.ok(response.ok, `${item.id}: ${await response.text()}`);
    }
  }
  const maxEntry = { ...entry, images: Array(6).fill("/photo.jpg"), tags: Array.from({length:12}, (_,i) => `label-${i}`), links: Array.from({length:3}, (_,i) => ({id: `link-${i}`, label: {en: "Link", ko: "링크"}, url: "https://example.com"})) };
  const maxResponse = await writeEntry(maxEntry);
  assert.ok(maxResponse.ok, await maxResponse.text());
  assert.equal((await writeEntry(entry, token("other@example.com"))).status, 403);
  assert.equal((await writeEntry(entry, token("seojuyung@gmail.com", false))).status, 403);
  assert.equal((await writeEntry(entry, admin, "wrong-id")).status, 403);
  const response = await write({ ...year, highlights: [], entryIds: [`${year.id}--${entry.id}`] }, admin);
  assert.ok(response.ok, await response.text());
  assert.equal((await write(empty, admin)).ok, true);
  for (const auth of [undefined, token("other@example.com"), token("seojuyung@gmail.com", false)]) assert.equal((await write(year, auth)).status, 403);
  assert.equal((await fetch(`${base}/${year.id}`)).ok, true);
  console.log("Firestore entry validation, all seed years, maximum gallery/labels/links, and authorization checks passed.");
}
