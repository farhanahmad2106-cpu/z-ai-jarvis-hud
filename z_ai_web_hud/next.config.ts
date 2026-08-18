const nextConfig = {
  // Standard deployment for Vercel. 
  
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


