import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { PageMotion } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Contact and booking",
  description: "Book direct with Palm Regal: call reception, email or send an enquiry.",
};

export default function ContactPage() {
  return (
    <>
      <Contact headingLevel={1} />
      <Faq />
      <PageMotion />
    </>
  );
}
