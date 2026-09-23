import { href as withBase, isExternal } from '~/lib/urls';
import { GLOSSARY } from '~/lib/glossary';

/**
 * Renders the restricted inline markdown that structured content fields use:
 * `**bold**`, `*italic*`, `[text](/path)` and `[text](term:slug)`.
 *
 * Block-level markdown (headings, lists, tables) belongs in an MDX body, not
 * in a field — so this deliberately understands nothing else. Everything is
 * HTML-escaped first, then the three patterns are re-introduced, which means
 * an editor cannot inject markup through Keystatic.
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

/**
 * Ids have to be unique within a page for `aria-describedby` to resolve. A
 * module-level counter is enough: it only ever climbs during a build, so two
 * bubbles can never share one, including two uses of the same term on a page.
 */
let bubbleCount = 0;

/**
 * A term marked up as `[Zuversicht](term:zuversicht)`: the word itself, plus
 * the definition in a bubble that opens on hover and on keyboard focus.
 *
 * A <button> rather than a styled span, so it is focusable, announced as
 * operable, and openable by tap — hover alone would put the definition out of
 * reach of keyboard and touch users. The bubble is built from spans because
 * this markup is injected into a <p>, where only phrasing content is valid.
 */
function renderTerm(label: string, slug: string): string {
  const entry = GLOSSARY.get(slug);
  if (!entry) {
    console.warn(
      `inline(): no glossary entry "${slug}". Rendering "${label}" as plain text.`,
    );
    return label;
  }

  const id = `term-${slug}-${(bubbleCount += 1)}`;
  // Definitions render without term expansion, so a glossary entry that
  // mentions another term cannot recurse.
  const summary = entry.summary
    ? `<span class="term__summary">${inline(entry.summary, false)}</span>`
    : '';
  const body = entry.body
    .map((paragraph) => `<span class="term__para">${inline(paragraph, false)}</span>`)
    .join('');

  return (
    '<span class="term">' +
    `<button type="button" class="term__word" aria-describedby="${id}">${label}</button>` +
    `<span class="term__bubble" role="tooltip" id="${id}">` +
    `<span class="term__title">${escapeHtml(entry.term)}</span>` +
    summary +
    body +
    '</span>' +
    '</span>'
  );
}

/**
 * Only http(s), mailto, tel, root-relative and in-page targets are allowed.
 * Anything else (notably `javascript:`) collapses to "#".
 */
function safeHref(target: string): string {
  const trimmed = target.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^[#/]/.test(trimmed)) return withBase(trimmed);
  return '#';
}

export function inline(text: string, terms = true): string {
  let out = escapeHtml(text);

  // Links first, so emphasis inside a label still renders.
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, target: string) => {
    const term = /^term:(.+)$/.exec(target);
    if (term) return terms ? renderTerm(label, term[1] ?? '') : label;

    const resolved = safeHref(target);
    const external = isExternal(target) && !target.startsWith('#');
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${resolved}"${attrs}>${label}</a>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');

  return out;
}

/** Convenience for the common `paragraphs` field. */
export function inlineAll(texts: readonly string[]): string[] {
  // Not `texts.map(inline)`: that would pass the array index as `terms`.
  return texts.map((text) => inline(text));
}
