import { getCollection, type CollectionEntry } from 'astro:content';

/** Events the current site lists under "Upcoming Events", newest date first. */
export async function upcomingEvents(): Promise<CollectionEntry<'events'>[]> {
  const events = await getCollection('events', ({ data }) => data.category === 'upcoming');
  return events.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

/** The archive for one of the recurring event formats, most recent first. */
export async function eventsByCategory(
  category: 'enrichment' | 'challenge' | 'other',
): Promise<CollectionEntry<'events'>[]> {
  const events = await getCollection('events', ({ data }) => data.category === category);
  return events.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
