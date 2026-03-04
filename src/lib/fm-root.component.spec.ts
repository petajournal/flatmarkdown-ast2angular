import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { AstNode } from 'flatmarkdown-ast';
import { FmRootComponent } from './fm-root.component';

describe('FmRootComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FmRootComponent],
      providers: [provideRouter([])],
    });
  });

  it('renders AST object', () => {
    const fixture = TestBed.createComponent(FmRootComponent);
    const ast: AstNode = {
      type: 'document',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
      ],
    };
    fixture.componentRef.setInput('ast', ast);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p')!.textContent).toContain('Hello');
  });

  it('parses JSON string input', () => {
    const fixture = TestBed.createComponent(FmRootComponent);
    const ast: AstNode = {
      type: 'document',
      children: [
        { type: 'heading', level: 1, setext: false, children: [{ type: 'text', value: 'Title' }] },
      ],
    };
    fixture.componentRef.setInput('ast', JSON.stringify(ast));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')!.textContent).toContain('Title');
  });

  it('passes options to context', () => {
    const fixture = TestBed.createComponent(FmRootComponent);
    const ast: AstNode = {
      type: 'document',
      children: [
        { type: 'wikilink', url: 'Page', children: [{ type: 'text', value: 'Link' }] },
      ],
    };
    fixture.componentRef.setInput('ast', ast);
    fixture.componentRef.setInput('options', {
      wikilink: { routerLinkPrefix: '/docs/', cssClass: 'my-link' },
    });
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('a[data-wikilink]');
    expect(a.getAttribute('href')).toBe('/docs/Page');
    expect(a.classList.contains('my-link')).toBe(true);
  });
});
