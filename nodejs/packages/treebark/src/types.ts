// Type definitions for treebark templates
// This file contains only type definitions, no executable code

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

// Type-safe tag names - union of all allowed tags
export type SvgTag = 'svg' | 'g' | 'defs' | 'symbol' | 'use' | 'path' | 'rect' | 'circle' | 'ellipse' |
  'line' | 'polyline' | 'polygon' | 'text' | 'tspan' | 'linearGradient' | 'radialGradient' | 'stop' | 'clipPath';

export type ContainerTag = 'div' | 'span' | 'p' | 'header' | 'footer' | 'main' | 'section' | 'article' |
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'blockquote' | 'code' | 'pre' |
  'ul' | 'ol' | 'li' |
  'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td' |
  'a' | SvgTag;

export type VoidTag = 'img' | 'br' | 'hr';

export type SpecialTag = '$comment' | '$if';

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

type SvgPresentationAttrs = {
  transform?: AttributeValue;
  fill?: AttributeValue;
  stroke?: AttributeValue;
  'stroke-width'?: AttributeValue;
  'fill-rule'?: AttributeValue;
  'clip-rule'?: AttributeValue;
  opacity?: AttributeValue;
  'fill-opacity'?: AttributeValue;
  'stroke-opacity'?: AttributeValue;
  'stroke-linecap'?: AttributeValue;
  'stroke-linejoin'?: AttributeValue;
  'clip-path'?: AttributeValue;
};

type SvgAttrs = {
  viewBox?: AttributeValue;
  preserveAspectRatio?: AttributeValue;
  x?: AttributeValue;
  y?: AttributeValue;
  width?: AttributeValue;
  height?: AttributeValue;
};

type UseAttrs = {
  href?: AttributeValue;
  x?: AttributeValue;
  y?: AttributeValue;
  width?: AttributeValue;
  height?: AttributeValue;
  transform?: AttributeValue;
  'clip-path'?: AttributeValue;
};

type PathAttrs = SvgPresentationAttrs & { d?: AttributeValue };
type RectAttrs = SvgPresentationAttrs & {
  x?: AttributeValue;
  y?: AttributeValue;
  width?: AttributeValue;
  height?: AttributeValue;
  rx?: AttributeValue;
  ry?: AttributeValue;
};
type CircleAttrs = SvgPresentationAttrs & { cx?: AttributeValue; cy?: AttributeValue; r?: AttributeValue };
type EllipseAttrs = SvgPresentationAttrs & { cx?: AttributeValue; cy?: AttributeValue; rx?: AttributeValue; ry?: AttributeValue };
type LineAttrs = SvgPresentationAttrs & { x1?: AttributeValue; y1?: AttributeValue; x2?: AttributeValue; y2?: AttributeValue };
type PointsAttrs = SvgPresentationAttrs & { points?: AttributeValue };
type TextAttrs = SvgPresentationAttrs & {
  x?: AttributeValue;
  y?: AttributeValue;
  dx?: AttributeValue;
  dy?: AttributeValue;
  'text-anchor'?: AttributeValue;
  'font-size'?: AttributeValue;
  'font-family'?: AttributeValue;
};
type LinearGradientAttrs = {
  x1?: AttributeValue;
  y1?: AttributeValue;
  x2?: AttributeValue;
  y2?: AttributeValue;
  gradientUnits?: AttributeValue;
  gradientTransform?: AttributeValue;
  href?: AttributeValue;
};
type RadialGradientAttrs = {
  cx?: AttributeValue;
  cy?: AttributeValue;
  r?: AttributeValue;
  fx?: AttributeValue;
  fy?: AttributeValue;
  gradientUnits?: AttributeValue;
  gradientTransform?: AttributeValue;
  href?: AttributeValue;
};
type StopAttrs = { offset?: AttributeValue; 'stop-color'?: AttributeValue; 'stop-opacity'?: AttributeValue };
type ClipPathAttrs = { transform?: AttributeValue; clipPathUnits?: AttributeValue };

// Tag-specific types with attributes included
export type DivTag = { div: TagContent<BaseContainerAttrs> };
export type SpanTag = { span: TagContent<BaseContainerAttrs> };
export type PTag = { p: TagContent<BaseContainerAttrs> };
export type HeaderTag = { header: TagContent<BaseContainerAttrs> };
export type FooterTag = { footer: TagContent<BaseContainerAttrs> };
export type MainTag = { main: TagContent<BaseContainerAttrs> };
export type SectionTag = { section: TagContent<BaseContainerAttrs> };
export type ArticleTag = { article: TagContent<BaseContainerAttrs> };
export type H1Tag = { h1: TagContent<BaseContainerAttrs> };
export type H2Tag = { h2: TagContent<BaseContainerAttrs> };
export type H3Tag = { h3: TagContent<BaseContainerAttrs> };
export type H4Tag = { h4: TagContent<BaseContainerAttrs> };
export type H5Tag = { h5: TagContent<BaseContainerAttrs> };
export type H6Tag = { h6: TagContent<BaseContainerAttrs> };
export type StrongTag = { strong: TagContent<BaseContainerAttrs> };
export type EmTag = { em: TagContent<BaseContainerAttrs> };
export type BlockquoteTag = { blockquote: TagContent<BaseContainerAttrs & { cite?: string }> };
export type CodeTag = { code: TagContent<BaseContainerAttrs> };
export type PreTag = { pre: TagContent<BaseContainerAttrs> };
export type UlTag = { ul: TagContent<BaseContainerAttrs> };
export type OlTag = { ol: TagContent<BaseContainerAttrs> };
export type LiTag = { li: TagContent<BaseContainerAttrs> };
export type TableTag = { table: TagContent<BaseContainerAttrs & { summary?: string }> };
export type TheadTag = { thead: TagContent<BaseContainerAttrs> };
export type TbodyTag = { tbody: TagContent<BaseContainerAttrs> };
export type TrTag = { tr: TagContent<BaseContainerAttrs> };
export type ThTag = { th: TagContent<BaseContainerAttrs & { scope?: string; colspan?: string; rowspan?: string }> };
export type TdTag = { td: TagContent<BaseContainerAttrs & { scope?: string; colspan?: string; rowspan?: string }> };
export type ATag = { a: TagContent<BaseContainerAttrs & { href?: string; target?: string; rel?: string }> };
export type CommentTag = { $comment: TagContent<BaseContainerAttrs> };

// Void tag types
export type ImgTag = { img: TagContent<BaseVoidAttrs & { src?: string; alt?: string; width?: string; height?: string }> };
export type BrTag = { br: TagContent<BaseVoidAttrs> };
export type HrTag = { hr: TagContent<BaseVoidAttrs> };
export type SvgTagElement = { svg: TagContent<SvgElementAttrs<SvgAttrs>> };
export type GTag = { g: TagContent<SvgElementAttrs<SvgPresentationAttrs>> };
export type DefsTag = { defs: TagContent<SvgElementAttrs<{}>> };
export type SymbolTag = { symbol: TagContent<SvgElementAttrs<Pick<SvgAttrs, 'viewBox' | 'preserveAspectRatio'>>> };
export type UseTag = { use: TagContent<SvgElementAttrs<UseAttrs>> };
export type PathTag = { path: TagContent<SvgElementAttrs<PathAttrs>> };
export type RectTag = { rect: TagContent<SvgElementAttrs<RectAttrs>> };
export type CircleTag = { circle: TagContent<SvgElementAttrs<CircleAttrs>> };
export type EllipseTag = { ellipse: TagContent<SvgElementAttrs<EllipseAttrs>> };
export type LineTag = { line: TagContent<SvgElementAttrs<LineAttrs>> };
export type PolylineTag = { polyline: TagContent<SvgElementAttrs<PointsAttrs>> };
export type PolygonTag = { polygon: TagContent<SvgElementAttrs<PointsAttrs>> };
export type TextTag = { text: TagContent<SvgElementAttrs<TextAttrs>> };
export type TspanTag = { tspan: TagContent<SvgElementAttrs<TextAttrs>> };
export type LinearGradientTag = { linearGradient: TagContent<SvgElementAttrs<LinearGradientAttrs>> };
export type RadialGradientTag = { radialGradient: TagContent<SvgElementAttrs<RadialGradientAttrs>> };
export type StopTag = { stop: TagContent<SvgElementAttrs<StopAttrs>> };
export type ClipPathTag = { clipPath: TagContent<SvgElementAttrs<ClipPathAttrs>> };

// $if tag type
export type IfTag = { $if: ConditionalValueOrTemplate };

// Union of all regular tag types
export type RegularTags = 
  | DivTag | SpanTag | PTag | HeaderTag | FooterTag | MainTag | SectionTag | ArticleTag
  | H1Tag | H2Tag | H3Tag | H4Tag | H5Tag | H6Tag | StrongTag | EmTag | BlockquoteTag
  | CodeTag | PreTag | UlTag | OlTag | LiTag | TableTag | TheadTag | TbodyTag | TrTag
  | ThTag | TdTag | ATag | ImgTag | BrTag | HrTag | CommentTag
  | SvgTagElement | GTag | DefsTag | SymbolTag | UseTag | PathTag | RectTag | CircleTag | EllipseTag
  | LineTag | PolylineTag | PolygonTag | TextTag | TspanTag | LinearGradientTag | RadialGradientTag | StopTag | ClipPathTag;

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
