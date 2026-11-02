import type { Metadata } from "next";
import { Delights } from "@/components/sections/Delights";
import { Why } from "@/components/sections/Why";
import { PageMotion } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Pool, gym, theatre, gaming lounge, children's play area, amphitheatre, sea view deck and more at Palm Regal, Gopalpur on Sea.",
};

export default function FacilitiesPage() {
  return (
    <>
      <Delights headingLevel={1} showLink={false} />
      <Why />
      <PageMotion />
    </>
  );
}
