import type { TemplateElement } from '../../../treebark/dist/types.js';

export interface Example {
  template: TemplateElement | TemplateElement[];
  data: unknown;
}
