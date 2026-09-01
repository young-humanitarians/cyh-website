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
