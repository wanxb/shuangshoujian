import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const site = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  devToolbar: { enabled: false },
  integrations: [react(), sitemap()],
  output: 'static',
  vite: {
    server: {
      fs: {
        deny: ['docs/IMG_4455.MP4', 'docs/references/**'],
      },
    },
  },
});
