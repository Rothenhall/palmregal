import { comforts } from "@/content/delights";
import { ComfortIcon } from "../icons";
import { PalmShade } from "../PalmShade";

export function Why() {
  return (
    <section className="sec" aria-labelledby="why-h">
      <PalmShade side="left" />
      <div className="wrap">
        <div className="head center">
          <p className="eyebrow">Why stay with us</p>
          <h2 id="why-h" data-split>All the comforts <em>of home.</em></h2>
        </div>
        <div className="why" data-reveal>
          {comforts.map((c) => (
            <div key={c}><ComfortIcon name={c} /><span>{c}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
