import type { APIRoute } from 'astro';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import keystaticConfig from '../../keystatic.config';

/**
 * Keystatic's own API route, with the deployment base path taken off the
 * request first.
 *
 * The editor UI calls `/api/keystatic/tree` and `/api/keystatic/blob/…` as
 * absolute paths, and Keystatic's handler matches the request against
 * `^/api/keystatic/`. The dev server serves this site under `base`, so the
 * handler sees `/cyh-website/api/keystatic/tree`, matches nothing and answers
 * 404 — which leaves the editor rendering its shell with no collections and no
 * entries in it. Stripping the base restores the path Keystatic expects.
 *
 * Only ever mounted by `astro dev` (see astro.config.mjs); local mode has
 * nothing to do in a static build.
 */

export const prerender = false;

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

const handler = makeGenericAPIRouteHandler({ config: keystaticConfig });

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  if (BASE && url.pathname.startsWith(`${BASE}/`)) {
    url.pathname = url.pathname.slice(BASE.length);
  }

  const { body, headers, status } = await handler(new Request(url, request));
  // Keystatic types the body as `Uint8Array<ArrayBufferLike>`, which `BodyInit`
  // does not name even though every runtime accepts it.
  return new Response(body as BodyInit | null, {
    status,
    headers,
  });
};
