"use client";

import { useCallback, useEffect, useState } from "react";
import { HomeHub } from "./HomeHub";

const INTRO_MS = 7000;
const SKIP_KEY = "bianco_sw_intro_seen";

export function HomePageClient() {
  const [phase, setPhase] = useState<"intro" | "hub" | "fade">("intro");

  const finishIntro = useCallback(() => {
    setPhase("fade");
    setTimeout(() => {
      setPhase("hub");
      try {
        sessionStorage.setItem(SKIP_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 400);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SKIP_KEY) === "1") {
        setPhase("hub");
        return;
      }
    } catch {
      /* ignore */
    }

    const t = setTimeout(finishIntro, INTRO_MS);
    return () => clearTimeout(t);
  }, [finishIntro]);

  if (phase === "hub") {
    return <HomeHub />;
  }

  return (
    <div
      className={`sw-universe fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-[400ms] ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
      onClick={finishIntro}
      onKeyDown={(e) => e.key === "Enter" && finishIntro()}
      role="button"
      tabIndex={0}
      aria-label="Intro Bianco — cliquer pour continuer"
    >
      <div className="sw-stars sw-stars-1" aria-hidden />
      <div className="sw-stars sw-stars-2" aria-hidden />
      <div className="sw-stars sw-stars-3" aria-hidden />

      <div className="sw-hyperspace" aria-hidden />

      <div className="relative z-10 flex h-full flex-col">
        <header className="sw-logo-wrap pt-[12vh] text-center">
          <p className="sw-logo-sub">Institut de beauté — Hyères</p>
          <h1 className="sw-logo">Bianco Esthétique</h1>
        </header>

        <div className="sw-crawl-perspective flex-1">
          <div className="sw-crawl">
            <p className="sw-crawl-episode">Épisode I</p>
            <h2 className="sw-crawl-title">L&apos;ÉCLAT DU VAR</h2>
            <div className="sw-crawl-body">
              <p>
                Bianco Esthétique, votre institut de beauté à Hyères, vous
                accueille du lundi au vendredi.
              </p>
              <p className="mt-4">
                <strong>Salomé</strong>, maîtresse des lieux, vous apportera
                tout son savoir-faire, son sourire et sa bonne humeur.
              </p>
            </div>
          </div>
        </div>

        <p className="sw-skip pb-8 text-center text-[10px] uppercase tracking-[0.35em] text-[#FFE81F]/40">
          Toucher pour entrer
        </p>
      </div>
    </div>
  );
}
