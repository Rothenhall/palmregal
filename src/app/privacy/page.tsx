import type { Metadata } from "next";
import { Tbc } from "@/components/Tbc";
import { site } from "@/content/site";
import { PageMotion } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false },
};

// Draft structure only. The wording must be reviewed and approved by the resort before launch.
export default function PrivacyPage() {
  return (
    <>
      <section className="sec page-top" aria-labelledby="pv-h">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Privacy</p>
            <h1 id="pv-h">Your details, <em>kept simple.</em></h1>
            <Tbc>Draft: wording to be approved by the resort</Tbc>
          </div>
          <div className="prose">
            <h2>What we collect</h2>
            <p>When you send an enquiry or message us, we receive the details you choose to give: your name, phone or WhatsApp number, dates and any message.</p>
            <h2>How we use it</h2>
            <p>Only to answer your enquiry and look after your booking. We do not sell your details.</p>
            <h2>Contact</h2>
            <p>
              For any question about your details, email <a href={`mailto:${site.email}`}>{site.email}</a> or call {site.phone.display}.
            </p>
          </div>
        </div>
      </section>
      <PageMotion />
    </>
  );
}
