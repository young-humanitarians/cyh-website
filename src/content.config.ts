import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Every string that appears on the site is authored here, in src/content/, and
 * edited through Keystatic. Components only lay content out — they never carry
 * copy of their own. keystatic.config.ts mirrors these schemas field for field;
 * change one and you must change the other.
 *
 * Pages are composed from an ordered list of blocks (see `sections` below)
 * rather than from a fixed template. The 2026 revamp asks for too many
 * one-off arrangements — flip cards, a world map, layered circles, an
 * organigram — for a per-template field list to stay honest.
 */

/**
 * An optional string that treats "" as absent.
 *
 * Keystatic writes every field it knows about, including the ones an editor
 * left blank, so without this an untouched "Anchor" field would render as
 * `id=""` and an untouched heading as an empty <h2>. Used for every optional
 * string in this file.
 */
const optionalText = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
);

/** A call-to-action button or text link. */
const link = z.object({
  label: z.string(),
  href: z.string(),
});

/** Which button tier a call to action renders as. See docs/design-rules.md §6. */
const actionTier = z.enum(['primary', 'secondary', 'tertiary']).default('primary');

const action = z.object({
  label: z.string(),
  href: z.string(),
  tier: actionTier,
});

/**
 * Section colour theme. Only `white` and `black` are in use on the live site;
 * `bright` exists so a deliberate red band is possible without a code change.
 */
const theme = z.enum(['white', 'black', 'bright']).default('white');

/** Fields every block shares. */
const blockBase = {
  theme,
  /** Anchor target, so navigation and in-page links can point at a section. */
  anchor: optionalText,
  heading: optionalText,
  /** Short lead-in under the heading. Inline markdown is allowed. */
  intro: optionalText,
  /**
   * Shown in place of the block's content while that content is still
   * missing — a report PDF, a partner logo, a video URL. Marked visibly as
   * unfinished so nothing incomplete can pass for finished copy.
   */
  placeholder: optionalText,
};

const seo = z
  .object({
    title: optionalText,
    description: optionalText,
  })
  .optional();

/**
 * Body copy in blocks is an array of paragraphs carrying a restricted inline
 * markdown subset (**bold**, *italic*, [text](href)) rendered by
 * src/lib/inline.ts. Block-level markdown stays in the MDX body.
 */
const paragraphs = z.array(z.string()).default([]);

/**
 * One page section.
 *
 * Stored as `{ discriminant, value }` because that is the shape Keystatic's
 * conditional field reads and writes — keeping the two in the same shape is
 * what lets a volunteer edit a section in the UI without the file drifting
 * from the schema. Components receive the flattened `{ type, ...value }` form
 * via flattenSections() in src/lib/blocks.ts.
 */
const block = ({ image }: SchemaContext) =>
  z.discriminatedUnion('discriminant', [
    /** Running copy, optionally as a large standalone statement. */
    z.object({
      discriminant: z.literal('text'),
      value: z.object({
        ...blockBase,
        variant: z.enum(['default', 'statement', 'lead', 'columns']).default('default'),
        body: paragraphs,
        items: z.array(z.string()).default([]),
        actions: z.array(action).default([]),
      }),
    }),

    /**
     * A term the reader can open for a definition — "Zuversicht",
     * "humanitarian culture". Renders as a native <details>, so it works
     * without JavaScript and is announced correctly by screen readers.
     */
    z.object({
      discriminant: z.literal('explainer'),
      value: z.object({
        ...blockBase,
        term: z.string(),
        summary: z.string(),
        body: paragraphs,
      }),
    }),

    /**
     * A grid of cards. `variant` picks the presentation:
     *   plain    — a plain card
     *   flip     — reveals `back` on hover and on focus
     *   numbered — an ordered sequence of steps
     *   bubbles  — circular, for three-up conceptual splits
     *   layers   — stacked/nested, for Values / Practices / Institutions
     */
    z.object({
      discriminant: z.literal('cards'),
      value: z.object({
        ...blockBase,
        variant: z.enum(['plain', 'flip', 'numbered', 'bubbles', 'layers']).default('plain'),
        items: z
          .array(
            z.object({
              title: z.string(),
              subtitle: optionalText,
              text: optionalText,
              /** Shown on the reverse of a flip card. */
              back: optionalText,
              href: optionalText,
            }),
          )
          .default([]),
        actions: z.array(action).default([]),
      }),
    }),

    /** Impact numbers. */
    z.object({
      discriminant: z.literal('stats'),
      value: z.object({
        ...blockBase,
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .default([]),
        actions: z.array(action).default([]),
      }),
    }),

    /** Sourced evidence, with the source as a link rather than a bracket. */
    z.object({
      discriminant: z.literal('evidence'),
      value: z.object({
        ...blockBase,
        items: z
          .array(
            z.object({
              text: z.string(),
              source: z.string(),
              href: optionalText,
            }),
          )
          .default([]),
      }),
    }),

    /** Partner logos, pulled from the `partners` collection by category. */
    z.object({
      discriminant: z.literal('logos'),
      value: z.object({
        ...blockBase,
        category: z.enum(['founding', 'strategic', 'summit', 'general']).optional(),
        actions: z.array(action).default([]),
      }),
    }),

    /** Embedded video. `embedUrl` must be a privacy-mode embed URL. */
    z.object({
      discriminant: z.literal('videos'),
      value: z.object({
        ...blockBase,
        items: z
          .array(
            z.object({
              title: z.string(),
              text: optionalText,
              embedUrl: z.string(),
            }),
          )
          .default([]),
      }),
    }),

    /** Photography. */
    z.object({
      discriminant: z.literal('gallery'),
      value: z.object({
        ...blockBase,
        items: z
          .array(
            z.object({
              image: image(),
              alt: z.string(),
              caption: optionalText,
            }),
          )
          .default([]),
      }),
    }),

    /**
     * World map of the countries CYH members come from, built at build time
     * from the `country` field on team entries. No client-side map library.
     */
    z.object({
      discriminant: z.literal('map'),
      value: z.object({
        ...blockBase,
        note: optionalText,
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .default([]),
      }),
    }),

    /** The CYH organigram: departments, teams, people. */
    z.object({
      discriminant: z.literal('organigram'),
      value: z.object({
        ...blockBase,
        note: optionalText,
      }),
    }),

    /** Lists entries from another collection. */
    z.object({
      discriminant: z.literal('collection'),
      value: z.object({
        ...blockBase,
        source: z.enum([
          'events-upcoming',
          'events-past',
          'events-category',
          'team',
          'advisory-board',
          'press',
          'podcast',
          'summits',
          'impact-stories',
          'reports',
          'initiatives',
        ]),
        /** Only for source "events-category". */
        category: z.enum(['enrichment', 'challenge', 'other']).optional(),
        /** Cap the number shown; 0 means all. */
        limit: z.number().default(0),
        actions: z.array(action).default([]),
      }),
    }),

    /** Ways to give. */
    z.object({
      discriminant: z.literal('donation'),
      value: z.object({
        ...blockBase,
        methods: z
          .array(
            z.object({
              title: z.string(),
              text: optionalText,
              details: z
                .array(z.object({ label: optionalText, value: z.string() }))
                .default([]),
              action: link.optional(),
            }),
          )
          .default([]),
      }),
    }),

    /** A closing call to action, usually on a black band. */
    z.object({
      discriminant: z.literal('cta'),
      value: z.object({
        ...blockBase,
        body: paragraphs,
        actions: z.array(action).default([]),
      }),
    }),
  ]);

/** Editorial pages. Prose lives in the MDX body; structure lives in `sections`. */
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      /** `home` gets its own route; everything else renders at /<id>. */
      template: z.enum(['home', 'default']).default('default'),
      seo,
      /** Hides the page from the build. Used for unfinished revamp pages. */
      draft: z.boolean().default(false),
      hero: z
        .object({
          eyebrow: optionalText,
          heading: optionalText,
          lead: optionalText,
          image: image().optional(),
          /** Required whenever an image is set; describes it for screen readers. */
          imageAlt: optionalText,
          /**
           * Which part of the hero image stays visible. The banner is a slim
           * band across a tall photo, so most of the frame is cropped away;
           * this says what the band should be centred on. See PageHeader.astro.
           */
          focus: z
            .enum([
              'top',
              'upper',
              'upper-middle',
              'middle',
              'lower-middle',
              'lower',
              'bottom',
            ])
            .default('middle'),
          actions: z.array(action).default([]),
          /**
           * Optional attention strip laid across the hero image, repeating
           * its text as it scrolls. See docs/design-rules.md §10 — this is a
           * recorded exception to the no-marquee rule, carried over from the
           * live site. Leave `text` empty and no strip is rendered.
           */
          ticker: z
            .object({
              text: optionalText,
              href: optionalText,
            })
            .optional(),
          theme,
        })
        .optional(),
      /** Renders the MDX body. Omit to use `sections` only. */
      showBody: z.boolean().default(true),
      sections: z.array(block({ image })).default([]),
      order: z.number().default(0),
    }),
});

/** Press coverage, broadcasts and podcast appearances. */
const news = defineCollection({
  loader: glob({ base: './src/content/news', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    outlet: optionalText,
    /** Free text as printed, e.g. "May 2025". */
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
    /** Free text as printed, e.g. "5 September 2026". */
    dateLabel: z.string(),
    date: z.coerce.date(),
    location: optionalText,
    details: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    note: optionalText,
    registration: link.optional(),
  }),
});

/** Volunteers. `level` and `team` drive the organigram; `country` the map. */
const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      /** Must match one of the department names on the team page. */
      department: z.string(),
      /** Sub-team within the department, if any. */
      team: optionalText,
      /** Position in the organigram. */
      level: z.enum(['board', 'director', 'head', 'member']).default('member'),
      credentials: optionalText,
      /** One-line personal note, shown when a role is opened. */
      note: optionalText,
      quote: optionalText,
      /**
       * Country the member comes from, spelled exactly as in
       * src/lib/countries.ts so the world map can fill the right shape.
       */
      country: optionalText,
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
      /** Shown under the name, e.g. the chair's term. */
      note: optionalText,
      quote: optionalText,
      photo: image().optional(),
      order: z.number().default(0),
    }),
});

/** Organisations CYH works with. */
const partners = defineCollection({
  loader: glob({ base: './src/content/partners', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /**
       * founding  — the ICRC
       * strategic — MSF
       * summit    — partners of the most recent Young Humanitarian Summit
       * general   — everyone else, across events, courses and CYH Labs
       */
      category: z.enum(['founding', 'strategic', 'summit', 'general']),
      href: optionalText,
      logo: image().optional(),
      order: z.number().default(0),
    }),
});

/** The CYH's formats. Drives the flip-card showcase and the Initiatives page. */
const initiatives = defineCollection({
  loader: glob({ base: './src/content/initiatives', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One line, shown on the front of the card. */
      tagline: z.string(),
      /** Shown on the back of the card when it flips. */
      summary: z.string(),
      href: z.string(),
      image: image().optional(),
      imageAlt: optionalText,
      order: z.number().default(0),
    }),
});

/** Skill Activation made visible: problem → action → shift. */
const impactStories = defineCollection({
  loader: glob({ base: './src/content/impact-stories', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      person: z.string(),
      personRole: optionalText,
      problem: z.string(),
      action: z.string(),
      shift: z.string(),
      /** Privacy-mode embed URL, if the story has a video. */
      embedUrl: optionalText,
      photo: image().optional(),
      /** Keeps unfinished stories out of the published site. */
      draft: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

/** Annual reports and data analyses. */
const reports = defineCollection({
  loader: glob({ base: './src/content/reports', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    summary: optionalText,
    /** Path under /public, e.g. /downloads/CYH-Annual-Report-202324.pdf */
    file: optionalText,
    webHref: optionalText,
  }),
});

/** One entry per Young Humanitarian Summit. */
const summits = defineCollection({
  loader: glob({ base: './src/content/summits', pattern: '**/*.mdx' }),
  schema: z.object({
    year: z.number(),
    title: z.string(),
    navLabel: z.string(),
    description: z.string(),
    /** Shown on the Summit overview page. */
    teaser: optionalText,
    /** Upcoming summits show ticket and registration details instead of an archive. */
    upcoming: z.boolean().default(false),
    facts: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    tickets: z
      .object({
        heading: z.string(),
        text: optionalText,
        note: optionalText,
        action: link.optional(),
      })
      .optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    aftermovieUrl: optionalText,
    speakersHeading: optionalText,
    speakers: z
      .array(z.object({ name: z.string(), role: optionalText }))
      .default([]),
    speakersNote: optionalText,
    workshopsHeading: optionalText,
    workshops: z
      .array(
        z.object({
          title: z.string(),
          organisation: optionalText,
          format: optionalText,
          description: optionalText,
          link: link.optional(),
        }),
      )
      .default([]),
    /** Free-form closing sections: venue, charity concert, statistics … */
    sections: z
      .array(
        z.object({
          heading: z.string(),
          text: optionalText,
          items: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    outro: z
      .object({
        text: optionalText,
        actions: z.array(link).default([]),
      })
      .optional(),
  }),
});

/** Navigation, footer and the German interface strings. */
/**
 * Terms the site explains in place: an editor marks a word in running text as
 * `[Zuversicht](term:zuversicht)` and it becomes a hover-and-focus bubble
 * carrying the definition. Entries are shared, so a term defined once can be
 * marked on any page. See src/lib/inline.ts.
 */
const glossary = defineCollection({
  loader: glob({ base: './src/content/glossary', pattern: '**/*.yaml' }),
  schema: z.object({
    term: z.string(),
    /** One line under the term, e.g. "A German word English does not have." */
    summary: optionalText,
    /** The definition itself. Inline markdown only; this sits in a bubble. */
    body: z.array(z.string()).default([]),
  }),
});

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
        href: optionalText,
        children: z.array(link).default([]),
      }),
    ),
    social: z.array(
      z.object({
        platform: z.enum(['instagram', 'linkedin', 'spotify', 'youtube']),
        label: z.string(),
        href: z.string(),
      }),
    ),
    newsletter: z.object({
      heading: z.string(),
      description: optionalText,
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
      /** Organigram and map. */
      organigramZoomIn: z.string(),
      organigramZoomOut: z.string(),
      organigramReset: z.string(),
      organigramHint: z.string(),
      mapCountries: z.string(),
      readMore: z.string(),
    }),
  }),
});

export const collections = {
  pages,
  glossary,
  news,
  events,
  team,
  advisoryBoard,
  partners,
  initiatives,
  impactStories,
  reports,
  summits,
  settings,
};
