"use client";
/* eslint-disable @next/next/no-img-element -- Gallery supports local and Firebase-hosted photos. */

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Language } from "@/src/types/content";

const copy = {
  en: { open: "View photo", viewer: "Photo viewer", close: "Close photo viewer", previous: "Previous photo", next: "Next photo", photo: "Photo" },
  ko: { open: "사진 보기", viewer: "사진 뷰어", close: "사진 뷰어 닫기", previous: "이전 사진", next: "다음 사진", photo: "사진" },
};

function PhotoViewer({ images, title, language, initialIndex, onClose }: {
  images: string[];
  title: string;
  language: Language;
  initialIndex: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const labels = copy[language];
  const move = (direction: number) => setIndex((current) => (current + direction + images.length) % images.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="photo-viewer"
      aria-label={labels.viewer}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (images.length > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <button type="button" className="photo-viewer-control photo-viewer-close" aria-label={labels.close} onClick={onClose} autoFocus>
        <X aria-hidden="true" />
      </button>
      <figure className="photo-viewer-figure">
        <img src={images[index]} alt={`${title} (${index + 1})`} />
        <figcaption aria-live="polite" aria-atomic="true">{labels.photo} {index + 1} / {images.length}</figcaption>
      </figure>
      {images.length > 1 && <>
        <button type="button" className="photo-viewer-control photo-viewer-previous" aria-label={labels.previous} onClick={() => move(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <button type="button" className="photo-viewer-control photo-viewer-next" aria-label={labels.next} onClick={() => move(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </>}
    </dialog>
  );
}

export function PhotoGallery({ images, title, language }: { images: string[]; title: string; language: Language }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="col-span-full flex flex-wrap items-start gap-2 sm:col-start-2">
      {images.map((url, index) => (
        <button key={`${url}-${index}`} type="button" className="cursor-zoom-in" aria-label={`${copy[language].open} ${index + 1}: ${title}`} aria-haspopup="dialog" onClick={() => setSelectedIndex(index)}>
          <img className="h-24 w-32 border border-[var(--line)] object-cover" src={url} alt={`${title} (${index + 1})`} loading="lazy" />
        </button>
      ))}
      {selectedIndex !== null && <PhotoViewer images={images} title={title} language={language} initialIndex={selectedIndex} onClose={() => setSelectedIndex(null)} />}
    </div>
  );
}
