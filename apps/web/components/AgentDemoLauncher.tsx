"use client";

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import BirdMark from "@/components/ui/BirdMark";

type AgentDemoLauncherProps = {
  buttonClassName?: string;
  children?: ReactNode;
};

const SCRIPT_ID = "elevenlabs-convai-script";
const WIDGET_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";
const AGENT_ID = "agent_7601k7z0n6a0ex9t8tfta2vqs6jn";

export default function AgentDemoLauncher({ buttonClassName, children }: AgentDemoLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const label = useMemo(() => {
    if (children === undefined || children === null) {
      return (
        <>
          Talk with our <span className="whitespace-nowrap">AI agent</span>
        </>
      );
    }
    return children;
  }, [children]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setWidgetReady(false);
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [closeModal, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== "undefined" && window.customElements?.get("elevenlabs-convai")) {
      setWidgetReady(true);
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const handleScriptLoad = () => {
      setWidgetReady(true);
    };

    if (existingScript) {
      if (existingScript.getAttribute("data-loaded") === "true") {
        setWidgetReady(true);
      } else {
        existingScript.addEventListener("load", handleScriptLoad, { once: true });
      }
      return () => {
        existingScript.removeEventListener("load", handleScriptLoad);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = WIDGET_SRC;
    script.async = true;
    script.type = "text/javascript";
    script.dataset.loaded = "false";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        handleScriptLoad();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        console.warn("convai_script_failed_to_load");
        setWidgetReady(false);
      },
      { once: true },
    );
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleScriptLoad);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          buttonClassName ??
          "btn w-full border border-purple-400/30 bg-purple-500/15 text-slate-50 transition duration-150 ease-in-out hover:border-purple-300/50 hover:bg-purple-500/25 hover:text-white"
        }
      >
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Close demo agent overlay"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80"
              ref={closeButtonRef}
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path
                  fill="currentColor"
                  d="M3.28 2.22 8 6.94l4.72-4.72 1.06 1.06L9.06 8l4.72 4.72-1.06 1.06L8 9.06l-4.72 4.72-1.06-1.06L6.94 8 2.22 3.28l1.06-1.06Z"
                />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <BirdMark className="h-7 w-7 text-white" size={28} alt="EarlyBird AI mark" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32rem] text-slate-400">Live demo</p>
                <h2 className="text-lg font-semibold text-white">Speak with the EarlyBird agent</h2>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              Ask scheduling questions, leave a voicemail, or just chat. We&apos;ll transcribe the conversation in real time so you can see how follow-ups stay in sync.
            </p>

            <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/40 p-3">
              {widgetReady ? (
                createElement("elevenlabs-convai", {
                  "agent-id": AGENT_ID,
                  style: { display: "block", width: "100%" },
                })
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                  Booting the voice agent&hellip;
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Tip: have your microphone ready. The agent uses live audio and transcription just like it does on customer calls.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
