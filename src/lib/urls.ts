/**
 * The site is served from a sub-path on GitHub Pages
 * (https://young-humanitarians.github.io/cyh-website/), so no internal href may
 * be written as a bare root-relative path. Every link in a template goes
 * through `href()`, which prefixes `base` and leaves external links alone.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

export function isExternal(target: string): boolean {
  return EXTERNAL.test(target);
}

/** Turn a content-authored path into a URL that respects the deployment base. */
export function href(target: string): string {
  if (!target) return `${BASE}/`;
  if (isExternal(target)) return target;

  const [pathPart, rest = ''] = splitSuffix(target);
  const clean = pathPart.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return `${BASE}/${rest}`;

  // Files keep their extension; pages get a trailing slash to match
  // `trailingSlash: 'always'`.
  const isFile = /\.[a-z0-9]+$/i.test(clean);
  return `${BASE}/${clean}${isFile ? '' : '/'}${rest}`;
}

/** Split a `?query#hash` suffix off a path so it survives normalisation. */
function splitSuffix(target: string): [string, string] {
  const match = target.match(/^([^?#]*)(.*)$/);
  return match ? [match[1] ?? '', match[2] ?? ''] : [target, ''];
}

/** True when `current` is `target` or sits below it — used to mark nav items. */
export function isCurrent(current: string, target: string): boolean {
  if (isExternal(target)) return false;
  const a = normalise(current);
  const b = normalise(target);
  if (b === '/') return a === '/';
  return a === b || a.startsWith(`${b}/`);
}

function normalise(path: string): string {
  const withoutBase = BASE && path.startsWith(BASE) ? path.slice(BASE.length) : path;
  const trimmed = withoutBase.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}
