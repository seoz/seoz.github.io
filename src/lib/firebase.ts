import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const requiredEnvironment = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseId: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID,
} as const;

const missingKeys = Object.entries(requiredEnvironment)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseEnvironment = {
  configured: missingKeys.length === 0,
  missingKeys,
};

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

let services: FirebaseServices | null = null;

export function getFirebaseServices(): FirebaseServices {
  if (!firebaseEnvironment.configured || !requiredEnvironment.databaseId) {
    throw new Error(`Firebase configuration is incomplete: ${missingKeys.join(", ")}`);
  }

  if (services) return services;

  const config: FirebaseOptions = {
    apiKey: requiredEnvironment.apiKey,
    authDomain: requiredEnvironment.authDomain,
    projectId: requiredEnvironment.projectId,
    storageBucket: requiredEnvironment.storageBucket,
    messagingSenderId: requiredEnvironment.messagingSenderId,
    appId: requiredEnvironment.appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const app = getApps().length ? getApp() : initializeApp(config);
  services = {
    app,
    auth: getAuth(app),
    db: getFirestore(app, requiredEnvironment.databaseId),
    storage: getStorage(app),
  };

  return services;
}
