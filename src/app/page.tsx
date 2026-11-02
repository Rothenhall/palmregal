import { About } from "@/components/sections/About";
import { BookingBar } from "@/components/sections/BookingBar";
import { Contact } from "@/components/sections/Contact";
import { Delights } from "@/components/sections/Delights";
import { Faq } from "@/components/sections/Faq";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { Reviews } from "@/components/sections/Reviews";
import { Suites } from "@/components/sections/Suites";
import { Why } from "@/components/sections/Why";
import { PageMotion } from "@/components/Motion";

export default function Home() {
  return (
    <>
      <Hero />
      <BookingBar />
      <About />
      <Suites />
      <Delights />
      <Why />
      <Gallery />
      <Location />
      <Reviews />
      <Faq />
      <Contact />
      <PageMotion />
    </>
  );
}
