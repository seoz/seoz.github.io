import assert from "node:assert/strict";
import { seedProfile } from "../src/data/seed";
import { isValidFocus } from "../src/lib/focus";

const focus = seedProfile.focus!;
const cases: Array<[string, unknown, boolean]> = [
  ["seed", focus, true],
  ["hidden strip", { ...focus, items: [] }, true],
  ["six items", { ...focus, items: Array(6).fill(focus.items[0]) }, true],
  ["too many items", { ...focus, items: Array(7).fill(focus.items[0]) }, false],
  ["missing translation", { ...focus, items: [{ en: "Only English" }] }, false],
  ["empty translation", { ...focus, label: { en: "Focus", ko: "" } }, false],
  ["long label", { ...focus, label: { en: "x".repeat(121), ko: "분야" } }, false],
  ["long item", { ...focus, items: [{ en: "x".repeat(121), ko: "항목" }] }, false],
  ["extra field", { ...focus, extra: true }, false],
  ["invalid items", { ...focus, items: "text" }, false],
  ["invalid map", null, false],
];
for (const [name, value, expected] of cases) assert.equal(isValidFocus(value), expected, name);
assert.deepEqual(({ ...seedProfile, focus: undefined }).focus ?? seedProfile.focus, focus, "legacy profiles keep seed focus");
console.log("Focus validation and fallback checks passed.");

if (process.argv.includes("--emulator")) {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  assert.ok(host, "Firestore emulator required");
  const url = `http://${host}/v1/projects/demo-portfolio/databases/seozcom/documents/profile/main`;
  const encode = (value: unknown): unknown => {
    if (value === null) return { nullValue: null };
    if (typeof value === "string") return { stringValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
    if (typeof value === "boolean") return { booleanValue: value };
    return { mapValue: { fields: Object.fromEntries(Object.entries(value as object).map(([key, item]) => [key, encode(item)])) } };
  };
  const token = (email: string, verified = true, provider = "google.com") => {
    const payload = { sub: "focus-test", user_id: "focus-test", aud: "demo-portfolio", iss: "https://securetoken.google.com/demo-portfolio", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, email, email_verified: verified, firebase: { sign_in_provider: provider } };
    return `${Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.`;
  };
  const write = (data: unknown, auth?: string) => fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, body: JSON.stringify((encode(data) as { mapValue: unknown }).mapValue) });
  const admin = token("seojuyung@gmail.com");
  for (const [name, value, expected] of cases) {
    const response = await write({ ...seedProfile, focus: value }, admin);
    assert.equal(response.ok, expected, `${name}: ${response.status} ${await response.text()}`);
  }
  const legacy = { ...seedProfile }; delete legacy.focus;
  assert.equal((await write(legacy, admin)).ok, true, "legacy profile accepted");
  for (const auth of [undefined, token("other@example.com"), token("seojuyung@gmail.com", false), token("seojuyung@gmail.com", true, "password")]) {
    assert.equal((await write(seedProfile, auth)).status, 403, "unauthorized update denied");
  }
  assert.equal((await fetch(url)).ok, true, "public profile readable");
  console.log("Focus Firestore schema and admin identity checks passed.");
}
