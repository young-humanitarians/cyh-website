import { getCollection } from 'astro:content';

export interface GlossaryEntry {
  term: string;
  summary?: string | undefined;
  body: string[];
}

/*
 * Loaded once, at module evaluation, so that `inline()` can stay synchronous.
 * It is called from a dozen templates and from inside `.map()` callbacks;
 * threading an async lookup through all of them to save one top-level await
 * would be the worse trade.
 */
const entries = await getCollection('glossary');

/** Keyed by file name, which is what `term:` targets in content refer to. */
export const GLOSSARY: ReadonlyMap<string, GlossaryEntry> = new Map(
  entries.map((entry) => [entry.id, entry.data]),
);
