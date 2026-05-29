"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { InvitationLanguage } from "@/lib/invitationDisplay";
import { resolveInvitationMusicSrc } from "@/lib/resolveInvitationMusicSrc";

type InvitationMusicProps = {
  language?: InvitationLanguage;
  /** Wedding `invitation_music_url` or explicit override. */
  src?: string | null;
};

function MusicNoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h6V3h-8z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export default function InvitationMusic({ language = "en", src: srcProp }: InvitationMusicProps) {
  const resolvedSrc = resolveInvitationMusicSrc(srcProp);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setLoadError(false);
    const audio = audioRef.current;
    if (audio) audio.volume = 0.5;
  }, [resolvedSrc]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !resolvedSrc) return;

    if (playing) {
      audio.pause();
      return;
    }

    setLoadError(false);
    try {
      if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
        audio.load();
        await new Promise<void>((resolve, reject) => {
          const onReady = () => {
            cleanup();
            resolve();
          };
          const onErr = () => {
            cleanup();
            reject(new Error("load failed"));
          };
          const cleanup = () => {
            audio.removeEventListener("canplay", onReady);
            audio.removeEventListener("error", onErr);
          };
          audio.addEventListener("canplay", onReady);
          audio.addEventListener("error", onErr);
        });
      }
      await audio.play();
    } catch {
      setPlaying(false);
      setLoadError(true);
    }
  }, [playing, resolvedSrc]);

  if (!resolvedSrc) return null;

  const playLabel = language === "el" ? "Αναπαραγωγή μουσικής" : "Play music";
  const pauseLabel = language === "el" ? "Σίγαση μουσικής" : "Pause music";
  const errorHint =
    language === "el"
      ? "Η μουσική δεν φορτώθηκε — ανεβάστε MP3 από το admin"
      : "Music failed to load — upload an MP3 in admin";

  return (
    <div
      className="fixed right-[max(12px,var(--invite-gutter,12px))] bottom-5 z-50 sm:bottom-8"
      aria-live="polite"
    >
      <audio
        ref={audioRef}
        src={resolvedSrc}
        loop
        preload="auto"
        playsInline
        className="hidden"
        onPlay={() => {
          setLoadError(false);
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setLoadError(true);
        }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? pauseLabel : playLabel}
        title={loadError ? errorHint : playing ? pauseLabel : playLabel}
        className={`invite-float flex h-11 w-11 cursor-pointer items-center justify-center border border-[#FAF6F2]/30 bg-[#6F5248]/92 text-[#FAF6F2] shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur-sm transition-[filter,background-color,border-color,opacity] hover:border-[#FAF6F2]/50 hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6F2]/60 sm:h-12 sm:w-12 ${loadError ? "opacity-55 ring-1 ring-red-300/50" : ""} ${playing ? "ring-1 ring-[#FAF6F2]/35" : ""}`}
      >
        {playing ? (
          <PauseIcon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
        ) : (
          <MusicNoteIcon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
        )}
      </button>
    </div>
  );
}
