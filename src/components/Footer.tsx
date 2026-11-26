"use client";

import React, { useState } from "react";
import { BRAND, NAV_ITEMS } from "@/lib/tokens";
import { useSmoothScroll } from "@/lib/lenis-provider";

interface FooterProps {
  onReplayIntro: () => void;
}

export function Footer({ onReplayIntro }: FooterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { scrollTo } = useSmoothScroll();

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to register email.");
        return;
      }
      setStatus(data.message);
      setEmail("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative bg-[#070605] text-[#EDE7D9]">
      {/* Brand oxblood accent hairline */}
      <div className="h-[3px] w-full bg-[#B23A2E]" />

      <div className="mx-auto max-w-[1380px] px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 lg:grid-cols-12">
          {/* Newsletter */}
          <div className="lg:col-span-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-[-0.02em]">
              Stay in the loop
            </h2>
            <p className="mt-2 max-w-md font-sans text-sm text-[#B0A99D]">
              Dispatches on upcoming drops, Mumbai field notes, and exhibition
              openings. No noise.
            </p>

            <form
              onSubmit={handleNewsletter}
              className="mt-5 flex flex-col gap-2.5 sm:flex-row"
              noValidate
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="min-h-[44px] flex-1 border border-white/25 bg-transparent px-4 py-2 font-sans text-sm text-[#F4EFE4] placeholder:text-[#B0A99D]/60 focus:border-[#C83E2E] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                data-cursor="add"
                className="tactile-btn min-h-[44px] bg-[#C83E2E] px-6 py-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#F4EFE4] hover:bg-[#F4EFE4] hover:text-[#060605] disabled:opacity-60"
              >
                {loading ? "Saving..." : "I'm In"}
              </button>
            </form>

            {error && (
              <p className="mt-2 font-mono text-xs text-[#d4493b]" role="alert">
                {error}
              </p>
            )}
            {status && (
              <p
                className="mt-2 font-mono text-xs text-[#EDE7D9]/85"
                role="status"
              >
                {status}
              </p>
            )}
          </div>

          {/* Nav + Contact */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-6 lg:items-end">
            <nav aria-label="Footer Exhibition Links">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.16em]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(`#${item.id}`)}
                      className="text-[#EDE7D9]/85 transition-colors hover:text-[#B23A2E]"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[#948E82]">
              <a
                href={`mailto:${BRAND.email}`}
                className="text-[#EDE7D9] underline-offset-4 hover:text-[#B23A2E] hover:underline"
              >
                {BRAND.email}
              </a>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  onReplayIntro();
                }}
                className="uppercase tracking-[0.16em] text-[#948E82] hover:text-[#EDE7D9]"
              >
                Replay Opening
              </button>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-heavy text-lg uppercase tracking-[0.12em] text-[#B23A2E]">
            {BRAND.tagline}
          </p>
          <div className="flex items-center gap-6 font-mono text-xs text-[#948E82]">
            <span>© 2026 {BRAND.name}</span>
            <a
              href={BRAND.storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[#EDE7D9]"
            >
              {BRAND.domain}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
