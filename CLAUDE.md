# Website – Circle of Young Humanitarians

Public website of the Circle of Young Humanitarians, a Swiss non-profit youth
humanitarian organization. Static site built with Astro, deployed via GitHub
Actions (see "Branches and deployment" below). Content is edited by
non-technical volunteers through Keystatic.

## Architecture rules

- **All editable content lives in `src/content/`** as Markdown/MDX or YAML,
  managed through Astro content collections with schemas in
  `src/content.config.ts`. Never hardcode page text, news items, event data,
  or people/board information inside components or pages.
- Images uploaded by editors go to `src/assets/` (processed) or
  `public/images/` (as-is). Do not reference external image URLs for content
  images.
- Keystatic config (`keystatic.config.ts`) must stay in sync with the content
  collection schemas. When adding a collection or field, update both.
- The site must build fully static (`output: 'static'`). No server-side
  rendering, no runtime backend assumptions.
- **Pages are composed from `sections`**, an ordered list of blocks, rather
  than from per-page templates. Blocks are stored as `{ discriminant, value }`
  because that is the shape Keystatic's conditional field reads and writes;
  `flattenSections()` in `src/lib/blocks.ts` converts them to `{ type, ... }`
  for components. Adding a block type means changing four things: the schema
  in `src/content.config.ts`, a component in `src/components/blocks/`, a case
  in `src/components/Blocks.astro`, and a field in `keystatic.config.ts`.

## Design rules

- **`docs/design-rules.md` is the binding design specification.** Read it
  before writing or changing any CSS, component styling or page layout. It is
  derived from the live site at https://circleofyounghumanitarians.ch/, which
  is the source of truth for the visual design.
- The palette is exactly four colours: `#000000`, `#FFFFFF`, `#ED000C`,
  `#B10000`. No greys, no tinted surfaces, no uppercase text, no negative
  letter-spacing.
- **Subtle scroll animations are welcome and encouraged** — this is a
  deliberate departure from the static live site. Follow the motion rules in
  section 10 of `docs/design-rules.md`: CSS scroll-driven animations only
  (`animation-timeline: view()`, never scroll listeners), 20–40px of travel,
  longhand properties only, guarded by `@supports` and
  `prefers-reduced-motion: no-preference`. Nothing that flies in, bounces,
  spins or zooms.
- `src/styles/global.css` conforms to the spec. Section 13 of the rule book
  records what was changed to get there — do not reintroduce any of it. The
  only open item is the heading font (Inter stands in for Adobe `acumin-pro`,
  which is licensed per-domain).

## Security rules — non-negotiable

- **Never write credentials, tokens, API keys, or passwords into any file**,
  including examples, comments, and documentation. Reference environment
  variables or GitHub Actions secrets by name only.
- Never weaken, disable, or bypass the secret-scanning workflow
  (`.github/workflows/secret-scan.yml`) or add ignore rules to it.
- Do not modify files under `.github/workflows/` unless the task explicitly
  asks for it.
- Anything shipped in the built site is public. Treat every file in this repo
  as if the repo were public.

## Working conventions

- Run `npm run build` and make sure it succeeds before considering a task
  done. Fix all build errors and Astro type warnings you introduce.
- Keep dependencies minimal. Prefer Astro built-ins over new packages; ask
  before adding a dependency that isn't clearly necessary.
- Accessibility matters: semantic HTML, alt texts, sufficient contrast,
  keyboard-navigable interactive elements.
- Site languages: German first, English optional later. Keep all UI strings
  in a central place so translation stays feasible.
- Commit messages: short imperative summary line, e.g. `Add events
  collection`, `Fix mobile navigation overlap`.
- Work happens on feature branches and reaches `main` only via pull request.
  Never push directly to `main`.

## Working with the project owner

- **Design changes are reviewed visually.** After any change to styling,
  layout or a block's appearance, tell the owner which pages to look at and
  what to look for, and keep the dev server (`npm run dev`) running so they
  can check it in the browser. A passing build is not sign-off on a design
  change.
- **The owner makes the commits.** Don't commit, merge or push on your own
  initiative — only when explicitly asked for that specific action.
- **Remind them to commit.** When a coherent piece of work is finished and
  has been reviewed, or when uncommitted changes have built up across several
  tasks, ask whether they want to commit now and suggest a commit message.
  Don't ask after every small edit.

## Branches and deployment

| Branch | Deploys to | Workflow | Base path |
| --- | --- | --- | --- |
| `main` | GitHub Pages: https://young-humanitarians.github.io/cyh-website/ | `.github/workflows/deploy.yml` (on push, or run manually) | `/cyh-website` |
| `dev` | Azure Static Web Apps preview: https://witty-bay-085d9b303.6.azurestaticapps.net | `.github/workflows/azure-static-web-apps-witty-bay-085d9b303.yml` (on push and on PRs into `dev`) | `/` |

- `dev` is the integration and preview branch. Feature branches are merged
  into `dev`; `dev` reaches `main` via pull request, and that publishes the
  site.
- Pull requests into `dev` get their own temporary Azure preview, which is
  removed when the PR closes.
- Every internal URL is built from `ASTRO_SITE` and `ASTRO_BASE`
  (`astro.config.mjs`). They default to the GitHub Pages values; the Azure
  workflow overrides them. Never hardcode the base path. Build internal
  links with `href()` from `src/lib/urls.ts` so that they work on both hosts.
- The Azure deployment authenticates with a GitHub Actions secret named
  `AZURE_STATIC_WEB_APPS_API_TOKEN_WITTY_BAY_085D9B303`. It is referenced by
  name only, and its value never belongs in any file.
- `.github/workflows/secret-scan.yml` scans for leaked secrets and must stay
  untouched (see Security rules).
- The production domain https://circleofyounghumanitarians.ch/ is still the
  old site, which is the visual reference. This repo does not deploy to it
  yet.
- Keystatic runs locally only (`npm run dev`, then `/keystatic`). Its routes
  need server rendering, so the integration is loaded in dev only and the
  production build stays fully static.
- A dev container (`.devcontainer/`) is provided for Codespaces, and
  `.vscode/` has launch and task configs for the Astro dev server.
