import { renderToString } from 'treebark';
import { renderToReact } from 'treebark/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { jest } from '@jest/globals';
import type { CustomTagDefinition, Logger } from 'treebark';

function mockLogger(): Logger & { error: jest.Mock; warn: jest.Mock; log: jest.Mock } {
  return { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
}

const personPill: CustomTagDefinition = {
  attrs: ['data-person-id'],
  expand: (attrs, children) => ({
    span: { class: 'person-pill', ...attrs, $children: children }
  })
};

describe('Custom tag expansion', () => {
  const template = {
    'person-pill': {
      'data-person-id': 'person-123',
      $children: ['Alex']
    }
  } as any;

  it('expands a registered custom tag in the string renderer', () => {
    const result = renderToString({ template }, { customTags: { 'person-pill': personPill } });
    expect(result).toBe('<span class="person-pill" data-person-id="person-123">Alex</span>');
  });

  it('expands a registered custom tag in the React renderer', () => {
    const node = renderToReact({ template }, { customTags: { 'person-pill': personPill } });
    const html = renderToStaticMarkup(node as any);
    expect(html).toBe('<span class="person-pill" data-person-id="person-123">Alex</span>');
  });

  it('supports interpolation of data within the expanded output', () => {
    const dataTemplate = {
      'person-pill': {
        'data-person-id': 'person-{{id}}',
        $children: ['{{name}}']
      }
    } as any;
    const result = renderToString(
      { template: dataTemplate, data: { id: '456', name: 'Jamie' } },
      { customTags: { 'person-pill': personPill } }
    );
    expect(result).toBe('<span class="person-pill" data-person-id="person-456">Jamie</span>');
  });

  it('renders built-in tags unchanged when no customTags option is supplied', () => {
    const result = renderToString({ template: { div: 'Hello world' } });
    expect(result).toBe('<div>Hello world</div>');
  });

  it('rejects unknown/unregistered tags even when customTags is supplied', () => {
    const logger = mockLogger();
    const result = renderToString(
      { template: { 'unknown-tag': 'x' } as any },
      { logger, customTags: { 'person-pill': personPill } }
    );
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Tag "unknown-tag" is not allowed'));
  });

  it('cannot override a built-in tag name', () => {
    const logger = mockLogger();
    const overrideAttempt: CustomTagDefinition = {
      expand: () => ({ span: 'hijacked' })
    };
    const result = renderToString(
      { template: { div: 'Hello world' } },
      { logger, customTags: { div: overrideAttempt } }
    );
    expect(result).toBe('<div>Hello world</div>');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('conflicts with a built-in tag'));
  });

  it('rejects custom tag names without a hyphen', () => {
    const logger = mockLogger();
    const noHyphen: CustomTagDefinition = {
      expand: () => ({ span: 'x' })
    };
    const result = renderToString(
      { template: { personpill: 'x' } as any },
      { logger, customTags: { personpill: noHyphen } }
    );
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('must contain a hyphen'));
  });

  it('strips attributes not present in the custom tag allowlist or global attrs', () => {
    const logger = mockLogger();
    const template2 = {
      'person-pill': {
        'data-person-id': 'person-123',
        'onclick': 'alert(1)',
        $children: ['Alex']
      }
    } as any;
    const result = renderToString({ template: template2 }, { logger, customTags: { 'person-pill': personPill } });
    expect(result).toBe('<span class="person-pill" data-person-id="person-123">Alex</span>');
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Attribute "onclick" is not allowed on tag "person-pill"'));
  });

  it('still allows global attrs (e.g. id, class, data-*, aria-*) on custom tags', () => {
    const template2 = {
      'person-pill': {
        id: 'p1',
        'aria-label': 'A person',
        'data-person-id': 'person-123',
        $children: ['Alex']
      }
    } as any;
    const result = renderToString({ template: template2 }, { customTags: { 'person-pill': personPill } });
    expect(result).toContain('id="p1"');
    expect(result).toContain('aria-label="A person"');
  });

  it('validates attribute values on the expanded output (e.g. blocks unsafe URL protocols)', () => {
    const linkPill: CustomTagDefinition = {
      attrs: ['href'],
      expand: (attrs, children) => ({ a: { ...attrs, $children: children } })
    };
    const logger = mockLogger();
    const template2 = { 'link-pill': { href: 'javascript:alert(1)', $children: ['click'] } } as any;
    const result = renderToString({ template: template2 }, { logger, customTags: { 'link-pill': linkPill } });
    expect(result).toBe('<a>click</a>');
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('blocked protocol'));
  });

  it('detects direct self-cyclic expansion and rejects it', () => {
    const logger = mockLogger();
    const cyclic: CustomTagDefinition = {
      expand: (attrs, children) => ({ 'cyclic-tag': { ...attrs, $children: children } } as any)
    };
    const result = renderToString(
      { template: { 'cyclic-tag': 'x' } as any },
      { logger, customTags: { 'cyclic-tag': cyclic } }
    );
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('cyclic'));
  });

  it('detects mutual (indirect) cyclic expansion and rejects it', () => {
    const logger = mockLogger();
    const tagA: CustomTagDefinition = { expand: () => ({ 'tag-b': 'x' } as any) };
    const tagB: CustomTagDefinition = { expand: () => ({ 'tag-a': 'x' } as any) };
    const result = renderToString(
      { template: { 'tag-a': 'x' } as any },
      { logger, customTags: { 'tag-a': tagA, 'tag-b': tagB } }
    );
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('cyclic'));
  });

  it('enforces a maximum expansion depth for long (non-cyclic) chains', () => {
    const logger = mockLogger();
    const customTags: Record<string, CustomTagDefinition> = {};
    for (let i = 0; i < 20; i++) {
      const next = i + 1;
      customTags[`chain-${i}`] = {
        expand: () => (i === 19 ? { span: 'end' } : ({ [`chain-${next}`]: 'x' } as any))
      };
    }
    const result = renderToString(
      { template: { 'chain-0': 'x' } as any },
      { logger, customTags }
    );
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('maximum expansion depth'));
  });

  it('allows one custom tag to expand into another (non-cyclic chain)', () => {
    const wrapper: CustomTagDefinition = {
      expand: (attrs, children) => ({ 'person-pill': { ...attrs, $children: children } } as any)
    };
    const result = renderToString(
      { template: { 'labeled-person': { 'data-person-id': 'p-1', $children: ['Sam'] } } as any },
      { customTags: { 'labeled-person': wrapper, 'person-pill': personPill } }
    );
    expect(result).toBe('<span class="person-pill" data-person-id="p-1">Sam</span>');
  });

  it('logs and drops the tag if the expand function throws', () => {
    const logger = mockLogger();
    const broken: CustomTagDefinition = {
      expand: () => { throw new Error('boom'); }
    };
    const result = renderToString(
      { template: { 'broken-tag': 'x' } as any },
      { logger, customTags: { 'broken-tag': broken } }
    );
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });
});
