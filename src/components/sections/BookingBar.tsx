"use client";

import { useState } from "react";
import { site, whatsappHref } from "@/content/site";
import { useToday } from "@/lib/useToday";
import { bookingMessage, guestOptions, nextDay, suiteOptions } from "@/lib/booking";
import { Tbc } from "../Tbc";

/** Hero booking bar. Book Direct opens WhatsApp with the dates filled in (booking engine question parked with Jahnavi). */
export function BookingBar() {
  const today = useToday();
  const [checkIn, setIn] = useState("");
  const [checkOut, setOut] = useState("");
  const [guests, setGuests] = useState("2 guests");
  const [suite, setSuite] = useState("Any suite");
  const [out, setOutMsg] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setOutMsg("Choose your check-in and check-out dates first.");
      return;
    }
    const msg = bookingMessage(checkIn, checkOut, guests, suite);
    if (site.whatsapp) window.open(whatsappHref(msg), "_blank", "noopener");
    else setOutMsg(`WhatsApp number to come. This message will be ready to send: "${msg}"`);
  }

  return (
    <section className="book" id="book" aria-label="Check availability">
      <div className="wrap">
        <form className="bookbar" onSubmit={submit} noValidate>
          <div className="fld">
            <label htmlFor="b-in">Check-in</label>
            <input id="b-in" type="date" min={today} value={checkIn} onChange={(e) => { setIn(e.target.value); if (!checkOut || checkOut <= e.target.value) setOut(nextDay(e.target.value)); }} />
          </div>
          <div className="fld">
            <label htmlFor="b-out">Check-out</label>
            <input id="b-out" type="date" min={checkIn ? nextDay(checkIn) : today} value={checkOut} onChange={(e) => setOut(e.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="b-g">Guests</label>
            <select id="b-g" value={guests} onChange={(e) => setGuests(e.target.value)}>
              {guestOptions.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="fld">
            <label htmlFor="b-s">Suite</label>
            <select id="b-s" value={suite} onChange={(e) => setSuite(e.target.value)}>
              {suiteOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn--book" type="submit">Book direct</button>
        </form>
        <p className="book-msg">
          Book direct with the resort on WhatsApp, with your dates filled in. <Tbc>Booking engine or offer: question for Jahnavi</Tbc>
        </p>
        {out && <p className="book-out" aria-live="polite">{out}</p>}
      </div>
    </section>
  );
}
