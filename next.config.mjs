/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Lets unmatched URLs render the branded 404 while the site and /admin keep separate root layouts.
  experimental: { globalNotFound: true },
  // The Edit site editor (Tina) is a built single page in public/admin/editor; serve its index at /admin/editor/.
  // src/middleware.ts guards /admin/*, so it is behind the admin sign-in like everything else there.
  async rewrites() {
    return {
      afterFiles: [{ source: '/admin/editor', destination: '/admin/editor/index.html' }],
      // A photo uploaded in the editor is a GitHub commit and is not in public/img until Vercel redeploys. Only when no real
      // file matches does /img/* fall through to this admin-only proxy (visitors get a plain 404; signed-out callers always get 404), so the editor shows new photos at once.
      fallback: [{ source: '/img/:path*', destination: '/api/tina/media/preview/:path*' }],
    };
  },
};
export default nextConfig;
