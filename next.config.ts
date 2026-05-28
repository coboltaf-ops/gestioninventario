import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force rebuild timestamp: 2026-05-27T23:30:00Z
}

export default withNextIntl(nextConfig)
