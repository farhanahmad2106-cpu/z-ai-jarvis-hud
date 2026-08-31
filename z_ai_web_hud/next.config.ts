const isExportMode = process.env.EXPORT_MODE === 'true';

const nextConfig = {
  // Standard deployment for Vercel. 
  ...(isExportMode ? { output: 'export' } : {}),
  
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure the root path maps correctly
  trailingSlash: false,
};

export default nextConfig;


