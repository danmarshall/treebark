import type { Example } from './types.js';
import { helloWorld } from './hello-world.js';
import { cardLayout } from './card-layout.js';
import { listBinding } from './list-binding.js';
import { userProfile } from './user-profile.js';
import { shorthandSyntax } from './shorthand-syntax.js';
import { mixedContent } from './mixed-content.js';
import { stackOfCards } from './stack-of-cards.js';
import { arrayBindProperty } from './array-bind-property.js';
import { arrayBindDot } from './array-bind-dot.js';
import { parentPropertyAccess } from './parent-property-access.js';
import { conditionalIfBasic } from './conditional-if-basic.js';
import { conditionalIfAdmin } from './conditional-if-admin.js';
import { conditionalIfInventory } from './conditional-if-inventory.js';
import { conditionalIfNested } from './conditional-if-nested.js';
import { conditionalThenElse } from './conditional-then-else.js';
import { conditionalComparisonOperators } from './conditional-comparison-operators.js';
import { conditionalJoinOr } from './conditional-join-or.js';
import { conditionalAttributeValues } from './conditional-attribute-values.js';
import { styleObjects } from './style-objects.js';
import { calendar } from './calendar.js';

export type Examples = Record<string, Example>;

export const examples: Examples = {
  'Hello World': helloWorld,
  'Card Layout': cardLayout,
  'List Binding': listBinding,
  'User Profile': userProfile,
  'Shorthand Syntax': shorthandSyntax,
  'Mixed Content': mixedContent,
  'Stack Of Cards': stackOfCards,
  'Array Bind Property': arrayBindProperty,
  'Array Bind Dot': arrayBindDot,
  'Parent Property Access': parentPropertyAccess,
  'Conditional If Basic': conditionalIfBasic,
  'Conditional If Admin': conditionalIfAdmin,
  'Conditional If Inventory': conditionalIfInventory,
  'Conditional If Nested': conditionalIfNested,
  'Conditional Then Else': conditionalThenElse,
  'Conditional Comparison Operators': conditionalComparisonOperators,
  'Conditional Join Or': conditionalJoinOr,
  'Conditional Attribute Values': conditionalAttributeValues,
  'Style Objects': styleObjects,
  'Calendar': calendar
};
