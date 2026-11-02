import Image from "next/image";
import { PalmShade } from "../PalmShade";

export function About() {
  return (
    <section className="sec" id="about" aria-labelledby="about-h">
      <PalmShade />
      <div className="wrap">
        <p className="statement" data-statement>
          Serviced suites with their own living room, kitchenette and balcony, set among <em>palms and lawns,</em> five minutes&apos; walk from Gopalpur beach. And your pets are welcome too.
        </p>
        <div className="about">
          <div>
            <div className="dict">
              <b>Gopalpur</b>
              <span>[go·pal·pur] <i>noun.</i> A quiet beach town on the Bay of Bengal, about 25 minutes from Berhampur.</span>
            </div>
            <p className="eyebrow">About Palm Regal</p>
            <h2 id="about-h" data-split>
              A home by the sea, <em>wrapped in green.</em>
            </h2>
            <p className="lede">Palm Regal is a resort homestay of serviced suites in Gopalpur on Sea, Odisha. Room to live, cook and slow down, with the Bay of Bengal a short walk away.</p>
            <div className="chips">
              {["Pet friendly", "5 min walk to the beach", "Doctor on call", "EV charging on request"].map((c) => <span key={c} className="chip">{c}</span>)}
            </div>
          </div>
          <div className="about-media">
            <div className="img main" data-gl="photo" data-depth="-150">
              <Image src="/images/exterior-1.webp" alt="Palm Regal building with landscaped lawns and palms" fill sizes="(max-width: 900px) 90vw, 560px" />
            </div>
            <div className="img small" data-gl="photo" data-depth="80">
              <Image src="/images/pet-friendly.webp" alt="A dog on the garden lawn at Palm Regal" fill sizes="(max-width: 900px) 40vw, 260px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
