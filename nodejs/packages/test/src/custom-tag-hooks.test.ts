import { renderToString, RenderHooks } from 'treebark';
import { renderToReact, ReactRenderHooks } from 'treebark/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { jest } from '@jest/globals';

const createTier1CustomTagHooks = (): RenderHooks => {
  const definitions = {
    'person-pill': {
      attrs: ['data-person-id'],
      expand: (attrs: Record<string, unknown>, children: any[]) => ({
        span: { class: 'person-pill', ...attrs, $children: children }
      })
    },
    'calendar-event': {
      attrs: ['data-event-id'],
      expand: (attrs: Record<string, unknown>, children: any[]) => ({
        article: { class: 'calendar-event', ...attrs, $children: children }
      })
    }
  };

  return {
    expandTag: ({ tag, children, filterAttrs }) => {
      const definition = definitions[tag as keyof typeof definitions];
      if (!definition) return undefined;

      return definition.expand(filterAttrs(definition.attrs), children);
    }
  };
};

describe('Custom tag hooks (Tier 1 reference)', () => {
  test('expands custom tags through userland hooks', () => {
    const result = renderToString({
      template: {
        'person-pill': {
          'data-person-id': 'person-123',
          $children: ['Alex']
        }
      }
    } as any, { hooks: createTier1CustomTagHooks() });

    expect(result).toBe('<span class="person-pill" data-person-id="person-123">Alex</span>');
  });

  test('lets hook implementations strip attributes outside their allowlist', () => {
    const logger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
    const result = renderToString({
      template: {
        'person-pill': {
          onclick: 'alert("xss")',
          'data-person-id': 'person-123',
          $children: ['Alex']
        }
      }
    } as any, { logger, hooks: createTier1CustomTagHooks() });

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Attribute "onclick" is not allowed'));
    expect(result).toBe('<span class="person-pill" data-person-id="person-123">Alex</span>');
  });

  test('keeps unknown tags rejected when hooks do not expand them', () => {
    const logger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };

    const result = renderToString({
      template: { 'unknown-tag': 'Nope' }
    } as any, { logger, hooks: createTier1CustomTagHooks() });

    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith('Tag "unknown-tag" is not allowed');
  });

  test('detects cyclic hook expansions', () => {
    const logger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };

    const result = renderToString({
      template: { 'loop-tag': 'Nope' }
    } as any, {
      logger,
      hooks: {
        expandTag: () => ({ 'loop-tag': 'Nope' } as any)
      }
    });

    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Tag hook expansion for "loop-tag" is cyclic'));
  });
});

describe('Custom tag hooks (Tier 2 React reference)', () => {
  test('renders custom tags directly through a React hook', () => {
    const hooks: ReactRenderHooks = {
      renderTag: (args) => {
        if (args.tag !== 'person-pill') return undefined;

        const props = args.buildProps(args.filterAttrs(['data-person-id']), ['data-person-id']);
        return createElement('strong', { ...props, className: 'person-pill' }, ...args.renderChildren());
      }
    };

    const result = renderToStaticMarkup(renderToReact({
      template: {
        'person-pill': {
          'data-person-id': 'person-123',
          $children: ['Alex']
        }
      }
    } as any, { hooks }));

    expect(result).toBe('<strong data-person-id="person-123" class="person-pill">Alex</strong>');
  });

  test('falls back to Tier 1 expansion when the React hook does not render a tag', () => {
    const hooks: ReactRenderHooks = {
      ...createTier1CustomTagHooks(),
      renderTag: () => undefined
    };

    const result = renderToStaticMarkup(renderToReact({
      template: { 'calendar-event': { 'data-event-id': 'event-1', $children: ['Launch'] } }
    } as any, { hooks }));

    expect(result).toBe('<article class="calendar-event" data-event-id="event-1">Launch</article>');
  });
});
