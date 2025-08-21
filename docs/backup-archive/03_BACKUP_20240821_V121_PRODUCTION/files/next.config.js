const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_DATABASE_1: process.env.NOTION_DATABASE_1,
    NOTION_DATABASE_2: process.env.NOTION_DATABASE_2,
    NOTION_DATABASE_3: process.env.NOTION_DATABASE_3,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
  }
}

module.exports = nextConfig
