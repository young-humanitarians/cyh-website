// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';

/** Deployment sub-path on GitHub Pages. Every internal URL is built from this. */
const BASE = '/cyh-website';

/**
 * Keystatic runs in local mode: it reads and writes the Markdown/YAML files in
 * `src/content/` straight from disk. That only makes sense while the dev server
 * is running, and its admin routes need SSR — which would break the fully static
 * production build. So the integration is loaded for `astro dev` only, and
 * `npm run build` always produces a plain static site.
 */
const isDev = process.argv.includes('dev');

const keystaticIntegrations = isDev
  ? await Promise.all([
      import('@astrojs/react').then((m) => m.default()),
      import('@keystatic/astro').then((m) => withBaseAwareApiRoute(m.default())),
    ])
  : [];

/** Route pattern Keystatic's integration mounts its API handler on. */
const KEYSTATIC_API_PATTERN = '/api/keystatic/[...params]';

/**
 * Keystatic does not know about Astro's `base`: its editor calls
 * `/api/keystatic/*` as an absolute path and its handler only recognises
 * request paths starting with `/api/keystatic/`. Served under a base sub-path,
 * every one of those calls answers 404 and the editor shows no content at all.
 * So drop that one injected route and mount our own wrapper instead, which
 * takes the base off the request before Keystatic looks at it.
 *
 * @param {import('astro').AstroIntegration} integration
 * @returns {import('astro').AstroIntegration}
 */
function withBaseAwareApiRoute(integration) {
  const setup = integration.hooks['astro:config:setup'];
  if (!setup) return integration;

  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      'astro:config:setup': async (options) => {
        await setup({
          ...options,
          injectRoute: (route) => {
            if (route.pattern !== KEYSTATIC_API_PATTERN) options.injectRoute(route);
          },
        });
        options.injectRoute({
          entrypoint: new URL('./src/keystatic/api-route.ts', options.config.root),
          pattern: KEYSTATIC_API_PATTERN,
          prerender: false,
        });
      },
    },
  };
}

export default defineConfig({
  site: 'https://young-humanitarians.github.io',
  base: BASE,
  output: 'static',
  // 'ignore' so both /about-us and /about-us/ resolve. Links are still written
  // with a trailing slash (see src/lib/urls.ts), which is what GitHub Pages
  // serves directly; requiring it would also 404 the /keystatic editor in dev.
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [mdx(), ...keystaticIntegrations],
  fonts: [
    {
      // Body face carried over from the current site.
      provider: fontProviders.google(),
      name: 'Poppins',
      cssVariable: '--font-body',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      // Stand-in for the current site's headline face (Adobe "acumin-pro",
      // which is licensed per-domain and cannot be self-hosted here).
      provider: fontProviders.google(),
      name: 'Archivo',
      cssVariable: '--font-heading',
      weights: [500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
  ],
});
