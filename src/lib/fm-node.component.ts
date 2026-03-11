import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { AstNode } from 'flatmarkdown-ast';
import { RenderContext } from './types';
import { extractText } from './utils';

@Component({
  selector: 'fm-node',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:contents' },
  template: `
    @switch (node().type) {
      <!-- ── Block Nodes ── -->

      @case ('document') {
        @for (child of children(); track $index) {
          <fm-node [node]="child" [context]="context()" />
        }
      }

      @case ('paragraph') {
        @if (context().tightList) {
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        } @else {
          <p>
            @for (child of children(); track $index) {
              <fm-node [node]="child" [context]="context()" />
            }
          </p>
        }
      }

      @case ('heading') {
        <ng-template #headingContent>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </ng-template>
        @switch ($any(node()).level) {
          @case (1) { <h1><ng-container *ngTemplateOutlet="headingContent" /></h1> }
          @case (2) { <h2><ng-container *ngTemplateOutlet="headingContent" /></h2> }
          @case (3) { <h3><ng-container *ngTemplateOutlet="headingContent" /></h3> }
          @case (4) { <h4><ng-container *ngTemplateOutlet="headingContent" /></h4> }
          @case (5) { <h5><ng-container *ngTemplateOutlet="headingContent" /></h5> }
          @case (6) { <h6><ng-container *ngTemplateOutlet="headingContent" /></h6> }
        }
      }

      @case ('code_block') {
        <pre><code [class]="$any(node()).info ? 'language-' + $any(node()).info : null">{{ $any(node()).literal }}</code></pre>
      }

      @case ('block_quote') {
        <blockquote>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </blockquote>
      }

      @case ('multiline_block_quote') {
        <blockquote>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </blockquote>
      }

      @case ('list') {
        @if ($any(node()).list_type === 'ordered') {
          <ol [attr.start]="$any(node()).start != null && $any(node()).start !== 1 ? $any(node()).start : null">
            @for (child of children(); track $index) {
              <fm-node [node]="child" [context]="context()" />
            }
          </ol>
        } @else {
          <ul>
            @for (child of children(); track $index) {
              <fm-node [node]="child" [context]="context()" />
            }
          </ul>
        }
      }

      @case ('item') {
        <li>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="childContext({ tightList: $any(node()).tight })" />
          }
        </li>
      }

      @case ('task_item') {
        <li>
          <input type="checkbox" [checked]="$any(node()).symbol != null" disabled />
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="childContext({ tightList: true })" />
          }
        </li>
      }

      @case ('table') {
        <table>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="childContext({ tableAlignments: $any(node()).alignments })" />
          }
        </table>
      }

      @case ('table_row') {
        <tr>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="childContext({ inHeaderRow: $any(node()).header, cellIndex: $index })" />
          }
        </tr>
      }

      @case ('table_cell') {
        @if (context().inHeaderRow) {
          <th [attr.align]="cellAlignment()">
            @for (child of children(); track $index) {
              <fm-node [node]="child" [context]="context()" />
            }
          </th>
        } @else {
          <td [attr.align]="cellAlignment()">
            @for (child of children(); track $index) {
              <fm-node [node]="child" [context]="context()" />
            }
          </td>
        }
      }

      @case ('thematic_break') {
        <hr />
      }

      @case ('html_block') {
        <span [innerHTML]="$any(node()).literal"></span>
      }

      @case ('footnote_definition') {
        <div class="footnote" [id]="'fn-' + $any(node()).name">
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </div>
      }

      @case ('description_list') {
        <dl>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </dl>
      }

      @case ('description_item') {
        @for (child of children(); track $index) {
          <fm-node [node]="child" [context]="context()" />
        }
      }

      @case ('description_term') {
        <dt>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </dt>
      }

      @case ('description_details') {
        <dd>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </dd>
      }

      @case ('alert') {
        <div [class]="'alert alert-' + $any(node()).alert_type">
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </div>
      }

      @case ('front_matter') {
        <!-- front_matter is not rendered -->
      }

      @case ('heex_block') {
        @for (child of children(); track $index) {
          <fm-node [node]="child" [context]="context()" />
        }
      }

      @case ('subtext') {
        @for (child of children(); track $index) {
          <fm-node [node]="child" [context]="context()" />
        }
      }

      <!-- ── Inline Nodes ── -->

      @case ('text') {
        {{ $any(node()).value }}
      }

      @case ('softbreak') {
        {{ '\n' }}
      }

      @case ('linebreak') {
        <br />
      }

      @case ('emph') {
        <em>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </em>
      }

      @case ('strong') {
        <strong>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </strong>
      }

      @case ('strikethrough') {
        <del>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </del>
      }

      @case ('underline') {
        <u>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </u>
      }

      @case ('highlight') {
        <mark>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </mark>
      }

      @case ('superscript') {
        <sup>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </sup>
      }

      @case ('subscript') {
        <sub>
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </sub>
      }

      @case ('spoilered_text') {
        <span class="spoiler">
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </span>
      }

      @case ('code') {
        <code>{{ $any(node()).literal }}</code>
      }

      @case ('link') {
        <a [href]="$any(node()).url" [attr.title]="$any(node()).title || null">
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </a>
      }

      @case ('image') {
        <img [src]="$any(node()).url" [alt]="altText()" [attr.title]="$any(node()).title || null" />
      }

      @case ('wikilink') {
        <a [routerLink]="wikilinkRoute()"
           [class]="context().options.wikilink?.cssClass || null"
           data-wikilink="true">
          @for (child of children(); track $index) {
            <fm-node [node]="child" [context]="context()" />
          }
        </a>
      }

      @case ('hashtag') {
        <a [routerLink]="hashtagRoute()"
           [class]="context().options.hashtag?.cssClass || null"
           data-hashtag="true">{{ $any(node()).value }}</a>
      }

      @case ('footnote_reference') {
        <sup><a [href]="'#fn-' + $any(node()).name">{{ '[' + ($any(node()).ix + 1) + ']' }}</a></sup>
      }

      @case ('shortcode') {
        {{ $any(node()).emoji }}
      }

      @case ('math') {
        @if ($any(node()).display_math) {
          <pre><code class="math math-display">{{ $any(node()).literal }}</code></pre>
        } @else {
          <code class="math math-inline">{{ $any(node()).literal }}</code>
        }
      }

      @case ('html_inline') {
        <span [innerHTML]="$any(node()).value"></span>
      }

      @case ('heex_inline') {
        <span [innerHTML]="$any(node()).value"></span>
      }

      @case ('raw') {
        <span [innerHTML]="$any(node()).value"></span>
      }

      @case ('escaped') {
        <!-- escaped produces no output -->
      }

      @case ('escaped_tag') {
        {{ $any(node()).value }}
      }
    }
  `,
})
export class FmNodeComponent {
  readonly node = input.required<AstNode>();
  readonly context = input.required<RenderContext>();

  readonly children = computed(() => {
    const n = this.node();
    return 'children' in n && n.children ? n.children : [];
  });

  readonly cellAlignment = computed(() => {
    const ctx = this.context();
    const alignment = ctx.tableAlignments[ctx.cellIndex];
    return alignment && alignment !== 'none' ? alignment : null;
  });

  readonly altText = computed(() => extractText(this.node()));

  readonly wikilinkRoute = computed(() => {
    const n = this.node() as { url: string };
    const prefix = this.context().options.wikilink?.routerLinkPrefix ?? '';
    return prefix + n.url;
  });

  readonly hashtagRoute = computed(() => {
    const n = this.node() as { value: string };
    const prefix = this.context().options.hashtag?.routerLinkPrefix ?? '';
    return prefix + n.value;
  });

  childContext(overrides: Partial<RenderContext>): RenderContext {
    return { ...this.context(), ...overrides };
  }
}
