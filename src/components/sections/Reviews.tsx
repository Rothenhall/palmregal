// Placeholders until the free Google Places sync is set up (decision in docs/README.md).
const placeholders = [5, 5, 4];

export function Reviews() {
  return (
    <section className="sec reviews-sec" id="reviews" aria-labelledby="rev-h">
      <div className="wrap">
        <div className="head center">
          <p className="eyebrow">Google reviews</p>
          <h2 id="rev-h" data-split>What our guests <em>tell Google.</em></h2>
          <p className="lede">Placeholders. The live site will show three recent four and five star reviews from Google.</p>
        </div>
        <div className="rev-grid">
          <div className="rating">
            <span className="eyebrow">Google rating</span>
            <div><b>4.x</b><div className="stars" aria-label="Rating shown live">★★★★★</div></div>
            <span className="btn btn--line" aria-disabled>See all reviews on Google</span>
          </div>
          {placeholders.map((n, i) => (
            <article className="review" key={i}>
              <div className="stars" aria-label={`${n} out of 5 stars`}>{"★".repeat(n) + "☆".repeat(5 - n)}</div>
              <blockquote>A guest&apos;s review appears here, word for word, from Google.</blockquote>
              <footer><i>G</i><span>Guest name · date</span></footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
