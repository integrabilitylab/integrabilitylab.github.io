// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://integrabilitylab.github.io',
  trailingSlash: 'always',
  // Preserve the site's existing spaces between inline elements on Astro 7.
  compressHTML: true,
  integrations: [sitemap({ filter: (page) => !page.endsWith('/events/') })],
});
