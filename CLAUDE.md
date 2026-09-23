# Website – Circle of Young Humanitarians

Public website of the Circle of Young Humanitarians, a Swiss non-profit youth
humanitarian organization. Static site built with Astro, deployed to GitHub
Pages via GitHub Actions. Content is edited by non-technical volunteers
through Keystatic.

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
  letter-spacing, no scroll animations.
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
