"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, whatsappHref } from "@/content/site";
import { useToday } from "@/lib/useToday";
import { bookingMessage, guestOptions, nextDay } from "@/lib/booking";
import { Calendar, WhatsApp } from "./icons";

/** Floating liquid-glass Book Direct pill plus the WhatsApp button, on every page. */
export function Floaters() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [checkIn, setIn] = useState("");
  const [checkOut, setOut] = useState("");
  const [guests, setGuests] = useState("2 guests");
  const [note, setNote] = useState("Your dates go straight to the resort's WhatsApp.");
  const today = useToday();

  useEffect(() => {
    function check() {
      const book = document.getElementById("book");
      const enq = document.querySelector(".enq");
      const past = book ? book.getBoundingClientRect().bottom < 60 : window.scrollY > 400;
      const beforeEnd = enq ? enq.getBoundingClientRect().top > window.innerHeight * 0.6 : true;
      const s = past && beforeEnd;
      setShow(s);
      if (!s) setOpen(false);
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [pathname]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setNote("Choose your dates first.");
      return;
    }
    const msg = bookingMessage(checkIn, checkOut, guests);
    if (site.whatsapp) window.open(whatsappHref(msg), "_blank", "noopener");
    else setNote(`WhatsApp number to come. Your message: "${msg}"`);
  }

  return (
    <>
      <div className={`lpill${show ? " show" : ""}`}>
        {open && (
          <form className="lpanel" onSubmit={submit} noValidate>
            <div className="fld">
              <label htmlFor="p-in">Check-in</label>
              <input id="p-in" type="date" min={today} value={checkIn} onChange={(e) => { setIn(e.target.value); if (!checkOut || checkOut <= e.target.value) setOut(nextDay(e.target.value)); }} />
            </div>
            <div className="fld">
              <label htmlFor="p-out">Check-out</label>
              <input id="p-out" type="date" min={checkIn ? nextDay(checkIn) : today} value={checkOut} onChange={(e) => setOut(e.target.value)} />
            </div>
            <div className="fld full">
              <label htmlFor="p-g">Guests</label>
              <select id="p-g" value={guests} onChange={(e) => setGuests(e.target.value)}>
                {guestOptions.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <button className="btn btn--book" type="submit">Book direct on WhatsApp</button>
            <p aria-live="polite">{note}</p>
          </form>
        )}
        <button className="lpill-btn" type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span>
            Check availability<small>Best rate when you book direct</small>
          </span>
          <span className="go"><Calendar />Book direct</span>
        </button>
      </div>
      <a className="wa" href={whatsappHref()} aria-label="Chat with Palm Regal on WhatsApp">
        <span className="t">Chat with us</span>
        <span className="b"><WhatsApp /></span>
      </a>
    </>
  );
}
