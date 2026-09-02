import { getEntry } from 'astro:content';

/**
 * Navigation, footer and interface strings all live in one content entry so
 * volunteers can change them in Keystatic. Templates read them through this
 * helper rather than importing content directly.
 */
export async function getSiteSettings() {
  const entry = await getEntry('settings', 'site');
  if (!entry) {
    throw new Error(
      'Missing src/content/settings/site.yaml — navigation and footer come from there.',
    );
  }
  return entry.data;
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;
