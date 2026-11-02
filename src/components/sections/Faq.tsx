import Link from "next/link";
import { faqs } from "@/content/faq";
import { whatsappHref } from "@/content/site";
import { WhatsApp } from "../icons";
import { PalmShade } from "../PalmShade";
import { Tbc } from "../Tbc";

export function Faq() {
  return (
    <section className="sec" id="faq" aria-labelledby="faq-h">
      <PalmShade side="left" />
      <div className="wrap faq-grid">
        <div className="faq-side">
          <p className="eyebrow">Good to know</p>
          <h2 id="faq-h" data-split>Questions guests <em>often ask.</em></h2>
          <Link className="btn btn--teal" href={whatsappHref("Hello Palm Regal, I have a question about staying with you.")}><WhatsApp />Ask us on WhatsApp</Link>
        </div>
        <div className="faq">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}<i aria-hidden /></summary>
              <div className="a">
                {f.a.map((p, j) => (
                  <p key={j}>{p}{f.tbc && j === f.a.length - 1 && <> <Tbc>{f.tbc}</Tbc></>}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
