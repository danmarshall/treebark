import type { TagDefinition } from './tag-definition.js';

export type SvgTagDefinition = TagDefinition & {
  root?: true;
  svgChildren?: true;
};

const PRESENTATION_ATTRS = [
  'transform', 'fill', 'stroke', 'stroke-width', 'fill-rule', 'clip-rule',
  'opacity', 'fill-opacity', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'clip-path'
] as const;

const TEXT_ATTRS = [
  'x', 'y', 'dx', 'dy', ...PRESENTATION_ATTRS,
  'text-anchor', 'font-size', 'font-family'
] as const;

const svg = {
  root: true,
  svgChildren: true,
  attrs: ['viewBox', 'preserveAspectRatio', 'x', 'y', 'width', 'height']
} as const satisfies SvgTagDefinition;
const g = { svgChildren: true, attrs: PRESENTATION_ATTRS } as const satisfies SvgTagDefinition;
const defs = { svgChildren: true } as const satisfies SvgTagDefinition;
const symbol = {
  svgChildren: true,
  attrs: ['viewBox', 'preserveAspectRatio']
} as const satisfies SvgTagDefinition;
const clipPath = {
  svgChildren: true,
  attrs: ['transform', 'clipPathUnits']
} as const satisfies SvgTagDefinition;
const text = { attrs: TEXT_ATTRS } as const satisfies SvgTagDefinition;
const tspan = {
  parents: [text],
  selfParent: true,
  attrs: TEXT_ATTRS
} as const satisfies SvgTagDefinition;
const linearGradient = {
  attrs: ['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform', 'href']
} as const satisfies SvgTagDefinition;
const radialGradient = {
  attrs: ['cx', 'cy', 'r', 'fx', 'fy', 'gradientUnits', 'gradientTransform', 'href']
} as const satisfies SvgTagDefinition;
const stop = {
  parents: [linearGradient, radialGradient],
  attrs: ['offset', 'stop-color', 'stop-opacity']
} as const satisfies SvgTagDefinition;

export const SVG_TAG_SCHEMA = {
  svg,
  g,
  defs,
  symbol,
  clipPath,
  use: { attrs: ['href', 'x', 'y', 'width', 'height', 'transform', 'clip-path'] },
  path: { attrs: ['d', ...PRESENTATION_ATTRS] },
  rect: { attrs: ['x', 'y', 'width', 'height', 'rx', 'ry', ...PRESENTATION_ATTRS] },
  circle: { attrs: ['cx', 'cy', 'r', ...PRESENTATION_ATTRS] },
  ellipse: { attrs: ['cx', 'cy', 'rx', 'ry', ...PRESENTATION_ATTRS] },
  line: { attrs: ['x1', 'y1', 'x2', 'y2', ...PRESENTATION_ATTRS] },
  polyline: { attrs: ['points', ...PRESENTATION_ATTRS] },
  polygon: { attrs: ['points', ...PRESENTATION_ATTRS] },
  text,
  tspan,
  linearGradient,
  radialGradient,
  stop
} as const satisfies Record<string, SvgTagDefinition>;
