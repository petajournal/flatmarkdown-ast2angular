import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { AstNode } from 'flatmarkdown-ast';
import { FmNodeComponent } from './fm-node.component';
import { defaultContext, RenderContext } from './types';

describe('FmNodeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FmNodeComponent],
      providers: [provideRouter([])],
    });
  });

  function render(node: AstNode, ctx?: RenderContext): HTMLElement {
    const fixture = TestBed.createComponent(FmNodeComponent);
    fixture.componentRef.setInput('node', node);
    fixture.componentRef.setInput('context', ctx ?? defaultContext());
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  // ── Block Nodes ──

  describe('document', () => {
    it('renders children', () => {
      const el = render({
        type: 'document',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: 'hello' }] },
        ],
      });
      expect(el.querySelector('p')!.textContent).toContain('hello');
    });
  });

  describe('paragraph', () => {
    it('wraps in <p>', () => {
      const el = render({
        type: 'paragraph',
        children: [{ type: 'text', value: 'test' }],
      });
      expect(el.querySelector('p')).toBeTruthy();
      expect(el.querySelector('p')!.textContent).toContain('test');
    });

    it('omits <p> in tight list', () => {
      const el = render(
        { type: 'paragraph', children: [{ type: 'text', value: 'tight' }] },
        { ...defaultContext(), tightList: true },
      );
      expect(el.querySelector('p')).toBeNull();
      expect(el.textContent).toContain('tight');
    });
  });

  describe('heading', () => {
    for (let level = 1; level <= 6; level++) {
      it(`renders <h${level}>`, () => {
        const el = render({
          type: 'heading',
          level,
          setext: false,
          children: [{ type: 'text', value: `Heading ${level}` }],
        });
        const h = el.querySelector(`h${level}`);
        expect(h).toBeTruthy();
        expect(h!.textContent).toContain(`Heading ${level}`);
      });
    }
  });

  describe('code_block', () => {
    it('renders <pre><code>', () => {
      const el = render({ type: 'code_block', fenced: true, info: '', literal: 'let x = 1;' });
      const code = el.querySelector('pre > code');
      expect(code).toBeTruthy();
      expect(code!.textContent).toBe('let x = 1;');
    });

    it('adds language class from info', () => {
      const el = render({ type: 'code_block', fenced: true, info: 'typescript', literal: 'const x = 1;' });
      const code = el.querySelector('code');
      expect(code!.className).toBe('language-typescript');
    });

    it('no class when info is empty', () => {
      const el = render({ type: 'code_block', fenced: true, info: '', literal: 'x' });
      const code = el.querySelector('code');
      expect(code!.className).toBe('');
    });
  });

  describe('block_quote', () => {
    it('renders <blockquote>', () => {
      const el = render({
        type: 'block_quote',
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'quoted' }] }],
      });
      expect(el.querySelector('blockquote')).toBeTruthy();
      expect(el.querySelector('blockquote p')!.textContent).toContain('quoted');
    });
  });

  describe('multiline_block_quote', () => {
    it('renders <blockquote>', () => {
      const el = render({
        type: 'multiline_block_quote',
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'multi' }] }],
      });
      expect(el.querySelector('blockquote')).toBeTruthy();
    });
  });

  describe('list', () => {
    it('renders <ul> for unordered', () => {
      const el = render({
        type: 'list',
        list_type: 'bullet',
        start: null,
        tight: false,
        delimiter: '',
        children: [
          { type: 'item', list_type: 'bullet', start: 0, tight: false, children: [{ type: 'paragraph', children: [{ type: 'text', value: 'item1' }] }] },
        ],
      });
      expect(el.querySelector('ul')).toBeTruthy();
      expect(el.querySelector('li')).toBeTruthy();
    });

    it('renders <ol> for ordered', () => {
      const el = render({
        type: 'list',
        list_type: 'ordered',
        start: 1,
        tight: false,
        delimiter: '.',
        children: [
          { type: 'item', list_type: 'ordered', start: 1, tight: false, children: [{ type: 'paragraph', children: [{ type: 'text', value: 'first' }] }] },
        ],
      });
      expect(el.querySelector('ol')).toBeTruthy();
    });

    it('sets start attribute when not 1', () => {
      const el = render({
        type: 'list',
        list_type: 'ordered',
        start: 3,
        tight: false,
        delimiter: '.',
        children: [
          { type: 'item', list_type: 'ordered', start: 3, tight: false, children: [{ type: 'paragraph', children: [{ type: 'text', value: 'third' }] }] },
        ],
      });
      expect(el.querySelector('ol')!.getAttribute('start')).toBe('3');
    });
  });

  describe('item', () => {
    it('renders <li> and passes tight context', () => {
      const el = render({
        type: 'item',
        list_type: 'bullet',
        start: 0,
        tight: true,
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'tight item' }] }],
      });
      const li = el.querySelector('li');
      expect(li).toBeTruthy();
      // tight=true: paragraph should NOT be wrapped in <p>
      expect(li!.querySelector('p')).toBeNull();
      expect(li!.textContent).toContain('tight item');
    });
  });

  describe('task_item', () => {
    it('renders unchecked checkbox', () => {
      const el = render({
        type: 'task_item',
        symbol: null,
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'todo' }] }],
      });
      const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeTruthy();
      expect(checkbox.checked).toBe(false);
      expect(checkbox.disabled).toBe(true);
    });

    it('renders checked checkbox', () => {
      const el = render({
        type: 'task_item',
        symbol: 'x',
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'done' }] }],
      });
      const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('table', () => {
    const tableNode: AstNode = {
      type: 'table',
      alignments: ['left', 'center', 'none'],
      num_columns: 3,
      num_rows: 2,
      children: [
        {
          type: 'table_row',
          header: true,
          children: [
            { type: 'table_cell', children: [{ type: 'text', value: 'H1' }] },
            { type: 'table_cell', children: [{ type: 'text', value: 'H2' }] },
            { type: 'table_cell', children: [{ type: 'text', value: 'H3' }] },
          ],
        },
        {
          type: 'table_row',
          header: false,
          children: [
            { type: 'table_cell', children: [{ type: 'text', value: 'A' }] },
            { type: 'table_cell', children: [{ type: 'text', value: 'B' }] },
            { type: 'table_cell', children: [{ type: 'text', value: 'C' }] },
          ],
        },
      ],
    };

    it('renders <table>', () => {
      const el = render(tableNode);
      expect(el.querySelector('table')).toBeTruthy();
    });

    it('header row uses <th>', () => {
      const el = render(tableNode);
      const ths = el.querySelectorAll('th');
      expect(ths.length).toBe(3);
      expect(ths[0].textContent).toContain('H1');
    });

    it('body row uses <td>', () => {
      const el = render(tableNode);
      const tds = el.querySelectorAll('td');
      expect(tds.length).toBe(3);
      expect(tds[0].textContent).toContain('A');
    });

    it('applies alignment', () => {
      const el = render(tableNode);
      const ths = el.querySelectorAll('th');
      expect(ths[0].getAttribute('align')).toBe('left');
      expect(ths[1].getAttribute('align')).toBe('center');
      expect(ths[2].getAttribute('align')).toBeNull(); // 'none' → no align
    });
  });

  describe('thematic_break', () => {
    it('renders <hr>', () => {
      const el = render({ type: 'thematic_break' });
      expect(el.querySelector('hr')).toBeTruthy();
    });
  });

  describe('html_block', () => {
    it('passes through HTML via innerHTML', () => {
      const el = render({ type: 'html_block', block_type: 6, literal: '<div class="custom">hi</div>' });
      expect(el.querySelector('.custom')).toBeTruthy();
    });
  });

  describe('footnote_definition', () => {
    it('renders div with id', () => {
      const el = render({
        type: 'footnote_definition',
        name: 'note1',
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'footnote text' }] }],
      });
      const div = el.querySelector('div.footnote');
      expect(div).toBeTruthy();
      expect(div!.id).toBe('fn-note1');
    });
  });

  describe('description_list', () => {
    it('renders dl/dt/dd', () => {
      const el = render({
        type: 'description_list',
        children: [
          {
            type: 'description_item',
            children: [
              { type: 'description_term', children: [{ type: 'text', value: 'Term' }] },
              { type: 'description_details', children: [{ type: 'text', value: 'Details' }] },
            ],
          },
        ],
      });
      expect(el.querySelector('dl')).toBeTruthy();
      expect(el.querySelector('dt')!.textContent).toContain('Term');
      expect(el.querySelector('dd')!.textContent).toContain('Details');
    });
  });

  describe('alert', () => {
    it('renders div with alert class', () => {
      const el = render({
        type: 'alert',
        alert_type: 'warning',
        title: null,
        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Careful!' }] }],
      });
      const div = el.querySelector('div.alert.alert-warning');
      expect(div).toBeTruthy();
    });
  });

  describe('front_matter', () => {
    it('renders nothing', () => {
      const el = render({ type: 'front_matter', value: 'title: hello' });
      expect(el.textContent!.trim()).toBe('');
    });
  });

  describe('heex_block', () => {
    it('renders children', () => {
      const el = render({
        type: 'heex_block',
        children: [{ type: 'text', value: 'heex' }],
      });
      expect(el.textContent).toContain('heex');
    });
  });

  describe('subtext', () => {
    it('renders children', () => {
      const el = render({
        type: 'subtext',
        children: [{ type: 'text', value: 'sub' }],
      });
      expect(el.textContent).toContain('sub');
    });
  });

  // ── Inline Nodes ──

  describe('text', () => {
    it('renders value', () => {
      const el = render({ type: 'text', value: 'hello world' });
      expect(el.textContent).toContain('hello world');
    });
  });

  describe('softbreak', () => {
    it('renders newline', () => {
      const el = render({ type: 'softbreak' });
      expect(el.textContent).toContain('\n');
    });
  });

  describe('linebreak', () => {
    it('renders <br>', () => {
      const el = render({ type: 'linebreak' });
      expect(el.querySelector('br')).toBeTruthy();
    });
  });

  describe('emph', () => {
    it('renders <em>', () => {
      const el = render({
        type: 'emph',
        children: [{ type: 'text', value: 'italic' }],
      });
      const em = el.querySelector('em');
      expect(em).toBeTruthy();
      expect(em!.textContent).toContain('italic');
    });
  });

  describe('strong', () => {
    it('renders <strong>', () => {
      const el = render({
        type: 'strong',
        children: [{ type: 'text', value: 'bold' }],
      });
      expect(el.querySelector('strong')!.textContent).toContain('bold');
    });
  });

  describe('strikethrough', () => {
    it('renders <del>', () => {
      const el = render({
        type: 'strikethrough',
        children: [{ type: 'text', value: 'deleted' }],
      });
      expect(el.querySelector('del')!.textContent).toContain('deleted');
    });
  });

  describe('underline', () => {
    it('renders <u>', () => {
      const el = render({
        type: 'underline',
        children: [{ type: 'text', value: 'underlined' }],
      });
      expect(el.querySelector('u')!.textContent).toContain('underlined');
    });
  });

  describe('highlight', () => {
    it('renders <mark>', () => {
      const el = render({
        type: 'highlight',
        children: [{ type: 'text', value: 'highlighted' }],
      });
      expect(el.querySelector('mark')!.textContent).toContain('highlighted');
    });
  });

  describe('superscript', () => {
    it('renders <sup>', () => {
      const el = render({
        type: 'superscript',
        children: [{ type: 'text', value: '2' }],
      });
      expect(el.querySelector('sup')!.textContent).toContain('2');
    });
  });

  describe('subscript', () => {
    it('renders <sub>', () => {
      const el = render({
        type: 'subscript',
        children: [{ type: 'text', value: '2' }],
      });
      expect(el.querySelector('sub')!.textContent).toContain('2');
    });
  });

  describe('spoilered_text', () => {
    it('renders <span class="spoiler">', () => {
      const el = render({
        type: 'spoilered_text',
        children: [{ type: 'text', value: 'secret' }],
      });
      const span = el.querySelector('span.spoiler');
      expect(span).toBeTruthy();
      expect(span!.textContent).toContain('secret');
    });
  });

  describe('code', () => {
    it('renders <code>', () => {
      const el = render({ type: 'code', literal: 'x++' });
      const code = el.querySelector('code');
      expect(code).toBeTruthy();
      expect(code!.textContent).toBe('x++');
    });
  });

  describe('link', () => {
    it('renders <a> with href', () => {
      const el = render({
        type: 'link',
        url: 'https://example.com',
        title: 'Example',
        children: [{ type: 'text', value: 'click' }],
      });
      const a = el.querySelector('a');
      expect(a).toBeTruthy();
      expect(a!.getAttribute('href')).toBe('https://example.com');
      expect(a!.getAttribute('title')).toBe('Example');
      expect(a!.textContent).toContain('click');
    });

    it('omits title when empty', () => {
      const el = render({
        type: 'link',
        url: 'https://example.com',
        title: '',
        children: [{ type: 'text', value: 'link' }],
      });
      expect(el.querySelector('a')!.getAttribute('title')).toBeNull();
    });
  });

  describe('image', () => {
    it('renders <img> with src and alt', () => {
      const el = render({
        type: 'image',
        url: 'pic.png',
        title: 'Photo',
        children: [{ type: 'text', value: 'alt text' }],
      });
      const img = el.querySelector('img');
      expect(img).toBeTruthy();
      expect(img!.getAttribute('src')).toBe('pic.png');
      expect(img!.getAttribute('alt')).toBe('alt text');
      expect(img!.getAttribute('title')).toBe('Photo');
    });
  });

  describe('wikilink', () => {
    it('renders <a> with data-wikilink', () => {
      const el = render({
        type: 'wikilink',
        url: 'MyPage',
        children: [{ type: 'text', value: 'My Page' }],
      });
      const a = el.querySelector('a[data-wikilink]');
      expect(a).toBeTruthy();
      expect(a!.textContent).toContain('My Page');
    });

    it('uses routerLinkPrefix from options', () => {
      const ctx = defaultContext({ wikilink: { routerLinkPrefix: '/wiki/' } });
      const el = render(
        { type: 'wikilink', url: 'MyPage', children: [{ type: 'text', value: 'link' }] },
        ctx,
      );
      const a = el.querySelector('a[data-wikilink]');
      expect(a!.getAttribute('href')).toBe('/wiki/MyPage');
    });

    it('default prefix is empty string', () => {
      const el = render({
        type: 'wikilink',
        url: 'MyPage',
        children: [{ type: 'text', value: 'link' }],
      });
      const a = el.querySelector('a[data-wikilink]');
      expect(a!.getAttribute('href')).toBe('/MyPage');
    });

    it('applies cssClass', () => {
      const ctx = defaultContext({ wikilink: { cssClass: 'wiki-link' } });
      const el = render(
        { type: 'wikilink', url: 'Page', children: [{ type: 'text', value: 'P' }] },
        ctx,
      );
      const a = el.querySelector('a[data-wikilink]');
      expect(a!.classList.contains('wiki-link')).toBe(true);
    });
  });

  describe('hashtag', () => {
    it('renders <a> with data-hashtag', () => {
      const el = render({
        type: 'hashtag',
        value: 'tag1',
      });
      const a = el.querySelector('a[data-hashtag]');
      expect(a).toBeTruthy();
      expect(a!.textContent).toContain('#tag1');
    });

    it('uses routerLinkPrefix from hashtag options', () => {
      const ctx = defaultContext({ hashtag: { routerLinkPrefix: '/tags/' } });
      const el = render(
        { type: 'hashtag', value: 'mytag' },
        ctx,
      );
      const a = el.querySelector('a[data-hashtag]');
      expect(a!.getAttribute('href')).toBe('/tags/mytag');
    });

    it('default prefix is empty string', () => {
      const el = render({
        type: 'hashtag',
        value: 'mytag',
      });
      const a = el.querySelector('a[data-hashtag]');
      expect(a!.getAttribute('href')).toBe('/mytag');
    });

    it('applies cssClass from hashtag options', () => {
      const ctx = defaultContext({ hashtag: { cssClass: 'hashtag-link' } });
      const el = render(
        { type: 'hashtag', value: 'tag' },
        ctx,
      );
      const a = el.querySelector('a[data-hashtag]');
      expect(a!.classList.contains('hashtag-link')).toBe(true);
    });
  });

  describe('footnote_reference', () => {
    it('renders superscript link', () => {
      const el = render({ type: 'footnote_reference', name: 'fn1', ref_num: 1, ix: 0 });
      const a = el.querySelector('sup > a');
      expect(a).toBeTruthy();
      expect(a!.getAttribute('href')).toBe('#fn-fn1');
      expect(a!.textContent).toContain('[1]');
    });

    it('uses ix+1 for display number', () => {
      const el = render({ type: 'footnote_reference', name: 'fn2', ref_num: 2, ix: 4 });
      expect(el.querySelector('sup > a')!.textContent).toContain('[5]');
    });
  });

  describe('shortcode', () => {
    it('renders emoji', () => {
      const el = render({ type: 'shortcode', code: 'smile', emoji: '😊' });
      expect(el.textContent).toContain('😊');
    });
  });

  describe('math', () => {
    it('renders display math in <pre><code>', () => {
      const el = render({ type: 'math', dollar_math: true, display_math: true, literal: 'E=mc^2' });
      const code = el.querySelector('pre > code.math.math-display');
      expect(code).toBeTruthy();
      expect(code!.textContent).toBe('E=mc^2');
    });

    it('renders inline math in <code>', () => {
      const el = render({ type: 'math', dollar_math: true, display_math: false, literal: 'x^2' });
      const code = el.querySelector('code.math.math-inline');
      expect(code).toBeTruthy();
      expect(code!.textContent).toBe('x^2');
      expect(el.querySelector('pre')).toBeNull();
    });
  });

  describe('html_inline', () => {
    it('passes through HTML via innerHTML', () => {
      const el = render({ type: 'html_inline', value: '<b>bold</b>' });
      expect(el.querySelector('b')!.textContent).toBe('bold');
    });
  });

  describe('heex_inline', () => {
    it('passes through via innerHTML', () => {
      const el = render({ type: 'heex_inline', value: '<i>italic</i>' });
      expect(el.querySelector('i')).toBeTruthy();
    });
  });

  describe('raw', () => {
    it('passes through via innerHTML', () => {
      const el = render({ type: 'raw', value: '<span>raw</span>' });
      expect(el.querySelector('span')!.textContent).toBe('raw');
    });
  });

  describe('escaped', () => {
    it('renders nothing', () => {
      const el = render({ type: 'escaped' });
      expect(el.textContent!.trim()).toBe('');
    });
  });

  describe('escaped_tag', () => {
    it('renders escaped value as text', () => {
      const el = render({ type: 'escaped_tag', value: '<div>' });
      expect(el.textContent).toContain('<div>');
      expect(el.querySelector('div')).toBeNull();
    });
  });
});
