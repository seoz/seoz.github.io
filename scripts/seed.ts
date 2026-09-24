import { createRequire } from "node:module";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { seedLabels, seedProfile, seedSections, seedTimeline } from "../src/data/seed";

const projectId = process.env.FIREBASE_PROJECT_ID;
const configuredDatabaseId = process.env.FIREBASE_DATABASE_ID;

if (!projectId || !configuredDatabaseId) {
  throw new Error("FIREBASE_PROJECT_ID and FIREBASE_DATABASE_ID are required. Copy .env.example to .env.local or export them before seeding.");
}

const databaseId: string = configuredDatabaseId;

const documents = [
  { path: "profile/main", data: seedProfile },
  ...seedTimeline.map((item) => ({ path: `timeline/${item.id}`, data: item })),
  ...seedSections.map((section) => ({ path: `sections/${section.id}`, data: section })),
  ...seedLabels.map((label) => ({ path: `labels/${label.id}`, data: label })),
];

async function seedWithApplicationDefaultCredentials() {
  const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: applicationDefault(), projectId });
  const db = getFirestore(app, databaseId);
  const batch = db.batch();

  documents.forEach(({ path, data }) => batch.set(db.doc(path), data));
  await batch.commit();
}

type FirestoreValue =
  | { nullValue: null }
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { arrayValue: { values: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nestedValue]) => [key, toFirestoreValue(nestedValue)]),
        ),
      },
    };
  }
  throw new Error(`Unsupported seed value type: ${typeof value}`);
}

async function seedWithFirebaseCliLogin() {
  const require = createRequire(import.meta.url);
  const firebaseCliAuth = require("firebase-tools/lib/auth") as {
    getGlobalDefaultAccount: () => { user: { email: string }; tokens: { refresh_token?: string } } | undefined;
    getAccessToken: (refreshToken: string, scopes: string[]) => Promise<{ access_token?: string }>;
  };
  const firebaseCliScopes = require("firebase-tools/lib/scopes") as { CLOUD_PLATFORM: string };
  const account = firebaseCliAuth.getGlobalDefaultAccount();
  const refreshToken = account?.tokens.refresh_token;

  if (!refreshToken) throw new Error("No Firebase CLI login found. Run `npx firebase login` and try again.");

  const token = await firebaseCliAuth.getAccessToken(refreshToken, [firebaseCliScopes.CLOUD_PLATFORM]);
  if (!token.access_token) throw new Error("Firebase CLI did not return an access token.");

  const writes = documents.map(({ path, data }) => ({
    update: {
      name: `projects/${projectId}/databases/${databaseId}/documents/${path}`,
      fields: (toFirestoreValue(data) as { mapValue: { fields: Record<string, FirestoreValue> } }).mapValue.fields,
    },
  }));
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:commit`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token.access_token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ writes }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Firestore seed failed (${response.status}): ${message}`);
  }

  console.log(`Seeded with Firebase CLI account ${account.user.email}.`);
}

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  await seedWithApplicationDefaultCredentials();
} else {
  await seedWithFirebaseCliLogin();
}

console.log(
  `Seed complete: 1 profile, ${seedTimeline.length} timeline items, ${seedSections.length} sections, and ${seedLabels.length} labels.`,
);
