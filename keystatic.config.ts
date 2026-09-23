import { config, collection, fields } from '@keystatic/core';
import { COUNTRY_NAMES } from './src/lib/countries';

/**
 * Keystatic in local mode: the editor at /keystatic reads and writes the files
 * in src/content/ directly, and changes show up as ordinary git edits.
 *
 * This file must stay in step with src/content.config.ts — same collections,
 * same fields, same names. If you add a field in one, add it in the other.
 */

const linkFields = {
  label: fields.text({ label: 'Link text', validation: { isRequired: true } }),
  href: fields.text({
    label: 'Link target',
    description: 'An internal path like /events, or a full https:// URL.',
    validation: { isRequired: true },
  }),
};

const linkObject = (label: string) =>
  fields.array(fields.object(linkFields), {
    label,
    itemLabel: (props) => props.fields.label.value || 'Link',
  });

/** A call to action, with the button tier it renders as. */
const actionArray = (label = 'Buttons') =>
  fields.array(
    fields.object({
      ...linkFields,
      tier: fields.select({
        label: 'Button style',
        description: 'Primary is the filled red button. Use one per section at most.',
        options: [
          { label: 'Primary (filled)', value: 'primary' },
          { label: 'Secondary (outlined)', value: 'secondary' },
          { label: 'Tertiary (plain link)', value: 'tertiary' },
        ],
        defaultValue: 'primary',
      }),
    }),
    { label, itemLabel: (props) => props.fields.label.value || 'Button' },
  );

/**
 * Fields every section shares.
 *
 * "Background" maps to the colour themes in docs/design-rules.md §3. Only
 * white and black are used on the live site; red exists for a deliberate
 * exception, not as a third option to reach for.
 */
const sectionBase = {
  theme: fields.select({
    label: 'Background',
    options: [
      { label: 'White', value: 'white' },
      { label: 'Black', value: 'black' },
      { label: 'Red (use sparingly)', value: 'bright' },
    ],
    defaultValue: 'white',
  }),
  heading: fields.text({ label: 'Heading' }),
  intro: fields.text({
    label: 'Intro',
    description: 'One or two sentences under the heading. **bold** and [links](/path) work.',
    multiline: true,
  }),
  anchor: fields.text({
    label: 'Anchor',
    description: 'Optional id, so other pages can link straight to this section.',
  }),
  placeholder: fields.text({
    label: 'Placeholder note',
    description:
      'Shown, clearly marked as unfinished, while this section has no content yet. Delete it once the content is in.',
    multiline: true,
  }),
};

const statsArray = fields.array(
  fields.object({
    value: fields.text({ label: 'Number', validation: { isRequired: true } }),
    label: fields.text({ label: 'What it counts', validation: { isRequired: true } }),
  }),
  { label: 'Numbers', itemLabel: (props) => props.fields.value.value || 'Number' },
);

const paragraphArray = (label = 'Paragraphs') =>
  fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
    label,
    description: 'One entry per paragraph. **bold**, *italic* and [links](/path) work.',
    itemLabel: (props) => props.value?.slice(0, 60) || 'Paragraph',
  });

/**
 * Page sections.
 *
 * Stored as { discriminant, value }, which is both what this conditional
 * field writes and what src/content.config.ts validates.
 */
const sectionsField = fields.array(
  fields.conditional(
    fields.select({
      label: 'Section type',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Explainer (click to open)', value: 'explainer' },
        { label: 'Cards', value: 'cards' },
        { label: 'Numbers', value: 'stats' },
        { label: 'Evidence with sources', value: 'evidence' },
        { label: 'Partner logos', value: 'logos' },
        { label: 'Videos', value: 'videos' },
        { label: 'Photo gallery', value: 'gallery' },
        { label: 'World map of members', value: 'map' },
        { label: 'Organigram', value: 'organigram' },
        { label: 'List from a collection', value: 'collection' },
        { label: 'Ways to donate', value: 'donation' },
        { label: 'Call to action', value: 'cta' },
      ],
      defaultValue: 'text',
    }),
    {
      text: fields.object({
        ...sectionBase,
        variant: fields.select({
          label: 'Style',
          options: [
            { label: 'Normal', value: 'default' },
            { label: 'Large statement', value: 'statement' },
            { label: 'Lead paragraph', value: 'lead' },
            { label: 'Two columns', value: 'columns' },
          ],
          defaultValue: 'default',
        }),
        body: paragraphArray(),
        items: fields.array(fields.text({ label: 'Item', multiline: true }), {
          label: 'Bullet list',
          itemLabel: (props) => props.value?.slice(0, 60) || 'Item',
        }),
        actions: actionArray(),
      }),

      explainer: fields.object({
        ...sectionBase,
        term: fields.text({ label: 'Term', validation: { isRequired: true } }),
        summary: fields.text({
          label: 'One-line summary',
          description: 'Shown next to the term before it is opened.',
          validation: { isRequired: true },
        }),
        body: paragraphArray('Definition'),
      }),

      cards: fields.object({
        ...sectionBase,
        variant: fields.select({
          label: 'Presentation',
          options: [
            { label: 'Plain cards', value: 'plain' },
            { label: 'Flip cards (reveal on hover)', value: 'flip' },
            { label: 'Numbered steps', value: 'numbered' },
            { label: 'Circles', value: 'bubbles' },
            { label: 'Layers (click to expand)', value: 'layers' },
          ],
          defaultValue: 'plain',
        }),
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { isRequired: true } }),
            subtitle: fields.text({ label: 'Subtitle' }),
            text: fields.text({ label: 'Text', multiline: true }),
            back: fields.text({
              label: 'Back of card',
              description: 'Flip cards only. Falls back to the text above.',
              multiline: true,
            }),
            href: fields.text({ label: 'Links to' }),
          }),
          { label: 'Cards', itemLabel: (props) => props.fields.title.value || 'Card' },
        ),
        actions: actionArray(),
      }),

      stats: fields.object({ ...sectionBase, items: statsArray, actions: actionArray() }),

      evidence: fields.object({
        ...sectionBase,
        items: fields.array(
          fields.object({
            text: fields.text({
              label: 'Claim',
              multiline: true,
              validation: { isRequired: true },
            }),
            source: fields.text({ label: 'Source', validation: { isRequired: true } }),
            href: fields.text({ label: 'Source link' }),
          }),
          { label: 'Claims', itemLabel: (props) => props.fields.source.value || 'Claim' },
        ),
      }),

      logos: fields.object({
        ...sectionBase,
        category: fields.select({
          label: 'Which partners',
          options: [
            { label: 'Founding partner', value: 'founding' },
            { label: 'Strategic partner', value: 'strategic' },
            { label: 'Summit partners', value: 'summit' },
            { label: 'All other partners', value: 'general' },
          ],
          defaultValue: 'general',
        }),
        actions: actionArray(),
      }),

      videos: fields.object({
        ...sectionBase,
        items: fields.array(
          fields.object({
            title: fields.text({
              label: 'Title',
              description: 'Also read out by screen readers, so describe the film.',
              validation: { isRequired: true },
            }),
            text: fields.text({ label: 'Caption', multiline: true }),
            embedUrl: fields.text({
              label: 'Embed URL',
              description:
                'Use the privacy-mode embed URL, e.g. https://www.youtube-nocookie.com/embed/XXXX',
              validation: { isRequired: true },
            }),
          }),
          { label: 'Videos', itemLabel: (props) => props.fields.title.value || 'Video' },
        ),
      }),

      gallery: fields.object({
        ...sectionBase,
        items: fields.array(
          fields.object({
            image: fields.image({
              label: 'Image',
              directory: 'src/assets/pages',
              publicPath: '../../assets/pages/',
              validation: { isRequired: true },
            }),
            alt: fields.text({
              label: 'Alt text',
              description: 'Describe what is in the picture. Required.',
              multiline: true,
              validation: { isRequired: true },
            }),
            caption: fields.text({ label: 'Caption' }),
          }),
          { label: 'Images', itemLabel: (props) => props.fields.alt.value?.slice(0, 60) || 'Image' },
        ),
      }),

      map: fields.object({
        ...sectionBase,
        stats: statsArray,
        note: fields.text({ label: 'Note under the map', multiline: true }),
      }),

      organigram: fields.object({
        ...sectionBase,
        note: fields.text({ label: 'Note under the chart', multiline: true }),
      }),

      collection: fields.object({
        ...sectionBase,
        source: fields.select({
          label: 'What to list',
          options: [
            { label: 'Upcoming events', value: 'events-upcoming' },
            { label: 'Past events', value: 'events-past' },
            { label: 'Events of one category', value: 'events-category' },
            { label: 'Team members', value: 'team' },
            { label: 'Advisory board', value: 'advisory-board' },
            { label: 'Press coverage', value: 'press' },
            { label: 'Podcast appearances', value: 'podcast' },
            { label: 'Summits', value: 'summits' },
            { label: 'Impact stories', value: 'impact-stories' },
            { label: 'Reports', value: 'reports' },
            { label: 'Initiatives', value: 'initiatives' },
          ],
          defaultValue: 'events-upcoming',
        }),
        category: fields.select({
          label: 'Event category',
          description: 'Only used when listing events of one category.',
          options: [
            { label: 'Humanitarian Enrichment', value: 'enrichment' },
            { label: 'Humanitarian Challenge', value: 'challenge' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'challenge',
        }),
        limit: fields.integer({
          label: 'Maximum to show',
          description: '0 shows all of them.',
          defaultValue: 0,
        }),
        actions: actionArray(),
      }),

      donation: fields.object({
        ...sectionBase,
        methods: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { isRequired: true } }),
            text: fields.text({ label: 'Description', multiline: true }),
            details: fields.array(
              fields.object({
                label: fields.text({ label: 'Label' }),
                value: fields.text({ label: 'Value', validation: { isRequired: true } }),
              }),
              { label: 'Details', itemLabel: (props) => props.fields.value.value || 'Detail' },
            ),
            action: fields.object(linkFields, { label: 'Button' }),
          }),
          { label: 'Ways to give', itemLabel: (props) => props.fields.title.value || 'Method' },
        ),
      }),

      cta: fields.object({
        ...sectionBase,
        body: paragraphArray(),
        actions: actionArray(),
      }),
    },
  ),
  {
    label: 'Sections',
    description: 'The page, block by block. Drag to reorder.',
    itemLabel: (props) => {
      const heading = props.value?.fields?.heading?.value;
      return heading ? `${props.discriminant} — ${heading}` : String(props.discriminant);
    },
  },
);

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Circle of Young Humanitarians' },
    navigation: {
      Content: ['pages', 'news', 'events', 'summits', 'initiatives', 'impactStories', 'reports'],
      People: ['team', 'advisoryBoard', 'partners'],
      Configuration: ['settings'],
    },
  },
  collections: {
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Also used as the page heading.',
            validation: { isRequired: true },
          },
        }),
        description: fields.text({
          label: 'Description',
          description: 'One sentence, used for search engines and link previews.',
          multiline: true,
          validation: { isRequired: true },
        }),
        template: fields.select({
          label: 'Template',
          description: 'Leave this on "Standard page" unless you are editing the home page.',
          options: [
            { label: 'Standard page', value: 'default' },
            { label: 'Home page', value: 'home' },
          ],
          defaultValue: 'default',
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Leaves this page out of the published site.',
          defaultValue: false,
        }),
        seo: fields.object(
          {
            title: fields.text({ label: 'Browser tab title' }),
            description: fields.text({ label: 'Meta description', multiline: true }),
          },
          { label: 'Search engine overrides', description: 'Leave empty to use the fields above.' },
        ),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow' }),
            heading: fields.text({ label: 'Heading', multiline: true }),
            lead: fields.text({ label: 'Lead paragraph', multiline: true }),
            image: fields.image({
              label: 'Image',
              directory: 'src/assets/pages',
              publicPath: '../../assets/pages/',
            }),
            imageAlt: fields.text({
              label: 'Image alt text',
              description: 'Required whenever there is an image.',
              multiline: true,
            }),
            actions: actionArray(),
            theme: fields.select({
              label: 'Background',
              options: [
                { label: 'White', value: 'white' },
                { label: 'Black', value: 'black' },
                { label: 'Red (use sparingly)', value: 'bright' },
              ],
              defaultValue: 'white',
            }),
          },
          { label: 'Hero' },
        ),
        showBody: fields.checkbox({
          label: 'Show the body text',
          description: 'Turn off for pages built entirely from sections.',
          defaultValue: true,
        }),
        sections: sectionsField,
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Body' }),
      },
    }),

    news: collection({
      label: 'Press & podcast mentions',
      slugField: 'title',
      path: 'src/content/news/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'dateLabel'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        outlet: fields.text({ label: 'Outlet' }),
        dateLabel: fields.text({
          label: 'Date as printed',
          description: 'Free text, e.g. "May 2025".',
          validation: { isRequired: true },
        }),
        date: fields.date({
          label: 'Date for sorting',
          validation: { isRequired: true },
        }),
        section: fields.select({
          label: 'Section',
          options: [
            { label: 'Press', value: 'press' },
            { label: 'Podcast', value: 'podcast' },
          ],
          defaultValue: 'press',
        }),
        links: linkObject('Links'),
        content: fields.mdx({ label: 'Summary' }),
      },
    }),

    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'dateLabel'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Humanitarian Enrichment', value: 'enrichment' },
            { label: 'Humanitarian Challenge', value: 'challenge' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'upcoming',
        }),
        dateLabel: fields.text({
          label: 'Date as printed',
          description: 'Free text, e.g. "26 September 2026".',
          validation: { isRequired: true },
        }),
        date: fields.date({ label: 'Date for sorting', validation: { isRequired: true } }),
        location: fields.text({ label: 'Location' }),
        details: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
            value: fields.text({ label: 'Value', validation: { isRequired: true } }),
          }),
          { label: 'Details', itemLabel: (props) => props.fields.label.value || 'Detail' },
        ),
        note: fields.text({ label: 'Note', multiline: true }),
        registration: fields.object(linkFields, { label: 'Registration link' }),
        content: fields.mdx({ label: 'Description' }),
      },
    }),

    summits: collection({
      label: 'Summits',
      slugField: 'title',
      path: 'src/content/summits/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'navLabel'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        year: fields.integer({ label: 'Year', validation: { isRequired: true } }),
        navLabel: fields.text({ label: 'Navigation label', validation: { isRequired: true } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { isRequired: true },
        }),
        teaser: fields.text({
          label: 'Teaser',
          description: 'One line, shown on the Summit overview page.',
          multiline: true,
        }),
        upcoming: fields.checkbox({
          label: 'Still to come',
          description: 'Shows tickets and key facts instead of an archive.',
          defaultValue: false,
        }),
        facts: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
            value: fields.text({ label: 'Value', validation: { isRequired: true } }),
          }),
          { label: 'Key facts', itemLabel: (props) => props.fields.label.value || 'Fact' },
        ),
        tickets: fields.object(
          {
            heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
            text: fields.text({ label: 'Text', multiline: true }),
            note: fields.text({ label: 'Note', multiline: true }),
            action: fields.object(linkFields, { label: 'Button' }),
          },
          { label: 'Tickets' },
        ),
        stats: statsArray,
        aftermovieUrl: fields.text({
          label: 'Aftermovie embed URL',
          description: 'Privacy-mode embed URL.',
        }),
        speakersHeading: fields.text({ label: 'Speakers heading' }),
        speakers: fields.array(
          fields.object({
            name: fields.text({ label: 'Name', validation: { isRequired: true } }),
            role: fields.text({ label: 'Role', multiline: true }),
          }),
          { label: 'Speakers', itemLabel: (props) => props.fields.name.value || 'Speaker' },
        ),
        speakersNote: fields.text({ label: 'Note under the speakers', multiline: true }),
        workshopsHeading: fields.text({ label: 'Workshops heading' }),
        workshops: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { isRequired: true } }),
            organisation: fields.text({ label: 'Organisation' }),
            format: fields.text({ label: 'Format', description: 'e.g. In-person, Online' }),
            description: fields.text({ label: 'Description', multiline: true }),
            link: fields.object(linkFields, { label: 'Link' }),
          }),
          { label: 'Workshops', itemLabel: (props) => props.fields.title.value || 'Workshop' },
        ),
        sections: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
            text: fields.text({ label: 'Text', multiline: true }),
            items: fields.array(fields.text({ label: 'Item', multiline: true }), {
              label: 'List',
              itemLabel: (props) => props.value?.slice(0, 60) || 'Item',
            }),
          }),
          {
            label: 'Extra sections',
            itemLabel: (props) => props.fields.heading.value || 'Section',
          },
        ),
        outro: fields.object(
          {
            text: fields.text({ label: 'Text', multiline: true }),
            actions: linkObject('Buttons'),
          },
          { label: 'Closing section' },
        ),
        content: fields.mdx({ label: 'Introduction' }),
      },
    }),

    initiatives: collection({
      label: 'Initiatives',
      slugField: 'title',
      path: 'src/content/initiatives/*',
      format: { contentField: 'content' },
      columns: ['title'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        tagline: fields.text({
          label: 'Tagline',
          description: 'One line, shown on the front of the card.',
          multiline: true,
          validation: { isRequired: true },
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'Shown on the back of the card when it flips.',
          multiline: true,
          validation: { isRequired: true },
        }),
        href: fields.text({ label: 'Page', validation: { isRequired: true } }),
        image: fields.image({
          label: 'Image',
          directory: 'src/assets/initiatives',
          publicPath: '../../assets/initiatives/',
        }),
        imageAlt: fields.text({ label: 'Image alt text', multiline: true }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Notes' }),
      },
    }),

    impactStories: collection({
      label: 'Impact stories',
      slugField: 'title',
      path: 'src/content/impact-stories/*',
      format: { contentField: 'content' },
      columns: ['title', 'person'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        person: fields.text({ label: 'Who', validation: { isRequired: true } }),
        personRole: fields.text({ label: 'Their role' }),
        problem: fields.text({
          label: 'The problem',
          multiline: true,
          validation: { isRequired: true },
        }),
        action: fields.text({
          label: 'The action they took',
          multiline: true,
          validation: { isRequired: true },
        }),
        shift: fields.text({
          label: 'The shift that followed',
          multiline: true,
          validation: { isRequired: true },
        }),
        embedUrl: fields.text({
          label: 'Video embed URL',
          description: 'Privacy-mode embed URL, if the story has a film.',
        }),
        photo: fields.image({
          label: 'Photo',
          directory: 'src/assets/impact-stories',
          publicPath: '../../assets/impact-stories/',
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Leaves this story out of the published site.',
          defaultValue: false,
        }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Longer version' }),
      },
    }),

    reports: collection({
      label: 'Reports',
      slugField: 'title',
      path: 'src/content/reports/*',
      format: { contentField: 'content' },
      columns: ['title', 'year'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        year: fields.integer({ label: 'Year', validation: { isRequired: true } }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        file: fields.text({
          label: 'PDF path',
          description: 'A path under /public, e.g. /downloads/CYH-Annual-Report-202324.pdf',
        }),
        webHref: fields.text({ label: 'Web version' }),
        content: fields.mdx({ label: 'Notes' }),
      },
    }),

    team: collection({
      label: 'Team members',
      slugField: 'name',
      path: 'src/content/team/*',
      format: { contentField: 'content' },
      columns: ['name', 'department', 'role'],
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        role: fields.text({ label: 'Role', validation: { isRequired: true } }),
        department: fields.text({
          label: 'Department',
          description: 'Must match a department heading on the Team page.',
          validation: { isRequired: true },
        }),
        team: fields.text({
          label: 'Team',
          description: 'Sub-team within the department, if any. Used by the organigram.',
        }),
        level: fields.select({
          label: 'Level',
          description: 'Where this person sits in the organigram.',
          options: [
            { label: 'Board', value: 'board' },
            { label: 'Director', value: 'director' },
            { label: 'Head', value: 'head' },
            { label: 'Member', value: 'member' },
          ],
          defaultValue: 'member',
        }),
        credentials: fields.text({
          label: 'Credentials',
          description: 'Studies or current position.',
          multiline: true,
        }),
        note: fields.text({
          label: 'Personal note',
          description: 'One line, shown when their role is opened in the organigram.',
          multiline: true,
        }),
        quote: fields.text({ label: 'Quote', multiline: true }),
        country: fields.select({
          label: 'Country of origin',
          description: 'Fills this country on the world map on the Team page.',
          options: [
            { label: '— not set —', value: '' },
            ...COUNTRY_NAMES.map((name) => ({ label: name, value: name })),
          ],
          defaultValue: '',
        }),
        photo: fields.image({
          label: 'Photo',
          directory: 'src/assets/people',
          publicPath: '../../assets/people/',
        }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Longer biography' }),
      },
    }),

    advisoryBoard: collection({
      label: 'Advisory board',
      slugField: 'name',
      path: 'src/content/advisory-board/*',
      format: { contentField: 'content' },
      columns: ['name', 'role'],
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        role: fields.text({ label: 'Role', validation: { isRequired: true } }),
        note: fields.text({
          label: 'Note',
          description: 'Shown under the name, e.g. the chair\'s term.',
          multiline: true,
        }),
        quote: fields.text({ label: 'Quote', multiline: true }),
        photo: fields.image({
          label: 'Photo',
          directory: 'src/assets/people',
          publicPath: '../../assets/people/',
        }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Longer biography' }),
      },
    }),

    partners: collection({
      label: 'Partners',
      slugField: 'name',
      path: 'src/content/partners/*',
      format: { contentField: 'content' },
      columns: ['name', 'category'],
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Founding partner', value: 'founding' },
            { label: 'Strategic partner', value: 'strategic' },
            { label: 'Summit partner', value: 'summit' },
            { label: 'Other partner', value: 'general' },
          ],
          defaultValue: 'general',
        }),
        href: fields.text({ label: 'Website' }),
        logo: fields.image({
          label: 'Logo',
          directory: 'src/assets/partners',
          publicPath: '../../assets/partners/',
        }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Notes' }),
      },
    }),

    settings: collection({
      label: 'Site settings',
      slugField: 'siteName',
      path: 'src/content/settings/*',
      format: { data: 'yaml' },
      columns: ['siteName'],
      schema: {
        siteName: fields.slug({ name: { label: 'Site name', validation: { isRequired: true } } }),
        shortName: fields.text({ label: 'Short name', validation: { isRequired: true } }),
        tagline: fields.text({ label: 'Tagline', multiline: true, validation: { isRequired: true } }),
        logoAlt: fields.text({ label: 'Logo alt text', validation: { isRequired: true } }),
        navigation: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
            href: fields.text({
              label: 'Link target',
              description: 'Leave empty for a menu that only opens a sub-menu.',
            }),
            children: linkObject('Sub-menu'),
          }),
          { label: 'Navigation', itemLabel: (props) => props.fields.label.value || 'Item' },
        ),
        social: fields.array(
          fields.object({
            platform: fields.select({
              label: 'Platform',
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'Spotify', value: 'spotify' },
              ],
              defaultValue: 'instagram',
            }),
            label: fields.text({
              label: 'Accessible label',
              validation: { isRequired: true },
            }),
            href: fields.text({ label: 'Profile URL', validation: { isRequired: true } }),
          }),
          { label: 'Social links', itemLabel: (props) => props.fields.platform.value },
        ),
        newsletter: fields.object(
          {
            heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
            description: fields.text({ label: 'Description', multiline: true }),
            emailLabel: fields.text({ label: 'Email field label', validation: { isRequired: true } }),
            buttonLabel: fields.text({ label: 'Button label', validation: { isRequired: true } }),
            actionUrl: fields.text({ label: 'Mailchimp form URL', validation: { isRequired: true } }),
          },
          { label: 'Newsletter' },
        ),
        footer: fields.object(
          {
            addressLines: fields.array(fields.text({ label: 'Line' }), {
              label: 'Address',
              itemLabel: (props) => props.value || 'Line',
            }),
            email: fields.text({ label: 'Email', validation: { isRequired: true } }),
            legalLinks: linkObject('Legal links'),
            copyright: fields.text({ label: 'Copyright', validation: { isRequired: true } }),
          },
          { label: 'Footer' },
        ),
        ui: fields.object(
          {
            skipToContent: fields.text({ label: 'Skip to content' }),
            openMenu: fields.text({ label: 'Open menu' }),
            closeMenu: fields.text({ label: 'Close menu' }),
            mainNavigation: fields.text({ label: 'Main navigation' }),
            footerNavigation: fields.text({ label: 'Footer navigation' }),
            socialNavigation: fields.text({ label: 'Social navigation' }),
            upcomingEvents: fields.text({ label: 'Upcoming events' }),
            pastEvents: fields.text({ label: 'Past events' }),
            noUpcomingEvents: fields.text({ label: 'No upcoming events', multiline: true }),
            backToOverview: fields.text({ label: 'Back to overview' }),
            notFoundTitle: fields.text({ label: '404 title' }),
            notFoundText: fields.text({ label: '404 text', multiline: true }),
            notFoundAction: fields.text({ label: '404 button' }),
            contentLanguageNote: fields.text({ label: 'Content language note', multiline: true }),
            organigramZoomIn: fields.text({ label: 'Organigram: zoom in' }),
            organigramZoomOut: fields.text({ label: 'Organigram: zoom out' }),
            organigramReset: fields.text({ label: 'Organigram: reset' }),
            organigramHint: fields.text({ label: 'Organigram: hint', multiline: true }),
            mapCountries: fields.text({ label: 'Map: countries label' }),
            readMore: fields.text({ label: 'Read more' }),
          },
          {
            label: 'Interface strings',
            description: 'Everything the templates say themselves. German.',
          },
        ),
      },
    }),
  },
});
