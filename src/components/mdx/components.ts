import Anchor from '~/components/mdx/Anchor.astro';

/**
 * Element overrides handed to every `<Content />` render, so that content
 * bodies behave the same wherever they are used.
 *
 * Spread as `<Content components={mdxComponents} />`.
 */
export const mdxComponents = {
  a: Anchor,
};
