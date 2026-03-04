import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import type { AstNode } from 'flatmarkdown-ast';
import { AngularRenderOptions, RenderContext, defaultContext } from './types';
import { FmNodeComponent } from './fm-node.component';

@Component({
  selector: 'fm-root',
  standalone: true,
  imports: [FmNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:contents' },
  template: `
    @if (rootNode(); as root) {
      <fm-node [node]="root" [context]="rootContext()" />
    }
  `,
})
export class FmRootComponent {
  readonly ast = input.required<AstNode | string>();
  readonly options = input<AngularRenderOptions>({});

  readonly rootNode = computed<AstNode | null>(() => {
    const v = this.ast();
    if (!v) return null;
    return typeof v === 'string' ? JSON.parse(v) : v;
  });

  readonly rootContext = computed<RenderContext>(() => defaultContext(this.options()));
}
