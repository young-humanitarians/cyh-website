import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Every string that appears on the site is authored here, in src/content/, and
 * edited through Keystatic. Components only lay content out — they never carry
 * copy of their own. keystatic.config.ts mirrors these schemas field for field;
 * change one and you must change the other.
 */

/** A call-to-action button or text link. */
const link = z.object({
  label: z.string(),
  href: z.string(),
});

/** Picks which template renders a page entry. */
const template = z
  .enum([
    'home',
    'default',
    'team',
    'advisoryBoard',
    'events',
    'eventCategory',
    'impact',
    'nameList',
  ])
  .default('default');

const seo = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .optional();

/**
 * Editorial pages. The prose lives in the MDX body; the repeating, structured
 * parts of a page (stage lists, team descriptions, donation details …) are
 * separate fields so they can be laid out rather than hand-formatted.
 */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      template,
      seo,
      /** Optional lead-in above the body copy. */
      hero: z
        .object({
          eyebrow: z.string().optional(),
          heading: z.string().optional(),
          lead: z.string().optional(),
          image: image().optional(),
          /** Required whenever an image is set; describes it for screen readers. */
          imageAlt: z.string().optional(),
          actions: z.array(link).default([]),
        })
        .optional(),
      /** Teaser links to the CYH initiatives, reused on several pages. */
      initiativesHeading: z.string().optional(),
      initiatives: z
        .array(z.object({ text: z.string(), href: z.string() }))
        .default([]),
      /** Theory of Change: the challenge/response stages. */
      stagesHeading: z.string().optional(),
      stages: z
        .array(
          z.object({
            title: z.string(),
            challengeLabel: z.string(),
            challenge: z.string(),
            responseLabel: z.string(),
            response: z.string(),
          }),
        )
        .default([]),
      /** Get Involved: the volunteer teams and what they do. */
      teamsHeading: z.string().optional(),
      teams: z
        .array(
          z.object({
            name: z.string(),
            department: z.string().optional(),
            description: z.string(),
          }),
        )
        .default([]),
      /** Events index: the recurring event formats. */
      programmesHeading: z.string().optional(),
      programmes: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            href: z.string(),
          }),
        )
        .default([]),
      /** Support: donation details, as already published by CYH. */
      donation: z
        .object({
          heading: z.string(),
          methodLabel: z.string(),
          lines: z.array(
            z.object({ label: z.string().optional(), value: z.string() }),
          ),
        })
        .optional(),
      /** Impact: downloadable annual reports. */
      reportsHeading: z.string().optional(),
      reports: z.array(link).default([]),
      /** Alumni page: a plain list of names. */
      namesHeading: z.string().optional(),
      names: z.array(z.string()).default([]),
      /** Closing section rendered after the body. */
      outro: z
        .object({
          heading: z.string().optional(),
          text: z.string().optional(),
          actions: z.array(link).default([]),
        })
        .optional(),
      /** Which event category this page lists, for template "eventCategory". */
      eventCategory: z.enum(['enrichment', 'challenge', 'other']).optional(),
      /** Headings above the two news lists, for template "impact". */
      pressHeading: z.string().optional(),
      podcastHeading: z.string().optional(),
      order: z.number().default(0),
    }),
});

/** Press coverage, broadcasts and podcast appearances — the Impact page. */
const news = defineCollection({
  loader: glob({ base: './src/content/news', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    outlet: z.string().optional(),
    /** Free text as printed on the current site, e.g. "May 2025". */
    dateLabel: z.string(),
    /** Machine-readable date, used only for sorting. */
    date: z.coerce.date(),
    section: z.enum(['press', 'podcast']),
    links: z.array(link).default([]),
  }),
});

/** Upcoming events and the archive of past ones. */
const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['upcoming', 'enrichment', 'challenge', 'other']),
    /** Free text as printed on the current site, e.g. "5 September 2026". */
    dateLabel: z.string(),
    date: z.coerce.date(),
    details: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    note: z.string().optional(),
    registration: link.optional(),
  }),
});

/** Volunteers, grouped by the department they work in. */
const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      /** Must match one of the department names on the team page. */
      department: z.string(),
      credentials: z.string().optional(),
      quote: z.string().optional(),
      photo: image().optional(),
      order: z.number().default(0),
    }),
});

/** Advisory board members. */
const advisoryBoard = defineCollection({
  loader: glob({ base: './src/content/advisory-board', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      quote: z.string().optional(),
      photo: image().optional(),
      order: z.number().default(0),
    }),
});

/**
 * One entry per Young Humanitarian Summit. This is an addition to the four
 * collections asked for: the summits are the site's largest section (four
 * pages, each with its own speaker and workshop line-up) and they do not fit
 * `events`, whose entries are a title and a paragraph.
 */
const summits = defineCollection({
  loader: glob({ base: './src/content/summits', pattern: '**/*.mdx' }),
  schema: z.object({
    year: z.number(),
    title: z.string(),
    navLabel: z.string(),
    description: z.string(),
    speakersHeading: z.string().optional(),
    speakers: z
      .array(z.object({ name: z.string(), role: z.string().optional() }))
      .default([]),
    speakersNote: z.string().optional(),
    workshopsHeading: z.string().optional(),
    workshops: z
      .array(
        z.object({
          title: z.string(),
          organisation: z.string().optional(),
          format: z.string().optional(),
          description: z.string().optional(),
          link: link.optional(),
        }),
      )
      .default([]),
    /** Free-form closing sections: venue, charity concert, statistics … */
    sections: z
      .array(
        z.object({
          heading: z.string(),
          text: z.string().optional(),
          items: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    outro: z
      .object({
        text: z.string().optional(),
        actions: z.array(link).default([]),
      })
      .optional(),
  }),
});

/** Navigation, footer and the German interface strings. */
const settings = defineCollection({
  loader: glob({ base: './src/content/settings', pattern: '**/*.yaml' }),
  schema: z.object({
    siteName: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    logoAlt: z.string(),
    navigation: z.array(
      z.object({
        label: z.string(),
        href: z.string().optional(),
        children: z.array(link).default([]),
      }),
    ),
    social: z.array(
      z.object({
        platform: z.enum(['instagram', 'linkedin', 'spotify']),
        label: z.string(),
        href: z.string(),
      }),
    ),
    newsletter: z.object({
      heading: z.string(),
      description: z.string().optional(),
      emailLabel: z.string(),
      buttonLabel: z.string(),
      actionUrl: z.string(),
    }),
    footer: z.object({
      addressLines: z.array(z.string()),
      email: z.string(),
      legalLinks: z.array(link).default([]),
      copyright: z.string(),
    }),
    /** German interface strings — everything the templates say themselves. */
    ui: z.object({
      skipToContent: z.string(),
      openMenu: z.string(),
      closeMenu: z.string(),
      mainNavigation: z.string(),
      footerNavigation: z.string(),
      socialNavigation: z.string(),
      upcomingEvents: z.string(),
      pastEvents: z.string(),
      noUpcomingEvents: z.string(),
      backToOverview: z.string(),
      notFoundTitle: z.string(),
      notFoundText: z.string(),
      notFoundAction: z.string(),
      contentLanguageNote: z.string(),
    }),
  }),
});

export const collections = {
  pages,
  news,
  events,
  team,
  advisoryBoard,
  summits,
  settings,
};
