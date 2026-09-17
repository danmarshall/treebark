// Standalone tag schema prototype. This module is not yet used by the renderers.

import { HTML_TAG_SCHEMA } from './html-tags.js';
import { SVG_TAG_SCHEMA } from './svg-tags.js';
import type { TagDefinition } from './tag-definition.js';
import type { SvgTagDefinition } from './svg-tags.js';

export type { TagDefinition } from './tag-definition.js';
export type { SvgTagDefinition } from './svg-tags.js';
export { HTML_TAG_SCHEMA } from './html-tags.js';
export { SVG_TAG_SCHEMA } from './svg-tags.js';

export type AnyTagDefinition = TagDefinition | SvgTagDefinition;

export const TAG_SCHEMA: Record<string, AnyTagDefinition> = {
  ...HTML_TAG_SCHEMA,
  ...SVG_TAG_SCHEMA
};

const tagEntries = Object.entries(TAG_SCHEMA);
const tagNames = new Map(tagEntries.map(([name, definition]) => [definition, name]));

export const SVG_TAG_NAMES = Object.keys(SVG_TAG_SCHEMA);
export const SVG_TAGS = new Set(SVG_TAG_NAMES);

export function getTagDefinition(tag: string): AnyTagDefinition | undefined {
  return TAG_SCHEMA[tag];
}

export function getTagName(definition: AnyTagDefinition): string | undefined {
  return tagNames.get(definition);
}

export function isAllowedParent(child: AnyTagDefinition, parent: AnyTagDefinition): boolean {
  return child.parents?.includes(parent) === true || (child.selfParent === true && child === parent);
}
