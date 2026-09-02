import { config, collection, fields } from '@keystatic/core';

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

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Circle of Young Humanitarians' },
    navigation: {
      Content: ['pages', 'news', 'events', 'summits'],
      People: ['team', 'advisoryBoard'],
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
          description:
            'Which layout renders this page. "Standard page" is right for almost everything.',
          options: [
            { label: 'Standard page', value: 'default' },
            { label: 'Home page', value: 'home' },
            { label: 'Team', value: 'team' },
            { label: 'Advisory board', value: 'advisoryBoard' },
            { label: 'Events overview', value: 'events' },
            { label: 'Event category', value: 'eventCategory' },
            { label: 'Impact / press', value: 'impact' },
            { label: 'List of names', value: 'nameList' },
          ],
          defaultValue: 'default',
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
              label: 'Image description',
              description: 'What the image shows. Required whenever an image is set.',
              multiline: true,
            }),
            actions: linkObject('Buttons'),
          },
          { label: 'Hero', description: 'Optional lead-in shown above the body text.' },
        ),
        initiativesHeading: fields.text({ label: 'Initiatives heading' }),
        initiatives: fields.array(
          fields.object({
            text: fields.text({ label: 'Text', validation: { isRequired: true } }),
            href: fields.text({ label: 'Link target', validation: { isRequired: true } }),
          }),
          {
            label: 'Initiative teasers',
            itemLabel: (props) => props.fields.text.value || 'Initiative',
          },
        ),
        stagesHeading: fields.text({ label: 'Stages heading' }),
        stages: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { isRequired: true } }),
            challengeLabel: fields.text({
              label: 'Challenge label',
              defaultValue: 'Challenge',
              validation: { isRequired: true },
            }),
            challenge: fields.text({
              label: 'Challenge',
              multiline: true,
              validation: { isRequired: true },
            }),
            responseLabel: fields.text({
              label: 'Response label',
              defaultValue: 'Response',
              validation: { isRequired: true },
            }),
            response: fields.text({
              label: 'Response',
              multiline: true,
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Stages (Theory of Change)',
            itemLabel: (props) => props.fields.title.value || 'Stage',
          },
        ),
        teamsHeading: fields.text({ label: 'Volunteer teams heading' }),
        teams: fields.array(
          fields.object({
            name: fields.text({ label: 'Team name', validation: { isRequired: true } }),
            department: fields.text({ label: 'Department' }),
            description: fields.text({
              label: 'Description',
              multiline: true,
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Volunteer teams (Get Involved)',
            itemLabel: (props) => props.fields.name.value || 'Team',
          },
        ),
        programmesHeading: fields.text({ label: 'Event formats heading' }),
        programmes: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { isRequired: true } }),
            description: fields.text({
              label: 'Description',
              multiline: true,
              validation: { isRequired: true },
            }),
            href: fields.text({ label: 'Link target', validation: { isRequired: true } }),
          }),
          {
            label: 'Event formats (Events overview)',
            itemLabel: (props) => props.fields.title.value || 'Format',
          },
        ),
        donation: fields.object(
          {
            heading: fields.text({ label: 'Heading' }),
            methodLabel: fields.text({ label: 'Method label' }),
            lines: fields.array(
              fields.object({
                label: fields.text({ label: 'Label' }),
                value: fields.text({ label: 'Value', validation: { isRequired: true } }),
              }),
              {
                label: 'Details',
                itemLabel: (props) => props.fields.value.value || 'Detail',
              },
            ),
          },
          { label: 'Donation details (Support)' },
        ),
        reportsHeading: fields.text({ label: 'Annual reports heading' }),
        reports: linkObject('Annual reports (Impact)'),
        namesHeading: fields.text({ label: 'Names heading' }),
        names: fields.array(fields.text({ label: 'Name' }), {
          label: 'Names',
          description: 'Used by the "List of names" template.',
          itemLabel: (props) => props.value || 'Name',
        }),
        outro: fields.object(
          {
            heading: fields.text({ label: 'Heading' }),
            text: fields.text({ label: 'Text', multiline: true }),
            actions: linkObject('Buttons'),
          },
          { label: 'Closing section' },
        ),
        eventCategory: fields.select({
          label: 'Event category',
          description: 'Only used by the "Event category" template.',
          options: [
            { label: 'Humanitarian Enrichment', value: 'enrichment' },
            { label: 'Humanitarian Challenge', value: 'challenge' },
            { label: 'Other Events', value: 'other' },
          ],
          defaultValue: 'other',
        }),
        pressHeading: fields.text({
          label: 'Press heading',
          description: 'Only used by the "Impact / press" template.',
        }),
        podcastHeading: fields.text({
          label: 'Podcast heading',
          description: 'Only used by the "Impact / press" template.',
        }),
        order: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        content: fields.mdx({ label: 'Body' }),
      },
    }),

    news: collection({
      label: 'News & press',
      slugField: 'title',
      path: 'src/content/news/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'dateLabel'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        outlet: fields.text({ label: 'Outlet' }),
        dateLabel: fields.text({
          label: 'Date label',
          description: 'Shown to readers, e.g. "May 2025".',
          validation: { isRequired: true },
        }),
        date: fields.date({
          label: 'Date',
          description: 'Used for sorting only.',
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
          label: 'Date label',
          description: 'Shown to readers, e.g. "5 September 2026".',
          validation: { isRequired: true },
        }),
        date: fields.date({
          label: 'Date',
          description: 'Used for sorting only.',
          validation: { isRequired: true },
        }),
        details: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
            value: fields.text({ label: 'Value', validation: { isRequired: true } }),
          }),
          {
            label: 'Details',
            itemLabel: (props) => props.fields.label.value || 'Detail',
          },
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
        navLabel: fields.text({
          label: 'Navigation label',
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { isRequired: true },
        }),
        speakersHeading: fields.text({ label: 'Speakers heading' }),
        speakers: fields.array(
          fields.object({
            name: fields.text({ label: 'Name', validation: { isRequired: true } }),
            role: fields.text({ label: 'Role', multiline: true }),
          }),
          {
            label: 'Speakers & moderators',
            itemLabel: (props) => props.fields.name.value || 'Speaker',
          },
        ),
        speakersNote: fields.text({ label: 'Note below the speakers', multiline: true }),
        workshopsHeading: fields.text({ label: 'Workshops heading' }),
        workshops: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { isRequired: true } }),
            organisation: fields.text({ label: 'Organisation' }),
            format: fields.text({ label: 'Format', description: 'e.g. In-person, Online' }),
            description: fields.text({ label: 'Description', multiline: true }),
            link: fields.object(linkFields, { label: 'Link' }),
          }),
          {
            label: 'Workshops',
            itemLabel: (props) => props.fields.title.value || 'Workshop',
          },
        ),
        sections: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
            text: fields.text({ label: 'Text', multiline: true }),
            items: fields.array(fields.text({ label: 'Item' }), {
              label: 'List items',
              itemLabel: (props) => props.value || 'Item',
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
        credentials: fields.text({
          label: 'Credentials',
          description: 'Studies or current position.',
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

    advisoryBoard: collection({
      label: 'Advisory board',
      slugField: 'name',
      path: 'src/content/advisory-board/*',
      format: { contentField: 'content' },
      columns: ['name', 'role'],
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        role: fields.text({ label: 'Role', validation: { isRequired: true } }),
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

    settings: collection({
      label: 'Site settings',
      slugField: 'siteName',
      path: 'src/content/settings/*',
      format: { data: 'yaml' },
      columns: ['siteName'],
      schema: {
        siteName: fields.slug({
          name: { label: 'Site name', validation: { isRequired: true } },
        }),
        shortName: fields.text({ label: 'Short name', validation: { isRequired: true } }),
        tagline: fields.text({ label: 'Tagline', validation: { isRequired: true } }),
        logoAlt: fields.text({ label: 'Logo alt text', validation: { isRequired: true } }),
        navigation: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
            href: fields.text({
              label: 'Link target',
              description: 'Leave empty for a dropdown that is not itself a page.',
            }),
            children: linkObject('Sub-items'),
          }),
          {
            label: 'Main navigation',
            itemLabel: (props) => props.fields.label.value || 'Item',
          },
        ),
        social: fields.array(
          fields.object({
            platform: fields.select({
              label: 'Platform',
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Spotify', value: 'spotify' },
              ],
              defaultValue: 'instagram',
            }),
            label: fields.text({ label: 'Accessible label', validation: { isRequired: true } }),
            href: fields.url({ label: 'URL', validation: { isRequired: true } }),
          }),
          {
            label: 'Social media',
            itemLabel: (props) => props.fields.label.value || 'Profile',
          },
        ),
        newsletter: fields.object(
          {
            heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
            description: fields.text({ label: 'Description', multiline: true }),
            emailLabel: fields.text({ label: 'Email field label', validation: { isRequired: true } }),
            buttonLabel: fields.text({ label: 'Button label', validation: { isRequired: true } }),
            actionUrl: fields.url({
              label: 'Form action URL',
              description: 'The newsletter provider’s sign-up form endpoint.',
              validation: { isRequired: true },
            }),
          },
          { label: 'Newsletter' },
        ),
        footer: fields.object(
          {
            addressLines: fields.array(fields.text({ label: 'Line' }), {
              label: 'Address',
              itemLabel: (props) => props.value || 'Line',
            }),
            email: fields.text({ label: 'Contact email', validation: { isRequired: true } }),
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
            socialNavigation: fields.text({ label: 'Social media navigation' }),
            upcomingEvents: fields.text({ label: 'Upcoming events' }),
            pastEvents: fields.text({ label: 'Past events' }),
            noUpcomingEvents: fields.text({ label: 'No upcoming events' }),
            backToOverview: fields.text({ label: 'Back to overview' }),
            notFoundTitle: fields.text({ label: '404 title' }),
            notFoundText: fields.text({ label: '404 text', multiline: true }),
            notFoundAction: fields.text({ label: '404 button' }),
            contentLanguageNote: fields.text({
              label: 'Content language note',
              multiline: true,
            }),
          },
          {
            label: 'Interface strings (German)',
            description: 'Everything the templates say for themselves.',
          },
        ),
      },
    }),
  },
});
