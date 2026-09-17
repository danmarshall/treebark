import type { TagDefinition } from './tag-definition.js';

const ul: TagDefinition = {};
const ol: TagDefinition = {};
const li = { parents: [ul, ol] } as const satisfies TagDefinition;

const table = { attrs: ['summary'] } as const satisfies TagDefinition;
const thead = { parents: [table] } as const satisfies TagDefinition;
const tbody = { parents: [table] } as const satisfies TagDefinition;
const tr = { parents: [table, thead, tbody] } as const satisfies TagDefinition;
const th = { parents: [tr], attrs: ['scope', 'colspan', 'rowspan'] } as const satisfies TagDefinition;
const td = { parents: [tr], attrs: ['scope', 'colspan', 'rowspan'] } as const satisfies TagDefinition;

const comment = { special: true } as const satisfies TagDefinition;
const conditional = { special: true } as const satisfies TagDefinition;

export const HTML_TAG_SCHEMA = {
  div: {}, span: {}, p: {}, header: {}, footer: {}, main: {}, section: {}, article: {},
  h1: {}, h2: {}, h3: {}, h4: {}, h5: {}, h6: {}, strong: {}, em: {},
  blockquote: { attrs: ['cite'] }, code: {}, pre: {},
  ul, ol, li,
  table, thead, tbody, tr, th, td,
  a: { attrs: ['href', 'target', 'rel'] },
  img: { attrs: ['src', 'alt', 'width', 'height'], void: true },
  br: { void: true },
  hr: { void: true },
  '$comment': comment,
  '$if': conditional
} as const satisfies Record<string, TagDefinition>;
