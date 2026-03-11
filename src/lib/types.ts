import type { AstNode } from 'flatmarkdown-ast';

export interface WikiLinkAngularOptions {
  /** Prefix prepended to the wikilink url for routerLink. Default: '' */
  routerLinkPrefix?: string;
  /** CSS class applied to wikilink anchors. */
  cssClass?: string;
}

export interface HashtagAngularOptions {
  /** Prefix prepended to the hashtag value for routerLink. Default: '' */
  routerLinkPrefix?: string;
  /** CSS class applied to hashtag anchors. */
  cssClass?: string;
}

export interface AngularRenderOptions {
  wikilink?: WikiLinkAngularOptions;
  hashtag?: HashtagAngularOptions;
}

export interface RenderContext {
  options: AngularRenderOptions;
  inHeaderRow: boolean;
  tableAlignments: string[];
  cellIndex: number;
  tightList: boolean;
}

export function defaultContext(options: AngularRenderOptions = {}): RenderContext {
  return {
    options,
    inHeaderRow: false,
    tableAlignments: [],
    cellIndex: 0,
    tightList: false,
  };
}
