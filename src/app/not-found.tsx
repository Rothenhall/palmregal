import Link from "next/link";
import { PageMotion } from "@/components/Motion";

export default function NotFound() {
  return (
    <>
      <section className="sec page-top" aria-labelledby="nf-h">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Page not found</p>
            <h1 id="nf-h">This path leads <em>off the lawn.</em></h1>
            <p className="lede">The page you were looking for isn&apos;t here.</p>
          </div>
          <div className="suite-acts">
            <Link className="btn btn--teal" href="/">Back to Palm Regal</Link>
            <Link className="tlink" href="/suites">See the suites</Link>
          </div>
        </div>
      </section>
      <PageMotion />
    </>
  );
}
