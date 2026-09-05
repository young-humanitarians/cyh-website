// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';

/**
 * Where the site is deployed. Every internal URL is built from these. The
 * defaults are the GitHub Pages production deployment, which serves the site
 * under a sub-path; the Azure Static Web Apps preview overrides both in its
 * workflow because it serves from the domain root.
 */
const BASE = process.env.ASTRO_BASE ?? '/cyh-website';
const SITE = process.env.ASTRO_SITE ?? 'https://young-humanitarians.github.io';

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
      import('@keystatic/astro').then((m) => withBaseAwareRoutes(m.default())),
    ])
  : [];

/**
 * The routes Keystatic's integration injects, mapped to the replacements we
 * mount instead. Both of its own routes assume the site sits at the domain
 * root; see the two files for what each one has to put right.
 */
const KEYSTATIC_ROUTE_OVERRIDES = {
  '/keystatic/[...params]': './src/keystatic/page.astro',
  '/api/keystatic/[...params]': './src/keystatic/api-route.ts',
};

/** Requests Keystatic makes at the site root: the editor and its API. */
const KEYSTATIC_ROOT_REQUEST = /^\/(api\/)?keystatic(\/|\?|$)/;

/**
 * Serves Keystatic's routes at the site root as well as under `base`.
 *
 * Astro's dev server only answers base-prefixed URLs — `/keystatic` 404s for a
 * browser exactly as `/about-us` does — but Keystatic's client-side router only
 * understands the root path. Rewriting the request before Astro's own
 * middleware sees it satisfies both: the browser stays on the URL the editor's
 * router can read, while Astro resolves the route it knows about.
 *
 * @type {import('vite').Plugin}
 */
const keystaticRootRewrite = {
  name: 'keystatic-root-rewrite',
  enforce: 'pre',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && KEYSTATIC_ROOT_REQUEST.test(req.url)) req.url = BASE + req.url;
      next();
    });
  },
};

/**
 * Keystatic does not know about Astro's `base`. Its editor is a client-side
 * app that expects to live at /keystatic, and it calls /api/keystatic/* as an
 * absolute path, while the matching handler only recognises request paths
 * starting with /api/keystatic/. Served under a base sub-path, the editor
 * shows nothing at all. So drop the routes it injects, mount our own
 * base-aware versions in their place, and serve them at the root too.
 *
 * @param {import('astro').AstroIntegration} integration
 * @returns {import('astro').AstroIntegration}
 */
function withBaseAwareRoutes(integration) {
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
            if (!(route.pattern in KEYSTATIC_ROUTE_OVERRIDES)) options.injectRoute(route);
          },
        });
        for (const [pattern, entrypoint] of Object.entries(KEYSTATIC_ROUTE_OVERRIDES)) {
          options.injectRoute({
            entrypoint: new URL(entrypoint, options.config.root),
            pattern,
            prerender: false,
          });
        }
      },
    },
  };
}

export default defineConfig({
  site: SITE,
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
