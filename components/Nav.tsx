"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/report", label: "Report" },
  { href: "/admin", label: "Admin" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 640px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <nav className="nav-bar" aria-label="Main navigation" ref={navRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}>
      <Link href="/" className="nav-brand" onClick={() => setOpen(false)}>
        VeriSip
      </Link>
      <button
        ref={toggleRef}
        type="button"
        className="nav-toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="navigation-links"
        onClick={() => setOpen(!open)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      <ul id="navigation-links" className={`nav-links${open ? " nav-links-open" : ""}`}>
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href)) ? "page" : undefined}
              className={`nav-link ${pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href)) ? "nav-active" : ""}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
