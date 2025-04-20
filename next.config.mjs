/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true, // abaikan error TypeScript saat build
      },
      eslint: {
        ignoreDuringBuilds: true, // abaikan error ESLint saat build
      },
};

export default nextConfig;
