import type { AstNode } from 'flatmarkdown-ast';

export function extractText(node: AstNode): string {
  if (node.type === 'text') return node.value;
  if ('children' in node && node.children) {
    return node.children.map(extractText).join('');
  }
  return '';
}
