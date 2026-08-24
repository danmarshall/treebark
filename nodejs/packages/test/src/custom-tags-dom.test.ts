/**
 * @jest-environment jsdom
 */
import { renderToDOM } from 'treebark';
import type { CustomTagDefinition } from 'treebark';

const personPill: CustomTagDefinition = {
  attrs: ['data-person-id'],
  expand: (attrs, children) => ({
    span: { class: 'person-pill', ...attrs, $children: children }
  })
};

describe('Custom tag expansion (DOM renderer)', () => {
  it('expands a registered custom tag in the DOM renderer', () => {
    const template = {
      'person-pill': {
        'data-person-id': 'person-123',
        $children: ['Alex']
      }
    } as any;
    const fragment = renderToDOM({ template }, { customTags: { 'person-pill': personPill } });
    const span = fragment.firstChild as HTMLElement;
    expect(span.tagName).toBe('SPAN');
    expect(span.className).toBe('person-pill');
    expect(span.getAttribute('data-person-id')).toBe('person-123');
    expect(span.textContent).toBe('Alex');
  });
});
