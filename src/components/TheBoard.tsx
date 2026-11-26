"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { EXHIBITION_WALL_PROMPTS } from "@/lib/tokens";
import { MagneticButton } from "@/components/MotionPrimitives";

interface BoardSubmission {
  id: string;
  name: string;
  message: string;
  status: "pending_moderation" | "approved_local_preview";
  submittedAt: string;
}

const BOARD_STORAGE_KEY = "psyphi_board_submissions_v1";

export function TheBoard() {
  const wallRef = useRef<HTMLDivElement>(null);
  const [pointerShift, setPointerShift] = useState({ x: 0, y: 0 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [visitorQueue, setVisitorQueue] = useState<BoardSubmission[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(BOARD_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setVisitorQueue(parsed);
          }
        }
      } catch {
        // Ignore storage errors
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        BOARD_STORAGE_KEY,
        JSON.stringify(visitorQueue)
      );
    } catch {
      // Ignore storage errors
    }
  }, [visitorQueue]);

  const handleWallPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!wallRef.current) return;
    const rect = wallRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setPointerShift({ x: nx, y: ny });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setStatusNotice(null);

    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorText("Enter a valid email address for moderation follow-up.");
      return;
    }
    if (trimmedMessage.length < 4) {
      setErrorText("Write at least a few words before pinning to the board.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          message: trimmedMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorText(data.error ?? "Could not submit your observation.");
        return;
      }

      const newEntry: BoardSubmission = {
        id: data.id,
        name: name.trim() || "Anonymous Observer",
        message: trimmedMessage,
        status: "pending_moderation",
        submittedAt: data.submittedAt,
      };

      setVisitorQueue((prev) => [newEntry, ...prev]);
      setName("");
      setEmail("");
      setMessage("");
      setStatusNotice(
        "Submitted to the moderation queue. Public wall pins appear only after curatorial review."
      );
    } catch {
      setErrorText("Network interruption while reaching the board.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocalCuratorApprove = (id: string) => {
    setVisitorQueue((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: "approved_local_preview" }
          : entry
      )
    );
  };

  const handleRemoveLocal = (id: string) => {
    setVisitorQueue((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <section
      id="the-board"
      aria-label="The Board — Digital Observation Wall"
      className="raw-paper-surface relative scroll-mt-16 border-y border-[#141311]/15 py-24 text-[#141311] sm:py-32"
    >
      <div className="mx-auto max-w-[1380px] px-6 sm:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4 border-b border-[#141311]/20 pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#C83E2E]">
              EXHIBITION WING 05 // DIGITAL OBSERVATION WALL
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-[-0.03em] sm:text-6xl">
              THE BOARD
            </h2>
          </div>
          <p className="max-w-md font-sans text-sm leading-relaxed text-[#141311]/75">
            Leave a note. Feedback, questions, or just something you noticed.
            Every public submission enters curatorial moderation before wall
            placement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left: Interactive Observation Wall Canvas */}
          <div
            ref={wallRef}
            onPointerMove={handleWallPointerMove}
            onPointerLeave={() => setPointerShift({ x: 0, y: 0 })}
            className="relative flex flex-col justify-between border border-[#141311]/20 bg-[#FAF8F2] p-7 sm:p-9 lg:col-span-7"
          >
            <div className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#141311]/60">
              <span>EXHIBITION WALL // LIVE FRAGMENTS</span>
              <span>CURATORIAL PROMPTS &amp; YOUR QUEUED NOTES</span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {EXHIBITION_WALL_PROMPTS.map((fragment, idx) => {
                const parallaxFactor = (idx % 2 === 0 ? 1 : -1) * 10;
                return (
                  <div
                    key={fragment.id}
                    style={{
                      transform: `translate3d(${pointerShift.x * parallaxFactor}px, ${pointerShift.y * parallaxFactor}px, 0) rotate(${fragment.rotation}deg)`,
                      transition: "transform 450ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                    className="border border-[#141311]/20 bg-[#F2EDE2] p-6"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C83E2E]">
                      {fragment.code}
                    </span>
                    <p className="mt-2.5 font-serif text-2xl leading-snug italic text-[#141311]">
                      &ldquo;{fragment.prompt}&rdquo;
                    </p>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#141311]/60">
                      {fragment.attribution}
                    </p>
                  </div>
                );
              })}

              {visitorQueue.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-[#C83E2E]/50 bg-[#FFFDF8] p-6"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.18em]">
                    <span className="inline-flex items-center gap-1 text-[#C83E2E]">
                      {entry.status === "pending_moderation" ? (
                        <>
                          <Clock3 className="h-3 w-3" aria-hidden="true" />
                          <span>Pending Moderation</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          <span>Approved (Local Preview)</span>
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocal(entry.id)}
                      className="text-[#141311]/60 underline hover:text-[#C83E2E]"
                    >
                      Withdraw
                    </button>
                  </div>

                  <p className="mt-2.5 font-sans text-sm leading-relaxed text-[#141311]">
                    {entry.message}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#141311]/65">
                    — {entry.name}
                  </p>

                  {entry.status === "pending_moderation" && (
                    <div className="mt-3 border-t border-[#141311]/12 pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleLocalCuratorApprove(entry.id)}
                        className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#141311] underline hover:text-[#C83E2E]"
                      >
                        Preview Approved Wall Placement
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2 border-t border-[#141311]/15 pt-4 font-sans text-xs text-[#141311]/70">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#C83E2E]" aria-hidden="true" />
              <span>
                No fabricated testimonials shown. Only curatorial prompts and
                your moderated submissions appear here.
              </span>
            </div>
          </div>

          {/* Right: Clean Submission Form */}
          <div className="border border-[#141311]/20 bg-[#FAF8F2] p-7 sm:p-9 lg:col-span-5">
            <h3 className="font-display text-2xl font-bold uppercase tracking-[-0.02em] text-[#141311]">
              PIN AN OBSERVATION
            </h3>
            <p className="mt-2 font-sans text-sm text-[#141311]/75">
              Notice something about class, clothes, or the city? Send it to the
              curatorial desk.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="board-name"
                  className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Name <span className="opacity-60">(optional)</span>
                </label>
                <input
                  id="board-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Observer"
                  className="w-full border border-[#141311]/30 bg-white px-3.5 py-2.5 font-sans text-sm text-[#141311] placeholder:text-[#141311]/40 focus:border-[#C83E2E] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="board-email"
                  className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Email <span className="text-[#C83E2E]">*</span>
                </label>
                <input
                  id="board-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-[#141311]/30 bg-white px-3.5 py-2.5 font-sans text-sm text-[#141311] placeholder:text-[#141311]/40 focus:border-[#C83E2E] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="board-message"
                  className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Observation / Perspective{" "}
                  <span className="text-[#C83E2E]">*</span>
                </label>
                <textarea
                  id="board-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What did you notice?"
                  className="w-full resize-y border border-[#141311]/30 bg-white px-3.5 py-2.5 font-sans text-sm text-[#141311] placeholder:text-[#141311]/40 focus:border-[#C83E2E] focus:outline-none"
                />
              </div>

              {errorText && (
                <p
                  role="alert"
                  className="border border-[#C83E2E] bg-[#fde8e8] p-3 font-sans text-xs text-[#C83E2E]"
                >
                  {errorText}
                </p>
              )}

              {statusNotice && (
                <p
                  role="status"
                  className="border border-[#141311]/25 bg-[#E8DFC8] p-3 font-sans text-xs text-[#141311]"
                >
                  {statusNotice}
                </p>
              )}

              <MagneticButton
                type="submit"
                disabled={submitting}
                cursorLabel="add"
                className="tactile-btn inline-flex min-h-[48px] w-full items-center justify-center bg-[#C83E2E] px-6 py-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#F4EFE4] hover:bg-[#141311] disabled:opacity-60"
              >
                {submitting ? "SENDING TO DESK..." : "SEND TO THE BOARD"}
              </MagneticButton>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
