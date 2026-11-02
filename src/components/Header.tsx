"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site, whatsappHref } from "@/content/site";
import { Close, Menu, Phone, WhatsApp } from "./icons";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [solid, setSolid] = useState(!isHome);
  const [hidden, setHidden] = useState(false);
  // The menu remembers the page it was opened on, so it closes itself when the route changes.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (v: boolean) => setOpenPath(v ? pathname : null);
  const lastY = useRef(0);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const h = window.innerHeight * 0.6;
      setSolid(!isHome || y > h);
      if (y > h && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y < h) setHidden(false);
      lastY.current = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenPath(null);
        openBtn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isCurrent = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <>
      <header className={`hdr${solid ? " solid" : ""}${hidden && !open ? " hide" : ""}`}>
        <div className="wrap">
          <Link className="logo" href="/" aria-label="Palm Regal, home">
            <Image src="/images/emblem.png" alt="" width={40} height={44} />
            <span>
              <b>{site.name}</b>
              <small>Resort Homestay · Gopalpur</small>
            </span>
          </Link>
          <nav className="nav" aria-label="Main">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} data-t={n.label} aria-current={isCurrent(n.href) ? "page" : undefined}>
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
          <div className="acts">
            <a className="ibtn opt" href={`tel:${site.phone.tel}`} aria-label="Call Palm Regal">
              <Phone />
            </a>
            <a className="ibtn opt" href={whatsappHref()} aria-label="WhatsApp Palm Regal">
              <WhatsApp />
            </a>
            <Link className="btn btn--book" href="/#book">
              Book direct
            </Link>
            <button ref={openBtn} className="ibtn menu-btn" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(true)}>
              <Menu />
            </button>
          </div>
        </div>
      </header>
      <div id="mnav" className={`mnav${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <div className="mnav-top">
          <Link className="logo" href="/">
            <Image src="/images/emblem.png" alt="" width={40} height={44} />
            <span>
              <b>{site.name}</b>
            </span>
          </Link>
          <button ref={closeBtn} className="ibtn" type="button" aria-label="Close menu" onClick={() => { setOpen(false); openBtn.current?.focus(); }}>
            <Close />
          </button>
        </div>
        <nav aria-label="Mobile">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mnav-foot">
          <Link className="btn btn--book" href="/#book" onClick={() => setOpen(false)}>
            Book direct
          </Link>
          <a className="btn btn--line" href={`tel:${site.phone.tel}`}>
            <Phone />
            Call
          </a>
          <a className="btn btn--line" href={whatsappHref()}>
            <WhatsApp />
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
