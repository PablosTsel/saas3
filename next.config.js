/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure templates in the public directory are included in the build
  output: 'standalone',
  // Copy additional files that are needed during deployment
  outputFileTracingIncludes: {
    '/**': ['templates/**/*', 'public/templates/**/*']
  }
}

module.exports = nextConfig 