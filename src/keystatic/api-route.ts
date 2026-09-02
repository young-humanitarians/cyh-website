import type { APIRoute } from 'astro';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import keystaticConfig from '../../keystatic.config';

/**
 * Keystatic's own API route, with the deployment base path taken off the
 * request first.
 *
 * The editor UI calls `/api/keystatic/tree` and `/api/keystatic/blob/…` as
 * absolute paths, and Keystatic's handler matches the request against
 * `^/api/keystatic/`. Called under `base` the handler would see
 * `/cyh-website/api/keystatic/tree`, match nothing and answer 404 — leaving the
 * editor with no collections and no entries in it. Stripping the base restores
 * the path Keystatic expects, whichever of the two the request came in on.
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
