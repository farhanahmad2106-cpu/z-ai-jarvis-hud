const isExportMode = process.env.EXPORT_MODE === 'true';

const nextConfig = {
  // Standard deployment for Vercel. 
  ...(isExportMode ? { output: 'export' } : {}),
  
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Only disable optimization for Capacitor/Android export builds
    // On Vercel, Next.js image optimization (WebP, resizing, lazy) kicks in automatically
    unoptimized: isExportMode,
  },
  // Ensure the root path maps correctly
  trailingSlash: false,
};

export default nextConfig;


