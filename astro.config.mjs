// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://estailes.ch',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  compressHTML: true,
  integrations: [
    sitemap({
      // Les pages utilitaires n'ont pas leur place dans l'index des moteurs.
      filter: (page) => !['/merci', '/admin'].some((p) => page.includes(p)),
      i18n: undefined,
    }),
  ],
});
