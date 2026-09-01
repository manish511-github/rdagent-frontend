/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep local browser-QA/dev artifacts away from the production build.
  // Running `next dev` against `.next` while `next start` is serving it can
  // remove hashed production assets and leave the deployed HTML unusable.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
