"use client";

import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { howItWorksData, howItWorksFaqs } from "@/features/how-it-works/data";

export function HowItWorksFaq() {
  const { title, description } = howItWorksData.faqIntro;
  const [openId, setOpenId] = useState<string | null>(howItWorksFaqs[0]?.id ?? null);

  return (
    <section className="w-full bg-[#f5f7fa]">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2rem] lg:text-[2.25rem]">
            {title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] sm:text-[16px]">
            {description}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {howItWorksFaqs.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#e8edf5] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-semibold text-[var(--brand-navy)] sm:text-[16px]">
                    {item.question}
                  </span>
                  <HiChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--muted)] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen ? (
                  <div className="border-t border-[#eef2f7] px-5 pb-5 pt-4 sm:px-6">
                    <p className="text-[14px] leading-relaxed text-[var(--muted)] sm:text-[15px]">
                      {item.answer}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
