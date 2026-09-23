import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * A section as stored on disk: `{ discriminant, value }`, which is what
 * Keystatic's conditional field reads and writes.
 */
export type StoredSection = CollectionEntry<'pages'>['data']['sections'][number];

/**
 * The same section as components see it: `{ type, ...value }`. Distributing
 * over the union keeps each block's fields tied to its own type, so
 * `Block<'cards'>` still knows about `variant` and nothing else does.
 */
export type PageSection = StoredSection extends infer S
  ? S extends { discriminant: infer D; value: infer V }
    ? { type: D } & V
    : never
  : never;

export type BlockType = PageSection['type'];

/** Narrow a section to one block type, for the components that render it. */
export type Block<T extends BlockType> = Extract<PageSection, { type: T }>;

export type Action = Block<'text'>['actions'][number];

/** Stored shape → component shape. */
export function flattenSections(sections: readonly StoredSection[]): PageSection[] {
  return sections.map(
    (section) => ({ type: section.discriminant, ...section.value }) as PageSection,
  );
}

/**
 * Sorts by the entry's `order` field, falling back to a stable string.
 * Generic over the whole entry so callers keep the full CollectionEntry type
 * — narrowing to `{ data, id }` here would strip `collection` downstream.
 */
function byOrderThen<E extends { data: { order: number } }>(
  entries: E[],
  tiebreak: (entry: E) => string,
): E[] {
  return [...entries].sort(
    (a, b) => a.data.order - b.data.order || tiebreak(a).localeCompare(tiebreak(b)),
  );
}

export async function getTeam() {
  const team = await getCollection('team');
  return byOrderThen(team, (entry) => entry.data.name);
}

export async function getAdvisoryBoard() {
  const board = await getCollection('advisoryBoard');
  return byOrderThen(board, (entry) => entry.data.name);
}

export async function getInitiatives() {
  const initiatives = await getCollection('initiatives');
  return byOrderThen(initiatives, (entry) => entry.data.title);
}

export async function getImpactStories() {
  const stories = await getCollection('impactStories', ({ data }) => !data.draft);
  return byOrderThen(stories, (entry) => entry.data.title);
}

export async function getPartners(category?: 'founding' | 'strategic' | 'summit' | 'general') {
  const partners = await getCollection(
    'partners',
    category ? ({ data }) => data.category === category : undefined,
  );
  return byOrderThen(partners, (entry) => entry.data.name);
}

export async function getReports() {
  const reports = await getCollection('reports');
  return [...reports].sort((a, b) => b.data.year - a.data.year);
}

export async function getSummits() {
  const summits = await getCollection('summits');
  return [...summits].sort((a, b) => b.data.year - a.data.year);
}

export async function getNews(section: 'press' | 'podcast') {
  const news = await getCollection('news', ({ data }) => data.section === section);
  return [...news].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * The organigram's shape: departments, each with its directors, its teams and
 * the people in them. Derived from the `team` collection rather than authored
 * twice, so the chart cannot drift from the profiles.
 */
export interface OrgMember {
  id: string;
  name: string;
  role: string;
  note?: string | undefined;
  level: 'board' | 'director' | 'head' | 'member';
  photo?: CollectionEntry<'team'>['data']['photo'];
}

export interface OrgTeam {
  name: string;
  members: OrgMember[];
}

export interface OrgDepartment {
  name: string;
  directors: OrgMember[];
  teams: OrgTeam[];
  /** Members with no sub-team. */
  loose: OrgMember[];
}

export async function getOrganigram(): Promise<{
  board: OrgMember[];
  departments: OrgDepartment[];
}> {
  const team = await getTeam();

  const toMember = (entry: (typeof team)[number]): OrgMember => ({
    id: entry.id,
    name: entry.data.name,
    role: entry.data.role,
    note: entry.data.note,
    level: entry.data.level,
    photo: entry.data.photo,
  });

  const board = team.filter((e) => e.data.level === 'board').map(toMember);

  const departmentNames = [
    ...new Set(team.filter((e) => e.data.level !== 'board').map((e) => e.data.department)),
  ];

  const departments = departmentNames.map((name) => {
    const inDept = team.filter((e) => e.data.department === name && e.data.level !== 'board');
    const directors = inDept.filter((e) => e.data.level === 'director').map(toMember);
    const rest = inDept.filter((e) => e.data.level !== 'director');

    const teamNames = [...new Set(rest.map((e) => e.data.team).filter(Boolean))] as string[];
    const teams: OrgTeam[] = teamNames.map((teamName) => ({
      name: teamName,
      members: rest.filter((e) => e.data.team === teamName).map(toMember),
    }));

    return {
      name,
      directors,
      teams,
      loose: rest.filter((e) => !e.data.team).map(toMember),
    };
  });

  return { board, departments };
}

/** Every distinct country a team member comes from. */
export async function getMemberCountries(): Promise<string[]> {
  const team = await getCollection('team');
  return [...new Set(team.map((e) => e.data.country).filter(Boolean) as string[])].sort((a, b) =>
    a.localeCompare(b),
  );
}
