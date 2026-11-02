"use client";

import Image from "next/image";
import { useState } from "react";
import { site } from "@/content/site";
import { Play } from "../icons";
import { Tbc } from "../Tbc";

function youtubeId(url: string) {
  return url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/)?.[1] ?? null;
}

/** Tour video. Loads the YouTube player only after a click; shows a TBC tag until the link arrives. */
export function Tour() {
  const [open, setOpen] = useState(false);
  const id = site.youtubeTour ? youtubeId(site.youtubeTour) : null;

  return (
    <div className="tour" data-gl="photo" data-depth="-90">
      {open && id ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title="Palm Regal tour video"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, zIndex: 5 }}
        />
      ) : (
        <>
          <Image src="/images/amphitheatre.webp" alt="Palm Regal lawns and amphitheatre" fill sizes="(max-width: 1200px) 92vw, 1200px" />
          <div className="tour-copy">
            <p className="eyebrow">Take a tour</p>
            <h3>See it before you <em>arrive.</em></h3>
            {!id && <Tbc>YouTube link to come</Tbc>}
          </div>
          <button className="play" type="button" aria-label="Play the Palm Regal tour video" disabled={!id} onClick={() => setOpen(true)}>
            <span><Play />Play tour</span>
          </button>
        </>
      )}
    </div>
  );
}
