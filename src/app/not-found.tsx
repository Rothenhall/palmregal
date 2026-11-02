import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="phero" data-bg="dusk"><div className="wrap">
      <h1>This path leads <em>to the sea.</em></h1>
      <p className="lede" style={{ marginBottom: 30 }}>The page you were looking for isn&apos;t here.</p>
      <Link className="btn btn--teal" href="/">Back to Palm Regal</Link>
    </div></section>
  );
}
