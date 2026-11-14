'use client';

/* Previous / next for the scrolling row of testimonials. The row itself is plain CSS scroll-snap; these only nudge it. */
export function TestimonialNav({ target }: { target: string }) {
  const go = (dir: 1 | -1) => {
    const el = document.getElementById(target);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <div className="tm-nav">
      <button type="button" onClick={() => go(-1)} aria-label="Previous reviews" aria-controls={target}><span aria-hidden="true">&larr;</span></button>
      <button type="button" onClick={() => go(1)} aria-label="Next reviews" aria-controls={target}><span aria-hidden="true">&rarr;</span></button>
    </div>
  );
}
