# flatmarkdown-ast2angular

Render [FlatMarkdown](https://github.com/petajournal/flatmarkdown) AST as native Angular components, with `routerLink` support for wikilinks.

## Installation

```bash
npm install flatmarkdown-ast2angular flatmarkdown-ast
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/router` (^21.0.0), `flatmarkdown-ast` (^0.1.0).

## Usage

Import `FmRootComponent` in your component:

```typescript
import { Component } from '@angular/core';
import { FmRootComponent } from 'flatmarkdown-ast2angular';
import type { AstNode } from 'flatmarkdown-ast';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [FmRootComponent],
  template: `<fm-root [ast]="ast" [options]="options" />`,
})
export class ArticleComponent {
  ast: AstNode = { type: 'document', children: [] };
  options = {
    wikilink: {
      routerLinkPrefix: '/wiki/',
      cssClass: 'wiki-link',
    },
  };
}
```

`FmRootComponent` accepts:
- `ast` — An `AstNode` object or a JSON string of the AST.
- `options` — Optional `AngularRenderOptions`.

## AngularRenderOptions

```typescript
interface AngularRenderOptions {
  wikilink?: {
    /** Prefix prepended to the wikilink url for routerLink. Default: '' */
    routerLinkPrefix?: string;
    /** CSS class applied to wikilink anchors. */
    cssClass?: string;
  };
}
```

Wikilinks are rendered as `<a [routerLink]="route" data-wikilink="true">` enabling SPA navigation. All other links use standard `<a href>`.

## License

MIT
