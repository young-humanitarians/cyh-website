# Circle of Young Humanitarians – website

The new public website of the [Circle of Young Humanitarians](https://circleofyounghumanitarians.ch/)
(CYH), a Swiss non-profit youth humanitarian organisation. It replaces the
current Squarespace site, which is still the one live at that address.

The site is built with [Astro](https://astro.build/) as a fully static site.
Page text, events, people and partners are stored as plain files and edited
with [Keystatic](https://keystatic.com/), a visual content editor.

|  | Address | Updated from |
| --- | --- | --- |
| Preview | https://witty-bay-085d9b303.6.azurestaticapps.net | `dev`, on every push |
| Production | https://young-humanitarians.github.io/cyh-website/ | `main`, via pull request |

## Read these first

- **[CLAUDE.md](CLAUDE.md)**: the project's rules. Despite the name, it's for
  people too: architecture, security, content rules, how branches and
  deployment work, what source material exists, and how the project owner
  likes to work. Claude reads it automatically at the start of every session.
- **[docs/design-rules.md](docs/design-rules.md)**: the binding design
  specification. Read it before changing any styling or layout. The short
  version: four colours only (`#000000`, `#FFFFFF`, `#ED000C`, `#B10000`), no
  uppercase, and nothing that works on hover alone.

## Getting started

### In GitHub Codespaces (easiest)

On the repository page, choose **Code → Codespaces → Create codespace on
dev**. Everything is installed automatically, the dev server starts by itself,
and Claude Code is available in the editor. When the port notification
appears, open the forwarded address and add `/cyh-website/` to the end. The
bare address shows a 404 page; that's expected.

### On your own computer

You need [Node.js](https://nodejs.org/) 22.12 or newer and Git.

```sh
git clone https://github.com/young-humanitarians/cyh-website.git
cd cyh-website
git switch dev
npm ci
npm run dev
```

Then open http://localhost:4321/cyh-website/.

## Editing content

With the dev server running, open **`/keystatic`** (e.g.
http://localhost:4321/keystatic). Note that it has no `/cyh-website/` in front.
Changes made there are written straight into the files under
`src/content/`; they still have to be committed and pushed like any other
change.

Pages are built from **sections**: an ordered list of blocks (text, cards,
gallery, logos, call to action and so on) that you can add, reorder and remove
per page in Keystatic.

Two content rules (more in [CLAUDE.md](CLAUDE.md#content-rules)):

- **Never invent content.** If a fact, quote or outcome is missing, leave a
  marked gap and ask someone who knows.
- **When an event is over**, move it from `upcoming` to its archive category,
  switch the text to past tense and remove the registration link and
  logistics.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with Keystatic at http://localhost:4321 |
| `npm run build` | Build the static site into `dist/`. It must pass before any change is done. |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Type-check the project |

## Where things are

```
src/
  content/          All editable content: pages, events, team, partners,
                    glossary, news, reports, site settings (site.yaml)
  content.config.ts Schemas for that content (keep in sync with keystatic.config.ts)
  assets/           Photos and logos (optimised at build time)
  components/       Page parts; blocks/ holds one component per section type
  styles/global.css The site's stylesheet
public/downloads/   PDFs linked from the site (reports, press)
docs/               Design rules and source material
keystatic.config.ts What the Keystatic editor shows
```

## How changes reach the site

1. Make changes on `dev`, or on a feature branch that is merged into `dev`.
2. Pushing `dev` updates the **preview**. Review changes there, especially
   anything visual.
3. When the preview is right, open a **pull request from `dev` into `main`**.
   Merging it publishes the site. Never push directly to `main`.

## Security

Treat everything in this repository as public. Never put passwords, tokens or
API keys in any file. Deployment credentials live in GitHub Actions secrets
and are referred to by name only.
