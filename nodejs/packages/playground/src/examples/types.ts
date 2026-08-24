import type { TemplateElement, CustomTags } from '../../../treebark/dist/types.js';

export interface Example {
  template: TemplateElement | TemplateElement[];
  data: unknown;
  customTags?: CustomTags;
}
