// Simplified Treebark - tiny recursive walker + pluggable formatters
import { renderToString } from './string.js';
import { TreebarkInput, RenderOptions } from './common.js';

export { renderToString } from './string.js';
export { renderToDOM } from './dom.js';
export { 
  TemplateElement, 
  TemplateObject, 
  TreebarkInput, 
  Data, 
  RenderOptions,
  // Export tag types
  DivTag,
  SpanTag,
  PTag,
  HeaderTag,
  FooterTag,
  MainTag,
  SectionTag,
  ArticleTag,
  H1Tag,
  H2Tag,
  H3Tag,
  H4Tag,
  H5Tag,
  H6Tag,
  StrongTag,
  EmTag,
  BlockquoteTag,
  CodeTag,
  PreTag,
  UlTag,
  OlTag,
  LiTag,
  TableTag,
  TheadTag,
  TbodyTag,
  TrTag,
  ThTag,
  TdTag,
  ATag,
  ImgTag,
  BrTag,
  HrTag,
  CommentTag,
  IfTag
} from './common.js';

// Main render function (defaults to string)
export function render(
  input: TreebarkInput, 
  options: RenderOptions = {}
): string {
  return renderToString(input, options);
}