import assert from "node:assert/strict";
import { seedContent } from "../src/data/seed";
import { seedPress } from "../src/data/press";
import { isValidPress, resolvePressContent } from "../src/lib/press";

const variants: Array<[string, unknown, boolean]> = [
  ["seed fallback", seedContent.press, true],
  ["empty cards stay empty", { ...seedPress, cards: [] }, true],
  ["12 cards", { ...seedPress, cards: Array.from({ length: 12 }, (_, i) => ({ ...seedPress.cards[0], id: `card-${i}` })) }, true],
  ["too many cards", { ...seedPress, cards: Array(13).fill(seedPress.cards[0]) }, false],
  ["missing Korean heading", { ...seedPress, title: { en: "Press" } }, false],
  ["empty Korean heading", { ...seedPress, title: { en: "Press", ko: "" } }, false],
  ["oversized text", { ...seedPress, body: { en: "x".repeat(12001), ko: "본문" } }, false],
  ["unexpected section field", { ...seedPress, extra: true }, false],
  ...[
    ["unsafe destination", { url: "javascript:alert(1)" }, false],
    ["unsafe image", { image: "//other.example/image.jpg" }, false],
    ["blank image", { image: "" }, true],
    ["remote image", { image: "https://example.com/image.jpg" }, true],
    ["unknown icon", { kind: "unknown" }, false],
    ["missing translation", { imageAlt: { en: "Portrait" } }, false],
    ["unexpected card field", { extra: true }, false],
    ["oversized URL", { url: `https://example.com/${"x".repeat(2048)}` }, false],
  ].map(([name, changes, valid]) => [name, { ...seedPress, cards: [{ ...seedPress.cards[0], ...changes as object }] }, valid] as [string, unknown, boolean]),
];
for (const [name, value, valid] of variants) assert.equal(isValidPress(value), valid, name);
assert.equal(seedContent.press?.cards.length, 5);
assert.equal(resolvePressContent([], seedPress), seedPress, "missing configuration falls back");
const introduction = { id: "main", eyebrow: seedPress.eyebrow, title: seedPress.title, body: seedPress.body, cardIds: [] };
assert.deepEqual(resolvePressContent([{ id: "main", data: introduction }], seedPress).cards, [], "saved empty list does not fall back");
const reordered = resolvePressContent([{ id: "main", data: { ...introduction, cardIds: seedPress.cards.map((card) => card.id).reverse() } }, ...seedPress.cards.map((card) => ({ id: card.id, data: card }))], seedPress);
assert.deepEqual(reordered.cards.map((card) => card.id), seedPress.cards.map((card) => card.id).reverse(), "saved order preserved");
console.log(`Passed ${variants.length} Press validation and seed fallback checks.`);

if (process.argv.includes("--emulator")) {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  assert.ok(host, "Rules checks require the local Firestore emulator.");
  const base = `http://${host}/v1/projects/demo-portfolio/databases/seozcom/documents`;
  const url = `${base}/press/main`;
  const encode = (value: unknown): unknown => {
    if (typeof value === "string") return { stringValue: value };
    if (typeof value === "boolean") return { booleanValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
    return { mapValue: { fields: Object.fromEntries(Object.entries(value as object).map(([key, item]) => [key, encode(item)])) } };
  };
  const token = (email: string, verified = true, provider = "google.com") => {
    const payload = { sub: "test-admin", user_id: "test-admin", aud: "demo-portfolio", iss: "https://securetoken.google.com/demo-portfolio", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, email, email_verified: verified, firebase: { sign_in_provider: provider } };
    return `${Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.`;
  };
  const write = async (press: unknown, auth?: string) => {
    const { cards, ...introduction } = press as typeof seedPress;
    const docs = [{ path: "press/main", data: { id: "main", ...introduction, cardIds: cards.map((card) => card.id) } }, ...cards.map((card) => ({ path: `press/${card.id}`, data: card }))];
    const writes = docs.map(({ path, data }) => ({ update: { name: `projects/demo-portfolio/databases/seozcom/documents/${path}`, ...(encode(data) as { mapValue: object }).mapValue } }));
    return fetch(`${base}:commit`, { method: "POST", headers: { "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, body: JSON.stringify({ writes }) });
  };
  const admin = token("seojuyung@gmail.com");
  for (const [name, press, valid] of variants) {
    const response = await write(press, admin);
    assert.equal(response.ok, valid, `${name}: ${response.status} ${await response.text()}`);
  }
  for (const auth of [undefined, token("other@example.com"), token("seojuyung@gmail.com", false), token("seojuyung@gmail.com", true, "password")]) {
    assert.equal((await write(seedPress, auth)).status, 403, "unauthorized writes denied");
  }
  assert.equal((await fetch(url)).ok, true, "public profile read");
  const mismatchedCard = await fetch(`${base}/press/wrong-id`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${admin}` }, body: JSON.stringify((encode(seedPress.cards[0]) as { mapValue: unknown }).mapValue) });
  assert.equal(mismatchedCard.status, 403, "card ID must match its document");
  assert.equal((await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${admin}` } })).status, 403, "configuration deletion denied");
  assert.equal((await fetch(`${base}/press/${seedPress.cards[0].id}`, { method: "DELETE" })).status, 403, "unauthorized deletion denied");
  assert.equal((await fetch(`${base}/press/${seedPress.cards[0].id}`, { method: "DELETE", headers: { Authorization: `Bearer ${admin}` } })).ok, true, "admin card removal allowed");
  assert.equal((await write({ ...seedPress, cards: [] }, admin)).ok, true);
  const savedEmpty = await (await fetch(url)).json() as { fields: { cardIds: { arrayValue: { values?: unknown[] } } } };
  assert.equal(savedEmpty.fields.cardIds.arrayValue.values?.length ?? 0, 0, "empty cards persist");
  console.log("Passed Press Firestore rules checks, public reads, and identity denials.");
}
