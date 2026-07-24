"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ChevronDown } from "@/components/icons/ChevronDown";
import { PhoneIcon } from "@/components/icons/PhoneIcon";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import { routes } from "@/constants/routes";
import { navigation } from "@/data/navigation";
import { propertyTypeCards } from "@/features/home/data";

const propertyNavItems = propertyTypeCards.filter((item) => item.id !== "more");

function isNavActive(pathname: string, href: string) {
  if (href === routes.home) return pathname === routes.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isSubNavActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string,
) {
  const [path, query = ""] = href.split("?");
  if (!isNavActive(pathname, path)) return false;
  if (!query) return !searchParams.toString();

  const expected = new URLSearchParams(query);
  for (const [key, value] of expected.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const settings = useSiteSettings();
  const callHref = `tel:${settings.phone}`;
  const propertiesActive = isNavActive(pathname, routes.properties);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setPropertiesOpen(false);
      }
    }
    if (menuOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      setPropertiesOpen(false);
      return;
    }
    if (propertiesActive) setPropertiesOpen(true);
  }, [menuOpen, propertiesActive]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white">
        <div className="mx-auto flex h-[5rem] w-full items-center justify-between gap-4 px-4 sm:px-6 md:px-4 lg:gap-6 lg:px-[100px]">
          <BrandLogo />

          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 lg:flex lg:gap-10"
          >
            {navigation.map((item) => {
              const active =
                "hasDropdown" in item && item.hasDropdown
                  ? propertiesActive
                  : isNavActive(pathname, item.href);

              return "hasDropdown" in item && item.hasDropdown ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center gap-1 text-[0.95rem] font-semibold transition-colors group-hover:text-[var(--brand-red)] ${
                      active
                        ? "text-[var(--brand-red)]"
                        : "text-[var(--nav-text)]"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 translate-y-[1px] text-current transition-transform duration-200 group-hover:rotate-180" />
                  </Link>

                  <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                    <div className="overflow-hidden rounded-xl border border-[#e8edf5] bg-white py-2 shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
                      {propertyNavItems.map((subItem) => {
                        const { Icon } = subItem;
                        const subActive = isSubNavActive(
                          pathname,
                          searchParams,
                          subItem.href,
                        );

                        return (
                          <Link
                            key={subItem.id}
                            href={subItem.href}
                            aria-current={subActive ? "page" : undefined}
                            className={`flex items-center gap-3 px-4 py-2.5 text-[0.9rem] font-semibold transition-colors hover:bg-[#f8fafc] hover:text-[var(--brand-red)] ${
                              subActive
                                ? "bg-[#f8fafc] text-[var(--brand-red)]"
                                : "text-[var(--nav-text)]"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                subActive
                                  ? "text-[var(--brand-red)]"
                                  : "text-[var(--brand-blue)]"
                              }`}
                            />
                            {subItem.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-1 text-[0.95rem] font-semibold transition-colors hover:text-[var(--brand-red)] ${
                    active
                      ? "text-[var(--brand-red)]"
                      : "text-[var(--nav-text)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <a
            href={callHref}
            className="hidden shrink-0 items-center gap-2 rounded-full bg-[var(--brand-red)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c9181e] lg:inline-flex"
          >
            <PhoneIcon className="h-4 w-4" />
            Phone Number
          </a>

          {/* Burger menu for tablet + mobile */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-[var(--brand-navy)] transition-colors hover:bg-black/[0.02] lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/[0.35]"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute left-0 top-0 flex h-dvh w-[82vw] max-w-none flex-col bg-[var(--brand-navy)] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:w-[76vw] md:w-[58vw]">
            <div className="flex shrink-0 justify-end px-6 pt-6">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
              <ul className="flex-1 space-y-6 overflow-y-auto pt-2">
                {navigation.map((item) => {
                  const active =
                    "hasDropdown" in item && item.hasDropdown
                      ? propertiesActive
                      : isNavActive(pathname, item.href);

                  return "hasDropdown" in item && item.hasDropdown ? (
                    <li key={item.href}>
                      <button
                        type="button"
                        onClick={() => setPropertiesOpen((open) => !open)}
                        className={`flex w-full items-center justify-between text-left text-[1.05rem] font-semibold transition-colors ${
                          active ? "text-[var(--brand-red)]" : "text-white"
                        }`}
                        aria-expanded={propertiesOpen}
                        aria-current={active ? "page" : undefined}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            propertiesOpen ? "rotate-180" : ""
                          } ${active ? "text-[var(--brand-red)]" : "text-white/80"}`}
                        />
                      </button>

                      {propertiesOpen ? (
                        <ul className="mt-4 space-y-3 border-l border-white/15 pl-4">
                          {propertyNavItems.map((subItem) => {
                            const subActive = isSubNavActive(
                              pathname,
                              searchParams,
                              subItem.href,
                            );

                            return (
                              <li key={subItem.id}>
                                <Link
                                  href={subItem.href}
                                  onClick={() => setMenuOpen(false)}
                                  aria-current={subActive ? "page" : undefined}
                                  className={`block text-[0.95rem] font-medium transition-colors hover:text-white ${
                                    subActive
                                      ? "text-[var(--brand-red)]"
                                      : "text-white/80"
                                  }`}
                                >
                                  {subItem.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between text-[1.05rem] font-semibold transition-colors ${
                          active ? "text-[var(--brand-red)]" : "text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <a
                href={callHref}
                className="mt-6 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c9181e]"
              >
                <PhoneIcon className="h-4 w-4" />
                Phone Number
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
