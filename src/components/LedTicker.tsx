"use client";

import React from "react";
import { LED_TICKER_ITEMS } from "@/lib/tokens";

export function LedTicker() {
  const repeated = [...LED_TICKER_ITEMS, ...LED_TICKER_ITEMS];

  return (
    <section
      aria-label="PSY PHI Multilingual Notice Ticker"
      className="relative z-20 border-y border-[#141311]/15 bg-[#F2EDE2] py-3.5 text-[#11100E]"
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[#F2EDE2] to-transparent sm:w-28"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#F2EDE2] to-transparent sm:w-28"
        />
        <div className="led-marquee-track items-center gap-5 px-4 font-sans text-xs font-semibold tracking-[0.16em] text-[#11100E] sm:text-sm">
          {repeated.map((phrase, idx) => (
            <React.Fragment key={`${phrase}-${idx}`}>
              <span className="whitespace-nowrap">{phrase}</span>
              <span aria-hidden="true" className="text-[#C83E2E]">
                /
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
