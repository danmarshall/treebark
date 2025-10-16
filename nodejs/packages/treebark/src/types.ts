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

// CSS Style properties as an object with kebab-case property names (matching actual CSS)
export type CSSProperties = {
  // Layout & Display
  'display'?: string;
  'position'?: string;
  'top'?: string;
  'right'?: string;
  'bottom'?: string;
  'left'?: string;
  'z-index'?: string;
  'float'?: string;
  'clear'?: string;
  'overflow'?: string;
  'overflow-x'?: string;
  'overflow-y'?: string;
  'visibility'?: string;
  
  // Box Model
  'width'?: string;
  'height'?: string;
  'min-width'?: string;
  'min-height'?: string;
  'max-width'?: string;
  'max-height'?: string;
  'margin'?: string;
  'margin-top'?: string;
  'margin-right'?: string;
  'margin-bottom'?: string;
  'margin-left'?: string;
  'padding'?: string;
  'padding-top'?: string;
  'padding-right'?: string;
  'padding-bottom'?: string;
  'padding-left'?: string;
  'box-sizing'?: string;
  
  // Border
  'border'?: string;
  'border-width'?: string;
  'border-style'?: string;
  'border-color'?: string;
  'border-radius'?: string;
  'border-top'?: string;
  'border-right'?: string;
  'border-bottom'?: string;
  'border-left'?: string;
  'border-top-width'?: string;
  'border-right-width'?: string;
  'border-bottom-width'?: string;
  'border-left-width'?: string;
  'border-top-style'?: string;
  'border-right-style'?: string;
  'border-bottom-style'?: string;
  'border-left-style'?: string;
  'border-top-color'?: string;
  'border-right-color'?: string;
  'border-bottom-color'?: string;
  'border-left-color'?: string;
  'border-top-left-radius'?: string;
  'border-top-right-radius'?: string;
  'border-bottom-left-radius'?: string;
  'border-bottom-right-radius'?: string;
  'outline'?: string;
  'outline-width'?: string;
  'outline-style'?: string;
  'outline-color'?: string;
  'outline-offset'?: string;
  
  // Background
  'background'?: string;
  'background-color'?: string;
  'background-position'?: string;
  'background-size'?: string;
  'background-repeat'?: string;
  'background-attachment'?: string;
  'background-clip'?: string;
  'background-origin'?: string;
  
  // Text & Font
  'color'?: string;
  'font'?: string;
  'font-family'?: string;
  'font-size'?: string;
  'font-weight'?: string;
  'font-style'?: string;
  'font-variant'?: string;
  'line-height'?: string;
  'letter-spacing'?: string;
  'word-spacing'?: string;
  'text-align'?: string;
  'text-decoration'?: string;
  'text-indent'?: string;
  'text-transform'?: string;
  'text-shadow'?: string;
  'text-overflow'?: string;
  'white-space'?: string;
  'word-wrap'?: string;
  'word-break'?: string;
  'vertical-align'?: string;
  'direction'?: string;
  'unicode-bidi'?: string;
  
  // Lists
  'list-style'?: string;
  'list-style-type'?: string;
  'list-style-position'?: string;
  
  // Tables
  'border-collapse'?: string;
  'border-spacing'?: string;
  'caption-side'?: string;
  'empty-cells'?: string;
  'table-layout'?: string;
  
  // Flexbox
  'flex'?: string;
  'flex-direction'?: string;
  'flex-wrap'?: string;
  'flex-flow'?: string;
  'justify-content'?: string;
  'align-items'?: string;
  'align-content'?: string;
  'align-self'?: string;
  'flex-grow'?: string;
  'flex-shrink'?: string;
  'flex-basis'?: string;
  'order'?: string;
  'gap'?: string;
  'row-gap'?: string;
  'column-gap'?: string;
  
  // Grid
  'grid'?: string;
  'grid-template'?: string;
  'grid-template-columns'?: string;
  'grid-template-rows'?: string;
  'grid-template-areas'?: string;
  'grid-column'?: string;
  'grid-row'?: string;
  'grid-area'?: string;
  'grid-auto-columns'?: string;
  'grid-auto-rows'?: string;
  'grid-auto-flow'?: string;
  'grid-column-start'?: string;
  'grid-column-end'?: string;
  'grid-row-start'?: string;
  'grid-row-end'?: string;
  
  // Transform & Animation
  'transform'?: string;
  'transform-origin'?: string;
  'transition'?: string;
  'transition-property'?: string;
  'transition-duration'?: string;
  'transition-timing-function'?: string;
  'transition-delay'?: string;
  'animation'?: string;
  'animation-name'?: string;
  'animation-duration'?: string;
  'animation-timing-function'?: string;
  'animation-delay'?: string;
  'animation-iteration-count'?: string;
  'animation-direction'?: string;
  'animation-fill-mode'?: string;
  'animation-play-state'?: string;
  
  // Effects
  'opacity'?: string;
  'box-shadow'?: string;
  'filter'?: string;
  'backdrop-filter'?: string;
  
  // Other
  'cursor'?: string;
  'pointer-events'?: string;
  'resize'?: string;
  'user-select'?: string;
  'content'?: string;
  'quotes'?: string;
  'counter-reset'?: string;
  'counter-increment'?: string;
  'object-fit'?: string;
  'object-position'?: string;
};

// Style value can be a CSSProperties object or a conditional that returns CSSProperties
export type StyleValue = CSSProperties | ConditionalBase<CSSProperties>;

// Type-safe tag names - union of all allowed tags
export type ContainerTag = 'div' | 'span' | 'p' | 'header' | 'footer' | 'main' | 'section' | 'article' |
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'blockquote' | 'code' | 'pre' |
  'ul' | 'ol' | 'li' |
  'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td' |
  'a';

export type VoidTag = 'img' | 'br' | 'hr';

export type SpecialTag = '$comment' | '$if';

export type AllowedTag = ContainerTag | VoidTag | SpecialTag;

// Helper type for tag content (avoids repetition)
type TagContent<Attrs> = string | (string | TemplateObject)[] | Attrs;

// Global attributes that can be used on any tag
type GlobalAttrs = {
  id?: string;
  class?: string;
  style?: StyleValue;
  title?: string;
  role?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
};

// Base attributes for container tags (can have children)
type BaseContainerAttrs = GlobalAttrs & {
  $bind?: string;
  $children?: (string | TemplateObject)[];
};

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
  | ThTag | TdTag | ATag | ImgTag | BrTag | HrTag | CommentTag;

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
