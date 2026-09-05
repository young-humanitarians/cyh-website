import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

export default defineConfig({
  root: '/workspaces/cyh-website',
  base: '/',
  output: 'static',
  integrations: [mdx(), react(), keystatic()],
  server: { port: 4330 },
});
