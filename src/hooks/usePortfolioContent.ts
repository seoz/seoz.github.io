"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { seedContent } from "@/src/data/seed";
import { firebaseEnvironment, getFirebaseServices } from "@/src/lib/firebase";
import type { PortfolioContent, PortfolioLabel, PortfolioSection, Profile, TimelineItem } from "@/src/types/content";

export function usePortfolioContent(): {
  content: PortfolioContent;
  loading: boolean;
  source: "firebase" | "seed";
} {
  const [content, setContent] = useState<PortfolioContent>(seedContent);
  const [loading, setLoading] = useState(firebaseEnvironment.configured);
  const [source, setSource] = useState<"firebase" | "seed">("seed");

  useEffect(() => {
    if (!firebaseEnvironment.configured) return;

    const { db } = getFirebaseServices();
    let profile = seedContent.profile;
    let timeline = seedContent.timeline;
    let sections = seedContent.sections;
    let labels = seedContent.labels;
    let hasReceivedData = false;

    const publish = () => {
      hasReceivedData = true;
      setContent({ profile, timeline, sections, labels });
      setSource("firebase");
      setLoading(false);
    };

    const handleError = () => {
      if (!hasReceivedData) {
        setContent(seedContent);
        setSource("seed");
        setLoading(false);
      }
    };

    const unsubscribers = [
      onSnapshot(
        doc(db, "profile", "main"),
        (snapshot) => {
          if (snapshot.exists()) profile = { id: "main", ...snapshot.data() } as Profile;
          publish();
        },
        handleError,
      ),
      onSnapshot(
        query(collection(db, "timeline"), orderBy("order", "asc")),
        (snapshot) => {
          timeline = snapshot.empty
            ? seedContent.timeline
            : snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as TimelineItem);
          publish();
        },
        handleError,
      ),
      onSnapshot(
        query(collection(db, "sections"), orderBy("order", "asc")),
        (snapshot) => {
          sections = snapshot.empty
            ? seedContent.sections
            : snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as PortfolioSection);
          publish();
        },
        handleError,
      ),
      onSnapshot(
        query(collection(db, "labels"), orderBy("order", "asc")),
        (snapshot) => {
          labels = snapshot.empty
            ? seedContent.labels
            : snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as PortfolioLabel);
          publish();
        },
        handleError,
      ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  return { content, loading, source };
}
