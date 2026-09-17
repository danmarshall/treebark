// Type definitions for treebark templates
// This file contains only type definitions, no executable code

import type { HTML_TAG_SCHEMA } from './html-tags.js';
import type { SVG_TAG_SCHEMA } from './svg-tags.js';

// Data type for template rendering - accepts any value
export type Data = unknown;

// Primitive value type for attribute values
export type PrimitiveValue = string | number | boolean;

// Property path for $bind - a string representing a data property path
// Examples: ".", "products", "config.userList"
export type BindPath = string;

// String that may contain interpolation syntax with {{...}}
// Examples: "Hello {{name}}", "Price: {{product.price}}", "{{..parentProp}}"
export type InterpolatedString = string;

// Forward declaration for recursive types
export type TemplateObject = IfTag | RegularTags;
export type TemplateElement = InterpolatedString | TemplateObject;

// Generic conditional type shared by $if tag and conditional attribute values
export type ConditionalBase<T> = {
  $check: BindPath;
  $then: T;
  $else?: T;
  // Comparison operators (require numbers)
  '$<'?: number;
  '$>'?: number;
  '$<='?: number;
  '$>='?: number;
  // Equality operators (can compare any value)
  '$='?: PrimitiveValue;
  $in?: PrimitiveValue[];
  // Modifiers
  $not?: boolean;
  $join?: 'AND' | 'OR';
};

// Conditional type for $if tag - T can be string or TemplateObject
export type ConditionalValueOrTemplate = ConditionalBase<InterpolatedString | TemplateObject>;

// Conditional value type for attribute values - T is restricted to primitives
export type ConditionalValue = ConditionalBase<InterpolatedString>;

// CSS Style properties as an object with kebab-case property names
// Accepts any valid CSS property name (kebab-case format)
export type CSSProperties = {
  [property: string]: string;
};

export type AttributeValue = InterpolatedString | ConditionalValue;

// Style value can be a CSSProperties object or a conditional that returns CSSProperties
export type StyleValue = CSSProperties | ConditionalBase<CSSProperties>;

type HtmlTag = keyof typeof HTML_TAG_SCHEMA;
export type SvgTag = keyof typeof SVG_TAG_SCHEMA;

type TagsWith<Schema, Property extends PropertyKey> = {
  [Tag in keyof Schema]: Property extends keyof Schema[Tag] ? Tag : never
}[keyof Schema];

export type VoidTag = TagsWith<typeof HTML_TAG_SCHEMA, 'void'>;
export type SpecialTag = TagsWith<typeof HTML_TAG_SCHEMA, 'special'>;
export type ContainerTag = Exclude<HtmlTag, VoidTag | SpecialTag> | SvgTag;

export type AllowedTag = ContainerTag | VoidTag | SpecialTag;

// Helper type for tag content (avoids repetition)
type TagContent<Attrs> = InterpolatedString | (InterpolatedString | TemplateObject)[] | Attrs;

// Global attributes that can be used on any tag
type GlobalAttrs = {
  id?: AttributeValue;
  class?: AttributeValue;
  style?: StyleValue;
  title?: AttributeValue;
  role?: AttributeValue;
  tabindex?: AttributeValue;
  [key: `data-${string}`]: AttributeValue;
  [key: `aria-${string}`]: AttributeValue;
};

// Base attributes for container tags (can have children)
type BaseContainerAttrs = GlobalAttrs & {
  $bind?: BindPath;
  $children?: (InterpolatedString | TemplateObject)[];
};

// Base attributes for void tags (no children allowed)
type BaseVoidAttrs = GlobalAttrs & {
  $bind?: BindPath;
};

type SvgGlobalAttrs = {
  id?: AttributeValue;
  role?: AttributeValue;
  style?: StyleValue;
  [key: `aria-${string}`]: AttributeValue;
};
type SvgElementAttrs<Attrs> = SvgGlobalAttrs & Attrs & {
  $bind?: BindPath;
  $children?: (InterpolatedString | TemplateObject)[];
};

type DeclaredAttrs<Definition, Value> = Definition extends { attrs: readonly string[] }
  ? { [Key in Definition['attrs'][number]]?: Value }
  : {};

type HtmlTagElement<Tag extends HtmlTag> = Tag extends HtmlTag ? {
  [Key in Tag]: TagContent<
    ((typeof HTML_TAG_SCHEMA)[Tag] extends { void: true } ? BaseVoidAttrs : BaseContainerAttrs)
    & DeclaredAttrs<(typeof HTML_TAG_SCHEMA)[Tag], string>
  >
} : never;

type SvgElement<Tag extends SvgTag> = Tag extends SvgTag ? {
  [Key in Tag]: TagContent<SvgElementAttrs<DeclaredAttrs<(typeof SVG_TAG_SCHEMA)[Tag], AttributeValue>>>
} : never;

// Tag-specific types with attributes included
export type DivTag = HtmlTagElement<'div'>;
export type SpanTag = HtmlTagElement<'span'>;
export type PTag = HtmlTagElement<'p'>;
export type HeaderTag = HtmlTagElement<'header'>;
export type FooterTag = HtmlTagElement<'footer'>;
export type MainTag = HtmlTagElement<'main'>;
export type SectionTag = HtmlTagElement<'section'>;
export type ArticleTag = HtmlTagElement<'article'>;
export type H1Tag = HtmlTagElement<'h1'>;
export type H2Tag = HtmlTagElement<'h2'>;
export type H3Tag = HtmlTagElement<'h3'>;
export type H4Tag = HtmlTagElement<'h4'>;
export type H5Tag = HtmlTagElement<'h5'>;
export type H6Tag = HtmlTagElement<'h6'>;
export type StrongTag = HtmlTagElement<'strong'>;
export type EmTag = HtmlTagElement<'em'>;
export type BlockquoteTag = HtmlTagElement<'blockquote'>;
export type CodeTag = HtmlTagElement<'code'>;
export type PreTag = HtmlTagElement<'pre'>;
export type UlTag = HtmlTagElement<'ul'>;
export type OlTag = HtmlTagElement<'ol'>;
export type LiTag = HtmlTagElement<'li'>;
export type TableTag = HtmlTagElement<'table'>;
export type TheadTag = HtmlTagElement<'thead'>;
export type TbodyTag = HtmlTagElement<'tbody'>;
export type TrTag = HtmlTagElement<'tr'>;
export type ThTag = HtmlTagElement<'th'>;
export type TdTag = HtmlTagElement<'td'>;
export type ATag = HtmlTagElement<'a'>;
export type CommentTag = HtmlTagElement<'$comment'>;

// Void tag types
export type ImgTag = HtmlTagElement<'img'>;
export type BrTag = HtmlTagElement<'br'>;
export type HrTag = HtmlTagElement<'hr'>;
export type SvgTagElement = SvgElement<'svg'>;
export type GTag = SvgElement<'g'>;
export type DefsTag = SvgElement<'defs'>;
export type SymbolTag = SvgElement<'symbol'>;
export type UseTag = SvgElement<'use'>;
export type PathTag = SvgElement<'path'>;
export type RectTag = SvgElement<'rect'>;
export type CircleTag = SvgElement<'circle'>;
export type EllipseTag = SvgElement<'ellipse'>;
export type LineTag = SvgElement<'line'>;
export type PolylineTag = SvgElement<'polyline'>;
export type PolygonTag = SvgElement<'polygon'>;
export type TextTag = SvgElement<'text'>;
export type TspanTag = SvgElement<'tspan'>;
export type LinearGradientTag = SvgElement<'linearGradient'>;
export type RadialGradientTag = SvgElement<'radialGradient'>;
export type StopTag = SvgElement<'stop'>;
export type ClipPathTag = SvgElement<'clipPath'>;

// $if tag type
export type IfTag = { $if: ConditionalValueOrTemplate };

// Union of all regular tag types
export type RegularTags = HtmlTagElement<Exclude<HtmlTag, '$if'>> | SvgElement<SvgTag>;

// Generic template attributes (for backwards compatibility with runtime code)
export type TemplateAttributes = BaseContainerAttrs;

// API input types
export interface TreebarkInput {
  template: TemplateElement | TemplateElement[];
  data?: Data;
}

// Logger interface for error reporting - matches console signature
export interface Logger {
  error(message: string): void;
  warn(message: string): void;
  log(message: string): void;
}

// Outer property resolver type for getProperty - called when a property is not found in local context
export type OuterPropertyResolver = (path: BindPath, data: Data, parents: Data[]) => unknown;

export interface TagHookArgs {
  tag: string;
  attrs: Record<string, unknown>;
  children: (InterpolatedString | TemplateObject)[];
  data: Data;
  parents: Data[];
  logger: Logger;
  validateAttributeName(key: string, extraAllowedAttrs?: Iterable<string>): boolean;
  filterAttrs(extraAllowedAttrs?: Iterable<string>): Record<string, unknown>;
}

export interface RenderHooks {
  expandTag?(args: TagHookArgs): TemplateElement | TemplateElement[] | undefined;
}

export interface HookExpansionResult {
  handled: true;
  expanded: TemplateElement | TemplateElement[];
  nextExpandingTags: Set<string>;
}

// Options interface for render functions
export interface RenderOptions {
  indent?: string | number | boolean;
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
  hooks?: RenderHooks;
  validation?: 'strict';
}
