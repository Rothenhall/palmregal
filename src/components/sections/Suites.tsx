import Link from "next/link";
import { suites } from "@/content/suites";
import { Arrow } from "../icons";
import { SuiteRow } from "./SuiteRow";

export function Suites() {
  return (
    <section className="sec suites" id="suites" aria-labelledby="suites-h">
      <div className="wrap">
        <div className="head head-row">
          <div className="head" style={{ margin: 0 }}>
            <p className="eyebrow">Our suites</p>
            <h2 id="suites-h" data-split>Room to live, <em>not just sleep.</em></h2>
          </div>
          <Link className="tlink" href="/suites">See all suites <Arrow width={16} height={16} /></Link>
        </div>
        <div className="suite-list">
          {suites.map((s) => <SuiteRow key={s.slug} suite={s} />)}
        </div>
      </div>
    </section>
  );
}
