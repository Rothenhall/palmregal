import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/icons";
import { SuiteRow } from "@/components/sections/SuiteRow";
import { Why } from "@/components/sections/Why";
import { getSuite, suites } from "@/content/suites";
import { PageMotion } from "@/components/Motion";

export function generateStaticParams() {
  return suites.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/suites/[slug]">): Promise<Metadata> {
  const suite = getSuite((await params).slug);
  if (!suite) return {};
  return { title: suite.name, description: suite.summary, openGraph: { images: [suite.photos[0].src] } };
}

export default async function SuitePage({ params }: PageProps<"/suites/[slug]">) {
  const suite = getSuite((await params).slug);
  if (!suite) notFound();
  const others = suites.filter((s) => s.slug !== suite.slug);

  return (
    <>
      <section className="sec page-top suites" aria-label={suite.name}>
        <div className="wrap">
          <Link className="tlink" href="/suites" style={{ marginBottom: 24, display: "inline-flex" }}>All suites</Link>
          <div className="suite-list"><SuiteRow suite={suite} headingLevel={1} linkToPage={false} /></div>
          {suite.photos.length > 1 && (
            <div className="grid-gallery" style={{ marginTop: 40 }}>
              {suite.photos.map((p) => (
                <figure key={p.src}>
                  <div className="img" data-gl="photo"><Image src={p.src} alt={p.alt} fill sizes="(max-width: 900px) 92vw, 33vw" /></div>
                  <figcaption>{p.alt}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
      <Why />
      <section className="sec" aria-labelledby="more-h">
        <div className="wrap">
          <div className="head"><p className="eyebrow">More suites</p><h2 id="more-h">Other ways <em>to stay.</em></h2></div>
          <div className="near">
            {others.map((s) => (
              <div key={s.slug}><Link className="tlink" href={`/suites/${s.slug}`}>{s.name} <Arrow width={16} height={16} /></Link><b>{s.guests ? `${s.guests} guests` : "Details to come"}</b></div>
            ))}
          </div>
        </div>
      </section>
      <PageMotion />
    </>
  );
}
