"use client";

import { entryImages, normalizeTalkItem, validEntry, validItemPhotos } from "@/src/lib/talkEntries";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ExternalLink,
  FileText,
  GripVertical,
  ImagePlus,
  LayoutDashboard,
  ListFilter,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Tag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { usePortfolioContent } from "@/src/hooks/usePortfolioContent";
import { firebaseEnvironment, getFirebaseServices } from "@/src/lib/firebase";
import type {
  LocalizedText,
  PortfolioLabel,
  PortfolioSection,
  Profile,
  PressCard,
  TimelineHighlight,
  TimelineItem,
  TimelineLink,
} from "@/src/types/content";

import { seedProfile } from "@/src/data/seed";
import { isValidFocus } from "@/src/lib/focus";
import { isValidPress } from "@/src/lib/press";

const ADMIN_EMAIL = "seojuyung@gmail.com";
type AdminTab = "overview" | "profile" | "press" | "timeline" | "sections" | "labels";
type AuthStatus = "loading" | "signed-out" | "authorized" | "denied";

const emptyLocalized = (): LocalizedText => ({ en: "", ko: "" });
const emptyTimeline = (order: number): TimelineItem => ({
  id: "",
  title: emptyLocalized(),
  role: emptyLocalized(),
  organization: emptyLocalized(),
  period: "",
  location: emptyLocalized(),
  description: emptyLocalized(),
  links: [],
  highlights: [],
  tags: [],
  section: "talks",
  imageUrl: "",
  featured: false,
  order,
  updatedAt: new Date().toISOString(),
});

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-5 text-[var(--muted)]">{hint}</span>}
    </label>
  );
}

function LocalizedFields({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
}) {
  const Control = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={`${label} · English`}>
        <Control className={`admin-input ${multiline ? "min-h-28 resize-y" : ""}`} value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} />
      </Field>
      <Field label={`${label} · 한국어`}>
        <Control className={`admin-input ${multiline ? "min-h-28 resize-y" : ""}`} value={value.ko} onChange={(event) => onChange({ ...value, ko: event.target.value })} />
      </Field>
    </div>
  );
}

function TimelineHighlightEditor({
  highlight,
  index,
  onChange,
  onRemove,
  onMove,
  lineCount,
  busy,
  onUpload,
  labels,
}: {
  labels: PortfolioLabel[];
  highlight: TimelineHighlight;
  index: number;
  onChange: (next: TimelineHighlight) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  lineCount: number;
  busy: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const links = highlight.links ?? [];
  const uploadInput = useRef<HTMLInputElement>(null);
  const photosFull = entryImages(highlight).length >= 6;

  return (
    <article className="space-y-4 border border-[var(--line)] bg-[var(--canvas)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs font-black text-[var(--accent)]">Line {String(index + 1).padStart(2, "0")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button className="filter-button" type="button" aria-label={`Move line ${index + 1} up`} disabled={busy || index === 0} onClick={() => onMove(-1)}>
            <ArrowUp size={15} aria-hidden="true" /> Move up
          </button>
          <button className="filter-button" type="button" aria-label={`Move line ${index + 1} down`} disabled={busy || index === lineCount - 1} onClick={() => onMove(1)}>
            <ArrowDown size={15} aria-hidden="true" /> Move down
          </button>
          <button className="row-action danger" type="button" aria-label={`Remove line ${index + 1}`} onClick={onRemove}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <LocalizedFields label="Line title" value={highlight.title} onChange={(title) => onChange({ ...highlight, title })} />
      <LocalizedFields label="Short detail (optional)" value={highlight.description} onChange={(description) => onChange({ ...highlight, description })} multiline />
      <fieldset><legend className="mb-2 font-bold">Item labels</legend><div className="flex flex-wrap gap-2">{labels.map((label) => {
        const selected = (highlight.tags ?? []).includes(label.id);
        return <button type="button" key={label.id} aria-pressed={selected} className={`filter-button ${selected ? "active" : ""}`} onClick={() => onChange({ ...highlight, tags: selected ? (highlight.tags ?? []).filter((tag) => tag !== label.id) : [...(highlight.tags ?? []), label.id] })}>{label.name.en} · {label.name.ko}</button>;
      })}</div></fieldset>
      <fieldset className="space-y-3"><legend className="font-bold">Photos (up to 6)</legend>
        {entryImages(highlight).map((url, photoIndex) => <div key={photoIndex} className="flex gap-2">
          <input className="admin-input" aria-label={`Photo ${photoIndex + 1} URL`} value={url} onChange={(event) => onChange({ ...highlight, images: entryImages(highlight).map((image, i) => i === photoIndex ? event.target.value : image) })} />
          <button type="button" className="row-action danger" aria-label={`Remove photo ${photoIndex + 1}`} onClick={() => onChange({ ...highlight, imageUrl: "", images: entryImages(highlight).filter((_, i) => i !== photoIndex) })}><Trash2 size={15} /></button>
        </div>)}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="filter-button" disabled={photosFull} onClick={() => onChange({ ...highlight, images: [...entryImages(highlight), ""] })}>Add photo URL</button>
          <button type="button" className="filter-button" disabled={busy || photosFull} onClick={() => uploadInput.current?.click()}>
            <ImagePlus size={16} aria-hidden="true" /> Upload photo
          </button>
          <input ref={uploadInput} className="hidden" aria-label="Upload item photo" type="file" accept="image/*" disabled={busy || photosFull} onChange={onUpload} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Line links</legend>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--muted)]">Optional supporting sources</span>
          <button
            type="button"
            className="text-xs font-black text-[var(--accent)]"
            disabled={links.length >= 3}
            onClick={() => onChange({ ...highlight, links: [...links, { id: crypto.randomUUID(), label: emptyLocalized(), url: "" }] })}
          >
            + Add link
          </button>
        </div>
        <div className="space-y-3">
          {links.map((link, linkIndex) => (
            <div key={link.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
              <input className="admin-input" aria-label="English line link label" placeholder="English label" value={link.label.en} onChange={(event) => { const nextLinks = [...links]; nextLinks[linkIndex] = { ...link, label: { ...link.label, en: event.target.value } }; onChange({ ...highlight, links: nextLinks }); }} />
              <input className="admin-input" aria-label="Korean line link label" placeholder="한국어 라벨" value={link.label.ko} onChange={(event) => { const nextLinks = [...links]; nextLinks[linkIndex] = { ...link, label: { ...link.label, ko: event.target.value } }; onChange({ ...highlight, links: nextLinks }); }} />
              <input className="admin-input" aria-label="Line link URL" placeholder="https://…" value={link.url} onChange={(event) => { const nextLinks = [...links]; nextLinks[linkIndex] = { ...link, url: event.target.value }; onChange({ ...highlight, links: nextLinks }); }} />
              <button className="row-action danger" type="button" aria-label="Remove line link" onClick={() => onChange({ ...highlight, links: links.filter((entry) => entry.id !== link.id) })}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </fieldset>
    </article>
  );
}

function AdminButton({ children, onClick, variant = "primary", disabled = false, type = "button" }: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button className={`admin-button ${variant}`} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function SignInScreen({ status, error, onSignIn }: { status: AuthStatus; error: string; onSignIn: () => void }) {
  const unconfigured = !firebaseEnvironment.configured;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#10243e] px-5 py-10 text-white">
      <section className="w-full max-w-lg rounded-[2rem] bg-[#f4f1ea] p-7 text-[#10243e] shadow-2xl sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b8f542]"><ShieldCheck size={23} /></div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.16em] text-[#ff5b45]">Portfolio CMS</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em]">A private workspace for Daniel.</h1>
        <p className="mt-4 text-sm leading-7 text-[#5f6a76]">Sign in with the approved Google account to manage the profile, archive, labels, order, and images.</p>

        {unconfigured ? (
          <div className="mt-7 border-l-4 border-[#ff5b45] bg-white p-5">
            <p className="font-black">Firebase setup is required.</p>
            <p className="mt-2 text-sm leading-6 text-[#5f6a76]">Copy <code>.env.example</code> to <code>.env.local</code>, fill every required value, and restart the app.</p>
          </div>
        ) : status === "denied" ? (
          <div className="mt-7 border-l-4 border-[#ff5b45] bg-white p-5">
            <p className="font-black">Access denied.</p>
            <p className="mt-2 text-sm leading-6 text-[#5f6a76]">Only {ADMIN_EMAIL} can open this workspace. The other account was signed out.</p>
          </div>
        ) : null}

        {error && <p className="mt-5 text-sm font-bold text-red-700" role="alert">{error}</p>}

        <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#10243e] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#ff5b45] disabled:cursor-not-allowed disabled:opacity-50" onClick={onSignIn} disabled={unconfigured || status === "loading"}>
          {status === "loading" ? <LoaderCircle className="animate-spin" size={18} /> : <UserRound size={18} />}
          Continue with Google
        </button>
        <Link className="mt-4 flex items-center justify-center gap-2 py-2 text-sm font-black text-[#5f6a76]" href="/"><ArrowLeft size={16} /> Back to the portfolio</Link>
      </section>
    </main>
  );
}

export function AdminDashboard() {
  const { content, source } = usePortfolioContent();
  const [authStatus, setAuthStatus] = useState<AuthStatus>(firebaseEnvironment.configured ? "loading" : "signed-out");
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>(content.profile);
  const focusDraft = profileDraft.focus ?? seedProfile.focus!;
  const [pressDraft, setPressDraft] = useState(content.press);
  const updatePressCard = (index: number, changes: Partial<PressCard>) => setPressDraft({ ...pressDraft, cards: pressDraft.cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...changes } : card) });
  const [itemDraft, setItemDraft] = useState<TimelineItem | null>(null);
  const [sectionDraft, setSectionDraft] = useState<PortfolioSection | null>(null);
  const [labelDraft, setLabelDraft] = useState<PortfolioLabel | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setPressDraft(content.press), 0);
    return () => window.clearTimeout(timer);
  }, [content.press]);

  useEffect(() => {
    const timer = window.setTimeout(() => setProfileDraft(content.profile), 0);
    return () => window.clearTimeout(timer);
  }, [content.profile]);

  useEffect(() => {
    if (!firebaseEnvironment.configured) return;
    const { auth } = getFirebaseServices();
    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setAuthStatus("signed-out");
        return;
      }
      const usesGoogle = nextUser.providerData.some((provider) => provider.providerId === "google.com");
      if (nextUser.email?.toLowerCase() !== ADMIN_EMAIL || !nextUser.emailVerified || !usesGoogle) {
        setAuthStatus("denied");
        await signOut(auth);
        return;
      }
      setUser(nextUser);
      setAuthStatus("authorized");
    });
  }, []);

  const signIn = async () => {
    setAuthError("");
    setAuthStatus("loading");
    try {
      const { auth } = getFirebaseServices();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthStatus("signed-out");
      setAuthError(error instanceof Error ? error.message : "Google sign-in could not be completed.");
    }
  };

  const runMutation = async (action: () => Promise<void>, message: string) => {
    setSaving(true);
    setNotice("");
    try {
      await action();
      setNotice(message);
      window.setTimeout(() => setNotice(""), 2800);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The change could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (authStatus !== "authorized" || !user) {
    return <SignInScreen status={authStatus} error={authError} onSignIn={signIn} />;
  }

  const { db, auth, storage } = getFirebaseServices();
  const orderedTimeline = [...content.timeline].sort((a, b) => a.order - b.order);
  const orderedSections = [...content.sections].sort((a, b) => a.order - b.order);
  const orderedLabels = [...content.labels].sort((a, b) => a.order - b.order);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, target: "profile" | "timeline" | "highlight" | "press", highlightIndex?: number) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setNotice("Choose an image file.");
    if (file.size >= 5 * 1024 * 1024) return setNotice("Images must be smaller than 5 MB.");
    const highlightId = target === "highlight" && highlightIndex !== undefined ? itemDraft?.highlights?.[highlightIndex]?.id : undefined;
    const timelineId = itemDraft?.id;
    setSaving(true);
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
      const storageRef = ref(storage, `portfolio/${crypto.randomUUID()}-${safeName}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      if (target === "profile") setProfileDraft((draft) => ({ ...draft, avatarUrl: url }));
      else if (target === "timeline") setItemDraft((draft) => draft && draft.id === timelineId && entryImages(draft).length < 6 ? ({ ...draft, images: [...entryImages(draft), url] }) : draft);
      else if (target === "press" && highlightIndex !== undefined) setPressDraft((press) => ({ ...press, cards: press.cards.map((card, index) => index === highlightIndex ? { ...card, image: url } : card) }));
      else setItemDraft((draft) => {
        if (!draft || draft.id !== timelineId || !highlightId) return draft;
        const highlights = [...(draft.highlights ?? [])];
        const entryIndex = highlights.findIndex((entry) => entry.id === highlightId);
        const highlight = highlights[entryIndex];
        if (!highlight) return draft;
        if (entryImages(highlight).length >= 6) return draft;
        highlights[entryIndex] = { ...highlight, images: [...entryImages(highlight), url] };
        return { ...draft, highlights };
      });
      setNotice("Image uploaded. Save the record to publish it.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  const moveTimeline = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedTimeline.length) return;
    const first = orderedTimeline[index];
    const second = orderedTimeline[targetIndex];
    runMutation(async () => {
      const batch = writeBatch(db);
      batch.update(doc(db, "timeline", first.id), { order: second.order, updatedAt: new Date().toISOString() });
      batch.update(doc(db, "timeline", second.id), { order: first.order, updatedAt: new Date().toISOString() });
      await batch.commit();
    }, "Timeline order updated.");
  };

  const saveTimeline = () => {
    if (!itemDraft || !itemDraft.title.en.trim() || !itemDraft.title.ko.trim()) return setNotice("English and Korean titles are required.");
    if ((itemDraft.highlights ?? []).length > 40 || (itemDraft.highlights ?? []).some((highlight) => !validEntry(highlight))) return setNotice("Check each item: bilingual titles, up to 12 labels and 3 links, and up to 6 valid HTTP(S) or local photo URLs are required.");
    if (!validItemPhotos(itemDraft)) return setNotice("Add up to 6 valid HTTP(S) or local item photo URLs.");
    const id = itemDraft.id || crypto.randomUUID();
    const next = { ...itemDraft, id, updatedAt: new Date().toISOString() };
    runMutation(async () => {
      if (next.section === "talks" && /^\d{4}$/.test(next.period.trim())) {
        const batch = writeBatch(db);
        const entries = next.highlights ?? [];
        const entryIds = entries.map((entry) => `${id}--${entry.id}`);
        batch.set(doc(db, "timeline", id), { ...next, highlights: [], entryIds });
        entries.forEach((entry, index) => batch.set(doc(db, "talkEntries", entryIds[index]), { id: entryIds[index], yearId: id, entry }));
        (itemDraft.entryIds ?? []).filter((entryId) => !entryIds.includes(entryId)).forEach((entryId) => batch.delete(doc(db, "talkEntries", entryId)));
        await batch.commit();
      } else {
        await setDoc(doc(db, "timeline", id), next);
      }
      setItemDraft(null);
    }, itemDraft.id ? "Timeline item updated." : "Timeline item added.");
  };

  const navigation: Array<{ id: AdminTab; label: string; icon: ReactNode }> = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} /> },
    { id: "profile", label: "Profile", icon: <UserRound size={17} /> },
    { id: "press", label: "Press", icon: <FileText size={17} /> },
    { id: "timeline", label: "Timeline", icon: <FileText size={17} /> },
    { id: "sections", label: "Sections", icon: <ListFilter size={17} /> },
    { id: "labels", label: "Labels", icon: <Tag size={17} /> },
  ];

  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_92%,transparent)] backdrop-blur-xl">
        <div className="flex h-[70px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lime)] text-[#10243e]"><ShieldCheck size={18} /></span>
            <div><p className="text-sm font-black">Daniel Seo CMS</p><p className="text-[11px] font-bold text-[var(--muted)]">{source === "firebase" ? "Live content" : "Seed preview"}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Link className="admin-button secondary" href="/" target="_blank">Public view <ExternalLink size={14} /></Link>
            <button className="icon-button" aria-label="Sign out" onClick={() => signOut(auth)}><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-70px)] lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--line)] p-4 lg:border-b-0 lg:border-r lg:p-5">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="CMS navigation">
            {navigation.map((entry) => (
              <button key={entry.id} className={`admin-nav ${activeTab === entry.id ? "active" : ""}`} onClick={() => setActiveTab(entry.id)}>{entry.icon}{entry.label}</button>
            ))}
          </nav>
          <div className="mt-8 hidden border-t border-[var(--line)] pt-5 lg:block">
            <p className="truncate text-xs font-black">{user.email}</p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">Verified Google administrator</p>
          </div>
        </aside>

        <section className="min-w-0 p-5 sm:p-8 lg:p-10">
          {notice && <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-xl bg-[var(--ink)] px-5 py-3 text-sm font-bold text-[var(--canvas)] shadow-xl" role="status">{saving ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}{notice}</div>}

          {activeTab === "overview" && (
            <div className="mx-auto max-w-6xl">
              <p className="section-eyebrow">Dashboard</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Keep the story current.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">Edit both languages together, keep the archive ordered, and use Public view to check changes immediately.</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[[content.timeline.length, "Timeline items"], [content.sections.length, "Visible sections"], [content.labels.length, "Filter labels"]].map(([value, label]) => (
                  <article key={String(label)} className="border border-[var(--line)] bg-[var(--surface)] p-6"><p className="text-4xl font-black text-[var(--accent)]">{value}</p><p className="mt-2 text-sm font-bold text-[var(--muted)]">{label}</p></article>
                ))}
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <article className="bg-[var(--ink)] p-7 text-[var(--canvas)]"><Settings2 size={24} className="text-[var(--lime)]" /><h2 className="mt-8 text-2xl font-black">Suggested workflow</h2><ol className="mt-5 space-y-3 text-sm leading-6 text-[color-mix(in_srgb,var(--canvas)_68%,transparent)]"><li>1. Update profile copy and portrait.</li><li>2. Add each new activity in both languages.</li><li>3. Reorder the archive, then open Public view.</li></ol></article>
                <article className="border border-[var(--line)] bg-[var(--surface)] p-7"><ShieldCheck size={24} className="text-[var(--accent)]" /><h2 className="mt-8 text-2xl font-black">Security is enforced twice</h2><p className="mt-4 text-sm leading-7 text-[var(--muted)]">This screen checks the Google account, and Firebase rules independently reject every write unless the verified email is exactly {ADMIN_EMAIL}.</p></article>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="mx-auto max-w-5xl">
              <div className="admin-page-heading"><div><p className="section-eyebrow">Identity</p><h1>Profile</h1></div><AdminButton disabled={saving} onClick={() => { if (!isValidFocus(focusDraft)) return setNotice("Focus needs English and Korean text, up to 120 characters per field and up to 6 items."); runMutation(() => setDoc(doc(db, "profile", "main"), { ...profileDraft, id: "main", updatedAt: new Date().toISOString() }), "Profile saved."); }}><Save size={15} /> Save profile</AdminButton></div>
              <div className="mt-8 space-y-6 border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
                <LocalizedFields label="Name" value={profileDraft.name} onChange={(name) => setProfileDraft({ ...profileDraft, name })} />
                <LocalizedFields label="Title" value={profileDraft.title} onChange={(title) => setProfileDraft({ ...profileDraft, title })} />
                <LocalizedFields label="Headline" value={profileDraft.headline} onChange={(headline) => setProfileDraft({ ...profileDraft, headline })} />
                <LocalizedFields label="Summary" value={profileDraft.summary} onChange={(summary) => setProfileDraft({ ...profileDraft, summary })} multiline />
                <fieldset className="space-y-4 border border-[var(--line)] p-4">
                  <legend className="px-2 text-sm font-black">Current focus</legend>
                  <LocalizedFields label="Focus label" value={focusDraft.label} onChange={(label) => setProfileDraft({ ...profileDraft, focus: { ...focusDraft, label } })} />
                  {focusDraft.items.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <LocalizedFields label={`Focus item ${index + 1}`} value={item} onChange={(value) => setProfileDraft({ ...profileDraft, focus: { ...focusDraft, items: focusDraft.items.map((existing, itemIndex) => itemIndex === index ? value : existing) } })} />
                      <AdminButton variant="danger" onClick={() => setProfileDraft({ ...profileDraft, focus: { ...focusDraft, items: focusDraft.items.filter((_, itemIndex) => itemIndex !== index) } })}><Trash2 size={14} /> Remove focus item {index + 1}</AdminButton>
                    </div>
                  ))}
                  <AdminButton variant="secondary" disabled={focusDraft.items.length >= 6} onClick={() => setProfileDraft({ ...profileDraft, focus: { ...focusDraft, items: [...focusDraft.items, emptyLocalized()] } })}><Plus size={14} /> Add focus item</AdminButton>
                  <p className="text-xs text-[var(--muted)]">Save profile to publish. Remove every item to hide the focus strip.</p>
                </fieldset>
                <LocalizedFields label="Location" value={profileDraft.location} onChange={(location) => setProfileDraft({ ...profileDraft, location })} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact email"><input className="admin-input" type="email" value={profileDraft.contactEmail} onChange={(event) => setProfileDraft({ ...profileDraft, contactEmail: event.target.value })} /></Field>
                  <Field label="Avatar URL"><input className="admin-input" value={profileDraft.avatarUrl} onChange={(event) => setProfileDraft({ ...profileDraft, avatarUrl: event.target.value })} /></Field>
                </div>
                <Field label="Upload portrait" hint="JPEG, PNG, WebP, or GIF · maximum 5 MB"><label className="upload-box"><ImagePlus size={20} /><span>{saving ? "Uploading…" : "Choose image"}</span><input className="sr-only" type="file" accept="image/*" onChange={(event) => uploadImage(event, "profile")} /></label></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  {profileDraft.socialLinks.map((social, index) => (
                    <Field key={social.id} label={`${social.label} URL`}><input className="admin-input" value={social.url} onChange={(event) => { const socialLinks = [...profileDraft.socialLinks]; socialLinks[index] = { ...social, url: event.target.value }; setProfileDraft({ ...profileDraft, socialLinks }); }} /></Field>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "press" && (
            <form className="mx-auto max-w-5xl" onSubmit={(event) => {
              event.preventDefault();
              if (!isValidPress(pressDraft)) return setNotice("Complete both languages for all text and image descriptions. Use HTTP(S) links and image URLs or local image paths. Maximum 12 cards; text limit 12,000 characters and URL limit 2,048.");
              runMutation(async () => {
                const batch = writeBatch(db);
                const { cards, ...introduction } = pressDraft;
                batch.set(doc(db, "press", "main"), { id: "main", ...introduction, cardIds: cards.map((card) => card.id) });
                cards.forEach((card) => batch.set(doc(db, "press", card.id), card));
                content.press.cards.filter((card) => !cards.some((next) => next.id === card.id)).forEach((card) => batch.delete(doc(db, "press", card.id)));
                await batch.commit();
              }, "Press section saved.");
            }}>
              <div className="admin-page-heading"><div><p className="section-eyebrow">Featured conversations</p><h1>Press</h1></div><AdminButton type="submit" disabled={saving}><Save size={15} /> Save press</AdminButton></div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Edit the section introduction and up to 12 cards. Changes and uploaded images appear publicly after saving. Removing all cards leaves the section introduction visible.</p>
              <fieldset disabled={saving} className="mt-8 space-y-6">
                <div className="space-y-6 border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
                  <LocalizedFields label="Eyebrow" value={pressDraft.eyebrow} onChange={(eyebrow) => setPressDraft({ ...pressDraft, eyebrow })} />
                  <LocalizedFields label="Heading" value={pressDraft.title} onChange={(title) => setPressDraft({ ...pressDraft, title })} />
                  <LocalizedFields label="Description" value={pressDraft.body} onChange={(body) => setPressDraft({ ...pressDraft, body })} multiline />
                </div>
                {pressDraft.cards.map((card, index) => (
                  <fieldset key={card.id} className="min-w-0 space-y-5 border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
                    <legend className="px-2 text-sm font-black">Card {index + 1}</legend>
                    <div className="flex flex-wrap gap-2">
                      <AdminButton variant="secondary" disabled={index === 0} onClick={() => { const cards = [...pressDraft.cards]; [cards[index - 1], cards[index]] = [cards[index], cards[index - 1]]; setPressDraft({ ...pressDraft, cards }); }}><ArrowUp size={15} /> Move up</AdminButton>
                      <AdminButton variant="secondary" disabled={index === pressDraft.cards.length - 1} onClick={() => { const cards = [...pressDraft.cards]; [cards[index], cards[index + 1]] = [cards[index + 1], cards[index]]; setPressDraft({ ...pressDraft, cards }); }}><ArrowDown size={15} /> Move down</AdminButton>
                      <AdminButton variant="danger" onClick={() => setPressDraft({ ...pressDraft, cards: pressDraft.cards.filter((_, cardIndex) => cardIndex !== index) })}><Trash2 size={15} /> Remove card {index + 1}</AdminButton>
                    </div>
                    <Field label="Card type"><select className="admin-input" value={card.kind} onChange={(event) => updatePressCard(index, { kind: event.target.value as PressCard["kind"] })}><option value="linkedin">LinkedIn</option><option value="book">Book</option><option value="video">Video</option><option value="article">Article</option></select></Field>
                    <LocalizedFields label="Source and year" value={card.meta} onChange={(meta) => updatePressCard(index, { meta })} />
                    <LocalizedFields label="Card title" value={card.title} onChange={(title) => updatePressCard(index, { title })} />
                    <Field label="Destination URL"><input className="admin-input" type="url" required maxLength={2048} value={card.url} onChange={(event) => updatePressCard(index, { url: event.target.value })} /></Field>
                    <Field label="Image URL or local path" hint="Optional. Use an HTTP(S) URL, a path such as /press/image.jpg, or upload an image."><input className="admin-input" maxLength={2048} value={card.image} onChange={(event) => updatePressCard(index, { image: event.target.value })} /></Field>
                    <Field label={`Upload image for card ${index + 1}`} hint="Image files smaller than 5 MB"><input className="admin-input" type="file" accept="image/*" onChange={(event) => uploadImage(event, "press", index)} /></Field>
                    <LocalizedFields label="Image description" value={card.imageAlt} onChange={(imageAlt) => updatePressCard(index, { imageAlt })} />
                  </fieldset>
                ))}
                <AdminButton variant="secondary" disabled={pressDraft.cards.length >= 12} onClick={() => setPressDraft({ ...pressDraft, cards: [...pressDraft.cards, { id: crypto.randomUUID(), kind: "article", meta: emptyLocalized(), title: emptyLocalized(), image: "", imageAlt: emptyLocalized(), url: "" }] })}><Plus size={15} /> Add card</AdminButton>
              </fieldset>
            </form>
          )}

          {activeTab === "timeline" && (
            <div className="mx-auto max-w-6xl">
              <div className="admin-page-heading"><div><p className="section-eyebrow">Archive</p><h1>Timeline</h1></div><AdminButton onClick={() => setItemDraft(emptyTimeline(orderedTimeline.length))}><Plus size={15} /> Add item</AdminButton></div>
              <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {orderedTimeline.map((item, index) => (
                  <article key={item.id} className="grid items-center gap-4 py-5 md:grid-cols-[44px_120px_minmax(0,1fr)_auto]">
                    <GripVertical className="hidden text-[var(--line-strong)] md:block" size={18} />
                    <p className="font-mono text-xs font-bold text-[var(--muted)]">{item.period}</p>
                    <div className="min-w-0"><h2 className="truncate text-base font-black">{item.title.en}</h2><p className="mt-1 truncate text-xs font-bold text-[var(--muted)]">{item.organization.en} · {item.section}</p></div>
                    <div className="flex items-center gap-1 md:justify-self-end"><button className="row-action" aria-label="Move up" disabled={index === 0} onClick={() => moveTimeline(index, -1)}><ArrowUp size={15} /></button><button className="row-action" aria-label="Move down" disabled={index === orderedTimeline.length - 1} onClick={() => moveTimeline(index, 1)}><ArrowDown size={15} /></button><button className="row-action" aria-label="Edit item" onClick={() => setItemDraft(normalizeTalkItem(item))}><Pencil size={15} /></button><button className="row-action danger" aria-label="Delete item" onClick={() => { if (window.confirm(`Delete “${item.title.en}”?`)) runMutation(async () => { const batch = writeBatch(db); batch.delete(doc(db, "timeline", item.id)); (item.entryIds ?? []).forEach((entryId) => batch.delete(doc(db, "talkEntries", entryId))); await batch.commit(); }, "Timeline item deleted."); }}><Trash2 size={15} /></button></div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === "sections" && (
            <div className="mx-auto max-w-6xl">
              <div className="admin-page-heading"><div><p className="section-eyebrow">Structure</p><h1>Sections</h1></div><AdminButton onClick={() => setSectionDraft({ id: "", title: emptyLocalized(), eyebrow: emptyLocalized(), order: orderedSections.length, visible: true, updatedAt: new Date().toISOString() })}><Plus size={15} /> Add section</AdminButton></div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {orderedSections.map((section) => (
                  <article key={section.id} className="border border-[var(--line)] bg-[var(--surface)] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--accent)]">{section.eyebrow.en}</p><h2 className="mt-2 text-xl font-black">{section.title.en}</h2><p className="mt-1 text-sm font-bold text-[var(--muted)]">{section.title.ko}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${section.visible ? "bg-[var(--lime)] text-[#10243e]" : "bg-[var(--surface-soft)] text-[var(--muted)]"}`}>{section.visible ? "Visible" : "Hidden"}</span></div><div className="mt-6 flex gap-2"><AdminButton variant="secondary" onClick={() => setSectionDraft(section)}><Pencil size={14} /> Edit</AdminButton><AdminButton variant="danger" onClick={() => { if (window.confirm(`Delete section “${section.title.en}”?`)) runMutation(() => deleteDoc(doc(db, "sections", section.id)), "Section deleted."); }}><Trash2 size={14} /></AdminButton></div></article>
                ))}
              </div>
            </div>
          )}

          {activeTab === "labels" && (
            <div className="mx-auto max-w-6xl">
              <div className="admin-page-heading"><div><p className="section-eyebrow">Taxonomy</p><h1>Labels</h1></div><AdminButton onClick={() => setLabelDraft({ id: "", name: emptyLocalized(), accent: "#ff5b45", order: orderedLabels.length, updatedAt: new Date().toISOString() })}><Plus size={15} /> Add label</AdminButton></div>
              <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {orderedLabels.map((label) => (
                  <article key={label.id} className="flex items-center justify-between gap-4 py-5"><div className="flex min-w-0 items-center gap-4"><span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: label.accent }} /><div><h2 className="font-black">{label.name.en}</h2><p className="mt-1 text-xs font-bold text-[var(--muted)]">{label.name.ko} · {label.id}</p></div></div><div className="flex gap-1"><button className="row-action" onClick={() => setLabelDraft(label)} aria-label="Edit label"><Pencil size={15} /></button><button className="row-action danger" onClick={() => { if (window.confirm(`Delete label “${label.name.en}”?`)) runMutation(() => deleteDoc(doc(db, "labels", label.id)), "Label deleted."); }} aria-label="Delete label"><Trash2 size={15} /></button></div></article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {itemDraft && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="timeline-editor-title">
          <form className="admin-modal" onSubmit={(event) => { event.preventDefault(); saveTimeline(); }}>
            <div className="admin-modal-header"><div><p className="section-eyebrow">Timeline editor</p><h2 id="timeline-editor-title">{itemDraft.id ? "Edit item" : "New item"}</h2></div><button className="icon-button" type="button" onClick={() => setItemDraft(null)} aria-label="Close"><X size={17} /></button></div>
            <div className="admin-modal-body space-y-6">
              <Field label="Section"><select className="admin-input" value={itemDraft.section} onChange={(event) => setItemDraft({ ...itemDraft, section: event.target.value })}>{orderedSections.map((section) => <option key={section.id} value={section.id}>{section.title.en}</option>)}</select></Field>
              <LocalizedFields label="Title" value={itemDraft.title} onChange={(title) => setItemDraft({ ...itemDraft, title })} />
              <Field label="Date / period"><input className="admin-input" value={itemDraft.period} onChange={(event) => setItemDraft({ ...itemDraft, period: event.target.value })} placeholder="2026-08-25 or 2015 — Present" /></Field>
              <LocalizedFields label="Role" value={itemDraft.role} onChange={(role) => setItemDraft({ ...itemDraft, role })} />
              <LocalizedFields label="Organization / event" value={itemDraft.organization} onChange={(organization) => setItemDraft({ ...itemDraft, organization })} />
              <LocalizedFields label="Location" value={itemDraft.location} onChange={(location) => setItemDraft({ ...itemDraft, location })} />
              <LocalizedFields label="Description (Markdown)" value={itemDraft.description} onChange={(description) => setItemDraft({ ...itemDraft, description })} multiline />
              <fieldset className="border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <legend className="px-1 text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Detailed lines (optional)</legend>
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="max-w-2xl text-xs leading-5 text-[var(--muted)]">Turn a simple list into individual entries only when useful. Each line can have a short bilingual note, up to six photos, labels, and links. Manage available labels in the Labels tab. Items stay grouped under this year.</p>
                  </div>
                  <button
                    type="button"
                    disabled={(itemDraft.highlights ?? []).length >= 40}
                    className="shrink-0 text-xs font-black text-[var(--accent)]"
                    onClick={() => setItemDraft({
                      ...itemDraft,
                      highlights: [
                        ...(itemDraft.highlights ?? []),
                        { id: crypto.randomUUID(), title: emptyLocalized(), description: emptyLocalized(), imageUrl: "", links: [] },
                      ],
                    })}
                  >
                    + Add detailed line
                  </button>
                </div>
                {(itemDraft.highlights ?? []).length > 0 && (
                  <div className="mt-5 space-y-4">
                    {(itemDraft.highlights ?? []).map((highlight, index) => (
                      <TimelineHighlightEditor
                        key={highlight.id}
                        highlight={highlight}
                        labels={orderedLabels}
                        index={index}
                        lineCount={(itemDraft.highlights ?? []).length}
                        busy={saving}
                        onMove={(direction) => setItemDraft((draft) => {
                          if (!draft) return draft;
                          const highlights = [...(draft.highlights ?? [])];
                          const currentIndex = highlights.findIndex((entry) => entry.id === highlight.id);
                          const targetIndex = currentIndex + direction;
                          if (currentIndex < 0 || targetIndex < 0 || targetIndex >= highlights.length) return draft;
                          [highlights[currentIndex], highlights[targetIndex]] = [highlights[targetIndex], highlights[currentIndex]];
                          return { ...draft, highlights };
                        })}
                        onChange={(nextHighlight) => {
                          const highlights = [...(itemDraft.highlights ?? [])];
                          highlights[index] = nextHighlight;
                          setItemDraft({ ...itemDraft, highlights });
                        }}
                        onRemove={() => setItemDraft({ ...itemDraft, highlights: (itemDraft.highlights ?? []).filter((entry) => entry.id !== highlight.id) })}
                        onUpload={(event) => uploadImage(event, "highlight", index)}
                      />
                    ))}
                  </div>
                )}
              </fieldset>

              <fieldset><legend className="mb-3 text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Labels</legend><div className="flex flex-wrap gap-2">{orderedLabels.map((label) => { const selected = itemDraft.tags.includes(label.id); return <button key={label.id} type="button" className={`filter-button ${selected ? "active" : ""}`} onClick={() => setItemDraft({ ...itemDraft, tags: selected ? itemDraft.tags.filter((tag) => tag !== label.id) : [...itemDraft.tags, label.id] })}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: label.accent }} />{label.name.en}</button>; })}</div></fieldset>
              <label className="flex items-center gap-3 text-sm font-black"><input type="checkbox" checked={itemDraft.featured} onChange={(event) => setItemDraft({ ...itemDraft, featured: event.target.checked })} /> Feature this item</label>
              <fieldset className="space-y-3"><legend className="font-bold">Item photos (up to 6)</legend>
                {entryImages(itemDraft).map((url, index) => <div key={index} className="flex gap-2">
                  <input className="admin-input" aria-label={`Item photo ${index + 1} URL`} value={url} onChange={(event) => setItemDraft({ ...itemDraft, images: entryImages(itemDraft).map((photo, i) => i === index ? event.target.value : photo) })} />
                  <button type="button" className="row-action danger" aria-label={`Remove item photo ${index + 1}`} onClick={() => setItemDraft({ ...itemDraft, imageUrl: "", images: entryImages(itemDraft).filter((_, i) => i !== index) })}><Trash2 size={15} /></button>
                </div>)}
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="filter-button" disabled={saving || entryImages(itemDraft).length >= 6} onClick={() => setItemDraft({ ...itemDraft, images: [...entryImages(itemDraft), ""] })}>Add photo URL</button>
                  <label className="upload-box"><ImagePlus size={18} /><span>Upload photo</span><input className="sr-only" aria-label="Upload timeline item photo" type="file" accept="image/*" disabled={saving || entryImages(itemDraft).length >= 6} onChange={(event) => uploadImage(event, "timeline")} /></label>
                </div>
              </fieldset>
              <fieldset><div className="mb-3 flex items-center justify-between"><legend className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Links</legend><button type="button" className="text-xs font-black text-[var(--accent)]" onClick={() => setItemDraft({ ...itemDraft, links: [...itemDraft.links, { id: crypto.randomUUID(), label: emptyLocalized(), url: "" }] })}>+ Add link</button></div><div className="space-y-4">{itemDraft.links.map((link: TimelineLink, index) => <div key={link.id} className="grid gap-3 border border-[var(--line)] p-4 sm:grid-cols-[1fr_1fr_1.2fr_auto]"><input className="admin-input" aria-label="English link label" placeholder="English label" value={link.label.en} onChange={(event) => { const links = [...itemDraft.links]; links[index] = { ...link, label: { ...link.label, en: event.target.value } }; setItemDraft({ ...itemDraft, links }); }} /><input className="admin-input" aria-label="Korean link label" placeholder="한국어 라벨" value={link.label.ko} onChange={(event) => { const links = [...itemDraft.links]; links[index] = { ...link, label: { ...link.label, ko: event.target.value } }; setItemDraft({ ...itemDraft, links }); }} /><input className="admin-input" aria-label="Link URL" placeholder="https://…" value={link.url} onChange={(event) => { const links = [...itemDraft.links]; links[index] = { ...link, url: event.target.value }; setItemDraft({ ...itemDraft, links }); }} /><button type="button" className="row-action danger" aria-label="Remove link" onClick={() => setItemDraft({ ...itemDraft, links: itemDraft.links.filter((entry) => entry.id !== link.id) })}><Trash2 size={15} /></button></div>)}</div></fieldset>
            </div>
            <div className="admin-modal-footer"><AdminButton variant="secondary" onClick={() => setItemDraft(null)}>Cancel</AdminButton><AdminButton type="submit" disabled={saving}><Save size={15} /> Save item</AdminButton></div>
          </form>
        </div>
      )}

      {sectionDraft && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="section-editor-title"><form className="admin-modal max-w-3xl" onSubmit={(event) => { event.preventDefault(); const id = sectionDraft.id || sectionDraft.title.en.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); if (!id) return setNotice("Add an English section title."); runMutation(() => setDoc(doc(db, "sections", id), { ...sectionDraft, id, updatedAt: new Date().toISOString() }), sectionDraft.id ? "Section updated." : "Section added."); setSectionDraft(null); }}><div className="admin-modal-header"><div><p className="section-eyebrow">Section editor</p><h2 id="section-editor-title">{sectionDraft.id ? "Edit section" : "New section"}</h2></div><button className="icon-button" type="button" onClick={() => setSectionDraft(null)}><X size={17} /></button></div><div className="admin-modal-body space-y-6"><LocalizedFields label="Title" value={sectionDraft.title} onChange={(title) => setSectionDraft({ ...sectionDraft, title })} /><LocalizedFields label="Eyebrow" value={sectionDraft.eyebrow} onChange={(eyebrow) => setSectionDraft({ ...sectionDraft, eyebrow })} /><label className="flex items-center gap-3 text-sm font-black"><input type="checkbox" checked={sectionDraft.visible} onChange={(event) => setSectionDraft({ ...sectionDraft, visible: event.target.checked })} /> Show this section publicly</label></div><div className="admin-modal-footer"><AdminButton variant="secondary" onClick={() => setSectionDraft(null)}>Cancel</AdminButton><AdminButton type="submit"><Save size={15} /> Save section</AdminButton></div></form></div>
      )}

      {labelDraft && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="label-editor-title"><form className="admin-modal max-w-3xl" onSubmit={(event) => { event.preventDefault(); const id = labelDraft.id || labelDraft.name.en.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); if (!id) return setNotice("Add an English label name."); runMutation(() => setDoc(doc(db, "labels", id), { ...labelDraft, id, updatedAt: new Date().toISOString() }), labelDraft.id ? "Label updated." : "Label added."); setLabelDraft(null); }}><div className="admin-modal-header"><div><p className="section-eyebrow">Label editor</p><h2 id="label-editor-title">{labelDraft.id ? "Edit label" : "New label"}</h2></div><button className="icon-button" type="button" onClick={() => setLabelDraft(null)}><X size={17} /></button></div><div className="admin-modal-body space-y-6"><LocalizedFields label="Name" value={labelDraft.name} onChange={(name) => setLabelDraft({ ...labelDraft, name })} /><Field label="Accent color"><div className="flex items-center gap-3"><input className="h-11 w-14 cursor-pointer border border-[var(--line)] bg-transparent" type="color" value={labelDraft.accent} onChange={(event) => setLabelDraft({ ...labelDraft, accent: event.target.value })} /><input className="admin-input" value={labelDraft.accent} onChange={(event) => setLabelDraft({ ...labelDraft, accent: event.target.value })} /></div></Field></div><div className="admin-modal-footer"><AdminButton variant="secondary" onClick={() => setLabelDraft(null)}>Cancel</AdminButton><AdminButton type="submit"><Save size={15} /> Save label</AdminButton></div></form></div>
      )}
    </main>
  );
}
