import type { Example } from './types.js';

// Registers a "person-pill" custom tag (Tier 1 - template expansion) that
// expands into a plain built-in-tag template, so it renders consistently
// across the string, DOM, and React renderers.
export const customTag: Example = {
  template: {
    div: {
      class: 'people',
      $children: [
        { 'person-pill': { 'data-person-id': 'person-123', $children: ['Alex'] } },
        { 'person-pill': { 'data-person-id': 'person-456', $children: ['Sam'] } }
      ]
    }
  } as any,
  data: {},
  customTags: {
    'person-pill': {
      attrs: ['data-person-id'],
      expand: (attrs, children) => ({
        span: { class: 'person-pill', ...attrs, $children: children }
      })
    }
  }
};
