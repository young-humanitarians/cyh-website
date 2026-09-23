import { href as withBase, isExternal } from '~/lib/urls';

/**
 * Renders the restricted inline markdown that structured content fields use:
 * `**bold**`, `*italic*` and `[text](/path)`.
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
 * Only http(s), mailto, tel, root-relative and in-page targets are allowed.
 * Anything else (notably `javascript:`) collapses to "#".
 */
function safeHref(target: string): string {
  const trimmed = target.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^[#/]/.test(trimmed)) return withBase(trimmed);
  return '#';
}

export function inline(text: string): string {
  let out = escapeHtml(text);

  // Links first, so emphasis inside a label still renders.
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, target: string) => {
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
  return texts.map(inline);
}
