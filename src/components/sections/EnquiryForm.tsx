"use client";

import { useState } from "react";
import { site, whatsappHref } from "@/content/site";
import { useToday } from "@/lib/useToday";
import { nextDay, suiteOptions } from "@/lib/booking";
import { Arrow } from "../icons";

/**
 * Enquiry form. Where enquiries go is still open (question for Jahnavi), so for now it
 * hands the enquiry to WhatsApp, or tells the guest to call or email until the number arrives.
 */
export function EnquiryForm() {
  const today = useToday();
  const [f, setF] = useState({ name: "", phone: "", checkIn: "", checkOut: "", suite: "Any suite", msg: "" });
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof err = {};
    if (!f.name.trim()) next.name = "Please add your name.";
    if (f.phone.replace(/\D/g, "").length < 10) next.phone = "Please add a phone or WhatsApp number we can reach.";
    setErr(next);
    if (Object.keys(next).length) return;

    const dates = f.checkIn && f.checkOut ? `, from ${f.checkIn} to ${f.checkOut}` : "";
    const text = `Hello Palm Regal, this is ${f.name.trim()} (${f.phone.trim()}). Enquiry for ${f.suite}${dates}.${f.msg.trim() ? ` ${f.msg.trim()}` : ""}`;
    if (site.whatsapp) {
      window.open(whatsappHref(text), "_blank", "noopener");
      setDone("Thank you. WhatsApp has opened with your enquiry ready to send.");
    } else {
      setDone(`Thank you, ${f.name.trim()}. Online enquiries are being set up, so please call ${site.phone.display} or email ${site.email} for now.`);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h3>Send an <em>enquiry.</em></h3>
      <div className="f">
        <label htmlFor="e-name">Name</label>
        <input id="e-name" autoComplete="name" value={f.name} onChange={set("name")} aria-invalid={!!err.name} aria-describedby="e-name-err" />
        <span className="err" id="e-name-err">{err.name}</span>
      </div>
      <div className="f">
        <label htmlFor="e-phone">Phone or WhatsApp</label>
        <input id="e-phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} aria-invalid={!!err.phone} aria-describedby="e-phone-err" />
        <span className="err" id="e-phone-err">{err.phone}</span>
      </div>
      <div className="f">
        <label htmlFor="e-in">Check-in</label>
        <input id="e-in" type="date" min={today} value={f.checkIn} onChange={(e) => setF({ ...f, checkIn: e.target.value, checkOut: !f.checkOut || f.checkOut <= e.target.value ? nextDay(e.target.value) : f.checkOut })} />
      </div>
      <div className="f">
        <label htmlFor="e-out">Check-out</label>
        <input id="e-out" type="date" min={f.checkIn ? nextDay(f.checkIn) : today} value={f.checkOut} onChange={set("checkOut")} />
      </div>
      <div className="f full">
        <label htmlFor="e-suite">Suite</label>
        <select id="e-suite" value={f.suite} onChange={set("suite")}>{suiteOptions.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="f full">
        <label htmlFor="e-msg">Message</label>
        <textarea id="e-msg" placeholder="Guests, pets, special requests" value={f.msg} onChange={set("msg")} />
      </div>
      <button className="btn btn--teal" type="submit">Send enquiry <Arrow /></button>
      {done && <p className="done" aria-live="polite">{done}</p>}
    </form>
  );
}
