// Type definitions for treebark templates
// This file contains only type definitions, no executable code

// Data type for template rendering - accepts any value
export type Data = unknown;

// Primitive value type for attribute values
export type PrimitiveValue = string | number | boolean;

// Forward declaration for recursive types
export type TemplateObject = IfTag | RegularTags;
export type TemplateElement = string | TemplateObject;

// Generic conditional type shared by $if tag and conditional attribute values
export type ConditionalBase<T> = {
  $check: string;
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
export type ConditionalValueOrTemplate = ConditionalBase<string | TemplateObject>;

// Conditional value type for attribute values - T is restricted to primitives
export type ConditionalValue = ConditionalBase<string>;

// CSS Style properties as an object with kebab-case property names
// Accepts any valid CSS property name (kebab-case format)
export type CSSProperties = {
  [property: string]: string;
};

export type AttributeValue = string | ConditionalValue;

// Style value can be a CSSProperties object or a conditional that returns CSSProperties
export type StyleValue = CSSProperties | ConditionalBase<CSSProperties>;

// Type-safe tag names - union of all allowed tags
export type ContainerTag = 'div' | 'span' | 'p' | 'header' | 'footer' | 'main' | 'section' | 'article' |
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'blockquote' | 'code' | 'pre' |
  'ul' | 'ol' | 'li' |
  'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td' |
  'a' | 'button';

export type VoidTag = 'img' | 'br' | 'hr';

export type SpecialTag = '$comment' | '$if';

export type AllowedTag = ContainerTag | VoidTag | SpecialTag;

// Helper type for tag content (avoids repetition)
type TagContent<Attrs> = string | (string | TemplateObject)[] | Attrs;

// Global attributes that can be used on any tag
type GlobalAttrs = {
  id?: AttributeValue;
  class?: AttributeValue;
  style?: StyleValue;
  title?: AttributeValue;
  role?: AttributeValue;
  [key: `data-${string}`]: AttributeValue;
  [key: `aria-${string}`]: AttributeValue;
};

// Base attributes for container tags (can have children)
type BaseContainerAttrs = GlobalAttrs & {
  $bind?: string;
  $children?: (string | TemplateObject)[];
};

// Button-specific event handler type (DOM-only)
export type ButtonClickHandler = (event: MouseEvent, payload?: unknown) => void;

// Base attributes for void tags (no children allowed)
type BaseVoidAttrs = GlobalAttrs & {
  $bind?: string;
};

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
export type ButtonTag = { button: TagContent<BaseContainerAttrs & { type?: string; disabled?: AttributeValue; $onClick?: ButtonClickHandler }> };
export type CommentTag = { $comment: TagContent<BaseContainerAttrs> };

// Void tag types
export type ImgTag = { img: TagContent<BaseVoidAttrs & { src?: string; alt?: string; width?: string; height?: string }> };
export type BrTag = { br: TagContent<BaseVoidAttrs> };
export type HrTag = { hr: TagContent<BaseVoidAttrs> };

// $if tag type
export type IfTag = { $if: ConditionalValueOrTemplate };

// Union of all regular tag types
export type RegularTags = 
  | DivTag | SpanTag | PTag | HeaderTag | FooterTag | MainTag | SectionTag | ArticleTag
  | H1Tag | H2Tag | H3Tag | H4Tag | H5Tag | H6Tag | StrongTag | EmTag | BlockquoteTag
  | CodeTag | PreTag | UlTag | OlTag | LiTag | TableTag | TheadTag | TbodyTag | TrTag
  | ThTag | TdTag | ATag | ButtonTag | ImgTag | BrTag | HrTag | CommentTag;

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

// Options interface for render functions
export interface RenderOptions {
  indent?: string | number | boolean;
  logger?: Logger;
}
