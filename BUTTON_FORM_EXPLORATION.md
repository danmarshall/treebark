# Button Tag and Form Elements - Exploration

This document explores the possibilities for supporting button tags and form elements in Treebark, taking inspiration from [AdaptiveCards actions pattern](https://learn.microsoft.com/en-us/adaptive-cards/sdk/rendering-cards/javascript/actions).

## Executive Summary

**Key Design Insight:** Use the **name-value pair pattern** for interactive elements:
- **Buttons** return a single name-value pair: `(name: string, value: string)`
- **Forms** return an array of name-value pairs: `Array<[name, value]>` (via FormData)

This pattern:
- ✅ Aligns with HTML semantics (input elements already use name/value)
- ✅ Simple and intuitive API
- ✅ Provides natural foundation for form support
- ✅ No JSON parsing or complex payload extraction needed
- ✅ Type-safe and easy to test

**Recommended Approach:** Start with Path 2 (Button with Name-Value Handler), optionally expand to Path 3 (Full Form Support) if use cases emerge.

## Problem Statement

Treebark currently blocks interactive elements like `button`, `input`, `select`, `textarea`, and `form` for security reasons. However, there may be use cases where safe, template-driven interactive elements could be valuable, especially in content-driven applications.

## Key Questions to Explore

1. **Should we support interactive elements at all?** What's the use case?
2. **If yes, how do we maintain security?** No arbitrary JavaScript execution
3. **How would event handling work?** Context-based handlers vs. inline handlers
4. **What's the API surface?** Minimal and intuitive
5. **DOM-only or both renderers?** String renderer limitations

## Exploration 1: Button Tag with Context-Based Actions

### Design Principle: Name-Value Pairs

**Key Insight:** Buttons should return a **name:value pair** when clicked. This simple pattern:
- Aligns with HTML form semantics (input elements have name/value)
- Provides a natural foundation for form support
- Keeps the API minimal and intuitive

### AdaptiveCards Pattern Reference

AdaptiveCards uses a pattern where:
- Actions are defined in the template with a `type` and `data`
- A single action handler is registered for the entire card context
- The handler receives the action type and data when triggered

Example from AdaptiveCards:
```json
{
  "type": "Action.Submit",
  "title": "Save",
  "data": {
    "action": "save",
    "id": "123"
  }
}
```

### Proposed Treebark Pattern: Name-Value Pairs

#### Option A: Single Context Handler with Name-Value Pairs

Template defines buttons with `name` and `value` attributes:
```javascript
{
  template: {
    div: {
      $children: [
        {
          button: {
            type: "button",
            name: "action",
            value: "save",
            $children: ["Save"]
          }
        },
        {
          button: {
            type: "button",
            name: "action",
            value: "delete",
            $children: ["Delete"]
          }
        },
        {
          button: {
            type: "button",
            name: "itemId",
            value: "123",
            $children: ["Select Item 123"]
          }
        }
      ]
    }
  },
  data: { /* template data */ }
}
```

Application provides a single handler that receives name-value pairs:
```javascript
const fragment = renderToDOM(input, {
  onAction: (name, value, event) => {
    // Receives: name (string), value (string), event (MouseEvent)
    console.log(`Button clicked: ${name}=${value}`);
    
    if (name === 'action') {
      switch(value) {
        case 'save':
          console.log('Save action triggered');
          break;
        case 'delete':
          console.log('Delete action triggered');
          break;
      }
    } else if (name === 'itemId') {
      console.log(`Item ${value} selected`);
    }
  }
});
```

**Benefits of Name-Value Pattern:**
- **Familiar:** Mirrors HTML form input pattern (`<input name="..." value="...">`)
- **Simple:** Just two strings - easy to understand and use
- **Flexible:** Can represent actions, IDs, or any semantic data
- **Form-ready:** Same pattern works for form inputs (see below)
- **Type-safe:** Both name and value are always strings

**Pros:**
- Clean separation: templates define structure, app defines behavior
- Single handler reduces boilerplate
- Natural extension to forms
- Aligns with HTML semantics
- No need for JSON parsing or complex payload extraction

**Cons:**
- Requires DOM renderer (won't work in string renderer)
- Additional API surface in RenderOptions
- Limited to string values (but can use JSON.stringify if needed)

#### Option B: External Handler Attachment (Current HTML standard)

Template only defines structure:
```javascript
{
  template: {
    button: {
      class: "btn-save",
      "data-action": "save",
      "data-id": "123",
      $children: ["Save"]
    }
  }
}
```

Application attaches handlers after rendering:
```javascript
const fragment = renderToDOM(input);
document.body.appendChild(fragment);

// App adds handlers externally
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const action = e.target.getAttribute('data-action');
    const id = e.target.getAttribute('data-id');
    handleAction(action, { id });
  });
});
```

**Pros:**
- Simplest implementation (just allow the tag)
- No new API surface
- Works with standard DOM APIs
- Clearest security model

**Cons:**
- More boilerplate in application code
- Not as elegant as declarative actions

#### Option C: Hybrid - Optional Context Handler

Allow button tag always, but provide optional context handler:
```javascript
// Without handler - external attachment needed
const fragment1 = renderToDOM({ template: { button: "Click" } });

// With optional handler
const fragment2 = renderToDOM(
  { template: { button: { "data-action": "save", $children: ["Save"] } } },
  { 
    onAction: (action, payload) => { /* handle */ }
  }
);
```

**Pros:**
- Flexibility for different use cases
- Progressive enhancement
- Doesn't force a pattern

**Cons:**
- Two ways to do the same thing
- More complex to document and maintain

### Additional Data with Buttons

If buttons need to carry additional data beyond name-value:

**Option 1: Use data attributes (read but not sent):**
```javascript
{
  button: {
    name: "action",
    value: "delete",
    "data-item-id": "123",
    "data-confirm": "true",
    $children: ["Delete Item 123"]
  }
}

// Handler can access via event.target
onAction: (name, value, event) => {
  if (name === 'action' && value === 'delete') {
    const itemId = event.target.getAttribute('data-item-id');
    const needsConfirm = event.target.getAttribute('data-confirm');
    // Handle deletion...
  }
}
```

**Option 2: Encode in value (if needed):**
```javascript
{
  button: {
    name: "action",
    value: JSON.stringify({ type: "delete", itemId: 123 }),
    $children: ["Delete"]
  }
}

// Handler parses if needed
onAction: (name, value, event) => {
  if (name === 'action') {
    const action = JSON.parse(value);
    // action.type, action.itemId...
  }
}
```

## Exploration 2: Form Elements with Name-Value Pairs

### Which Form Elements?

If we allow buttons, should we also allow:
- `input` (text, checkbox, radio, etc.)
- `textarea`
- `select` / `option`
- `label`
- `form` (container)

### Security Considerations

**Safe:**
- `button` - can only trigger actions
- `label` - just associates with inputs
- Read-only inputs with `readonly` attribute

**Potentially risky:**
- `form` with `action` attribute (server-side submission)
- File inputs (`input type="file"`)
- Hidden inputs that could be manipulated

### Key Insight: Forms Return Array of Name-Value Pairs

Building on the button pattern, **forms should return an array of name-value pairs** - exactly like HTML's FormData.

### Possible Form Pattern

#### Read-only Forms (Display Only)

```javascript
{
  template: {
    form: {
      $children: [
        { label: { for: "name", $children: ["Name:"] } },
        { input: { type: "text", id: "name", name: "name", readonly: "true", value: "{{userName}}" } },
        
        { label: { for: "email", $children: ["Email:"] } },
        { input: { type: "email", id: "email", name: "email", readonly: "true", value: "{{userEmail}}" } }
      ]
    }
  },
  data: { userName: "Alice", userEmail: "alice@example.com" }
}
```

**Use case:** Displaying form-like data (receipts, confirmations, etc.)

#### Interactive Forms with Context Handler

Template with form elements (each has `name` attribute):
```javascript
{
  template: {
    form: {
      $children: [
        { label: { for: "name", $children: ["Name:"] } },
        { input: { type: "text", id: "name", name: "name", value: "{{userName}}" } },
        
        { label: { for: "email", $children: ["Email:"] } },
        { input: { type: "email", id: "email", name: "email", value: "{{userEmail}}" } },
        
        { label: { for: "role", $children: ["Role:"] } },
        { 
          select: {
            id: "role",
            name: "role",
            $children: [
              { option: { value: "user", $children: ["User"] } },
              { option: { value: "admin", selected: "true", $children: ["Admin"] } }
            ]
          }
        },
        
        { button: { type: "submit", name: "action", value: "save", $children: ["Save"] } }
      ]
    }
  },
  data: { userName: "Alice", userEmail: "alice@example.com" }
}
```

Handler receives array of name-value pairs:
```javascript
const fragment = renderToDOM(input, {
  onAction: (name, value, event) => {
    if (name === 'action' && value === 'save') {
      // Get form data as array of [name, value] pairs
      const form = event.target.closest('form');
      const formData = new FormData(form);
      const formValues = Array.from(formData.entries()); // [["name", "Alice"], ["email", "alice@..."], ["role", "admin"]]
      
      console.log('Form submitted with values:', formValues);
      
      // Or convert to object if preferred
      const formObject = Object.fromEntries(formValues);
      console.log('As object:', formObject); // { name: "Alice", email: "alice@...", role: "admin" }
    }
  }
});
```

**Benefits of Array of Name-Value Pairs:**
- **Standard HTML:** Exactly how FormData works
- **Consistent:** Same pattern as button (single name-value pair)
- **Multiple values:** Supports multiple inputs with same name (checkboxes, multi-select)
- **Preserves order:** Array maintains form field order
- **Simple:** No parsing needed, just extract from FormData

**Alternative: Provide helper in handler:**
```javascript
onAction: (name, value, event) => {
  if (name === 'action' && value === 'save') {
    // Helper function extracts form data
    const formValues = getFormValues(event.target);
    // formValues is array: [["name", "Alice"], ["email", "..."], ...]
  }
}

// Could be provided as utility
function getFormValues(button) {
  const form = button.closest('form');
  return Array.from(new FormData(form).entries());
}
```

**Use case:** Simple data collection forms in content

### Form Element Attributes

Which attributes should be allowed?

**Definitely safe:**
- `type`, `id`, `name`, `value`, `placeholder`
- `readonly`, `disabled`
- `for` (on labels)
- `rows`, `cols` (on textarea)
- `checked` (on checkbox/radio)
- `selected` (on option)
- `multiple` (on select)

**Questionable:**
- `action` (on form) - could submit to arbitrary URLs
- `method` (on form) - GET vs POST
- `autocomplete` - privacy implications?

**Definitely block:**
- `formaction`, `formmethod` - can override form behavior
- `onfocus`, `onblur`, `onchange` - event handlers

## Implementation Considerations

### 1. Tag Whitelist Updates

```javascript
// In common.ts
export const CONTAINER_TAGS = new Set([
  // ... existing tags ...
  'button',
  'form',
  'label'
]);

export const VOID_TAGS = new Set([
  // ... existing tags ...
  'input'
]);

// Conditionally allowed (needs discussion)
export const FORM_TAGS = new Set([
  'select',
  'option',
  'textarea'
]);
```

### 2. Attribute Whitelist Updates

```javascript
export const TAG_SPECIFIC_ATTRS: Record<string, Set<string>> = {
  // ... existing ...
  'button': new Set(['type', 'disabled', 'name', 'value']), // name and value for action pattern
  'input': new Set(['type', 'name', 'value', 'placeholder', 'readonly', 'disabled', 'checked']),
  'textarea': new Set(['name', 'rows', 'cols', 'placeholder', 'readonly', 'disabled']),
  'select': new Set(['name', 'multiple', 'disabled']),
  'option': new Set(['value', 'selected']),
  'label': new Set(['for']),
  'form': new Set(['data-form-id']) // Explicitly NOT action/method
};
```

### 3. Context Handler API with Name-Value Pairs

```typescript
interface RenderOptions {
  indent?: string | number | boolean;
  logger?: Logger;
  onAction?: ActionHandler; // NEW - receives name-value pairs
}

type ActionHandler = (name: string, value: string, event: MouseEvent) => void;
```

**Simple and aligned with HTML semantics:**
- `name`: The button's `name` attribute
- `value`: The button's `value` attribute  
- `event`: The click event (access to target element, form context, etc.)

### 4. DOM Renderer Changes

```javascript
function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = [], logger: Logger, onAction?: ActionHandler): void {
  // ... existing attribute handling ...
  
  // If button and onAction handler provided
  if (tag === 'button' && onAction) {
    element.addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      
      const nameAttr = element.getAttribute('name');
      const valueAttr = element.getAttribute('value');
      
      if (!nameAttr) {
        logger.warn('Button with onAction handler should have a name attribute');
        return;
      }
      
      // Call handler with name-value pair
      // Value defaults to empty string if not provided
      onAction(nameAttr, valueAttr || '', event);
    });
  }
}
```

**Benefits:**
- Simple implementation - just extract two attributes
- No JSON parsing or complex payload logic
- Aligns perfectly with HTML button semantics
- Easy to test and maintain

## Recommendations

Based on this exploration with **name-value pair pattern**, here are potential paths forward:

### Path 1: Minimal - Button Tag Only (No Handler)

**Implementation:**
- Allow `button` tag in whitelist
- Support `type`, `disabled`, `name`, `value` attributes
- No special event handling - apps attach handlers externally
- Document best practices for using name/value attributes

**Pros:** Minimal change, clear security model, easy to understand
**Cons:** Doesn't provide much value over current workarounds

### Path 2: Button with Name-Value Handler (Recommended)

**Implementation:**
- Allow `button` tag in whitelist with `name` and `value` attributes
- Add optional `onAction: (name, value, event) => void` to RenderOptions (DOM only)
- Auto-wire buttons that have `name` attribute to the handler
- Simple pattern: button returns name-value pair when clicked

**Example:**
```javascript
// Template
{ button: { name: "action", value: "save", $children: ["Save"] } }

// Handler
renderToDOM(input, {
  onAction: (name, value, event) => {
    console.log(`${name}=${value}`); // "action=save"
  }
});
```

**Pros:** 
- Elegant and simple
- Aligns with HTML semantics
- Natural foundation for forms
- Optional - works without handler too

**Cons:** 
- DOM-only feature
- New API to maintain

### Path 3: Full Form Support with Name-Value Pattern

**Implementation:**
- Allow button, input, select, textarea, label, form
- All form elements use `name` attribute
- Button returns single name-value pair
- Forms return array of name-value pairs via FormData
- Strict attribute whitelisting (no action/method on form)
- Optional context handler using same pattern

**Example:**
```javascript
// Template with form
{
  form: {
    $children: [
      { input: { type: "text", name: "username", value: "{{user}}" } },
      { button: { type: "submit", name: "action", value: "save", $children: ["Save"] } }
    ]
  }
}

// Handler
onAction: (name, value, event) => {
  if (name === 'action' && value === 'save') {
    const form = event.target.closest('form');
    const formData = Array.from(new FormData(form).entries());
    // formData = [["username", "alice"], ["action", "save"]]
  }
}
```

**Pros:** 
- Powerful and consistent pattern
- Works for simple and complex forms
- Standard HTML FormData integration

**Cons:** 
- Larger API surface
- Need to carefully consider security
- More complexity

### Path 4: No Changes

**Implementation:**
- Keep current blocking of interactive elements
- Document workarounds (render content, attach handlers externally)

**Pros:** Zero risk, zero maintenance
**Cons:** Less useful for interactive content scenarios

## Questions for Discussion

1. **What's the actual use case?** Is this for CMS content with occasional buttons, or for building full form-based UIs?

2. **DOM-only acceptable?** If features only work in DOM renderer, is that okay?

3. **Security vs. convenience tradeoff?** Where do we draw the line on what's allowed?

4. **Maintenance burden?** How much API surface are we willing to support long-term?

5. **Alternative approaches?** Could we provide helper utilities instead of built-in support?

## Next Steps

To move this forward, we need to:

1. **Define the use case clearly** - What problem are we actually solving?
2. **Choose a path** - Which approach aligns with Treebark's goals?
3. **Prototype** - Build a minimal proof-of-concept
4. **Test with real content** - Does it work for actual use cases?
5. **Document** - Clear security model and best practices
6. **Decide** - Ship it, iterate, or abandon?

## Appendix: AdaptiveCards Reference

AdaptiveCards action types:
- `Action.OpenUrl` - Opens a URL
- `Action.Submit` - Submits data to the host app
- `Action.ShowCard` - Shows another card
- `Action.ToggleVisibility` - Shows/hides elements

Their pattern:
```javascript
adaptiveCard.onExecuteAction = function(action) {
  if (action instanceof AC.SubmitAction) {
    console.log("Submitted data:", action.data);
  }
}
```

This is similar to our proposed `onAction` handler pattern.
