import type { Metadata } from "next";
import { SuiteRow } from "@/components/sections/SuiteRow";
import { Why } from "@/components/sections/Why";
import { suites } from "@/content/suites";
import { PageMotion } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Suites",
  description: "One and two bedroom serviced suites with a living room, kitchenette and private balcony, five minutes' walk from Gopalpur beach.",
};

export default function SuitesPage() {
  return (
    <>
      <section className="sec page-top suites" aria-labelledby="suites-h">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Our suites</p>
            <h1 id="suites-h" data-split>Room to live, <em>not just sleep.</em></h1>
            <p className="lede">Every suite has its own living room with a convertible sofa bed, a kitchenette and a private balcony.</p>
          </div>
          <div className="suite-list">
            {suites.map((s) => <SuiteRow key={s.slug} suite={s} headingLevel={2} />)}
          </div>
        </div>
      </section>
      <Why />
      <PageMotion />
    </>
  );
}
