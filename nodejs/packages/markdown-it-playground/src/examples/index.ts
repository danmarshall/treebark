import type { MarkdownExample } from './types.js';
import { helloWorld } from './hello-world.js';
import { productCard } from './product-card.js';
import { listBinding } from './list-binding.js';
import { mixedContent } from './mixed-content.js';
import { fullTemplateWithData } from './full-template-with-data.js';
import { conditionalIfTag } from './conditional-if-tag.js';
import { ifElseBranches } from './if-else-branches.js';
import { comparisonOperators } from './comparison-operators.js';
import { operatorStacking } from './operator-stacking.js';
import { conditionalAttributeValues } from './conditional-attribute-values.js';

export type MarkdownExamples = Record<string, MarkdownExample>;

export const examples: MarkdownExamples = {
  'Hello World': helloWorld,
  'Product Card': productCard,
  'List Binding': listBinding,
  'Mixed Content': mixedContent,
  'Full Template with Data': fullTemplateWithData,
  'Conditional Rendering ($if Tag)': conditionalIfTag,
  'If/Else Branches ($then/$else)': ifElseBranches,
  'Comparison Operators': comparisonOperators,
  'Operator Stacking ($join)': operatorStacking,
  'Conditional Attribute Values': conditionalAttributeValues
};

// Re-export helpers for use in main file
export { treebark } from './helpers.js';
