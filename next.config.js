/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'out',
    images: {
        unoptimized: true
    },
    trailingSlash: true,
    // Disable server-side features for Electron
    experimental: {
        // appDir: true // Deprecated in recent versions
    }
};

module.exports = nextConfig;
