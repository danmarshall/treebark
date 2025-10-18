# Button Tag and Form Elements - Exploration

This document explores the possibilities for supporting button tags and form elements in Treebark, taking inspiration from [AdaptiveCards actions pattern](https://learn.microsoft.com/en-us/adaptive-cards/sdk/rendering-cards/javascript/actions).

## Problem Statement

Treebark currently blocks interactive elements like `button`, `input`, `select`, `textarea`, and `form` for security reasons. However, there may be use cases where safe, template-driven interactive elements could be valuable, especially in content-driven applications.

## Key Questions to Explore

1. **Should we support interactive elements at all?** What's the use case?
2. **If yes, how do we maintain security?** No arbitrary JavaScript execution
3. **How would event handling work?** Context-based handlers vs. inline handlers
4. **What's the API surface?** Minimal and intuitive
5. **DOM-only or both renderers?** String renderer limitations

## Exploration 1: Button Tag with Context-Based Actions

### AdaptiveCards Pattern

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

### Possible Treebark Pattern

#### Option A: Single Context Handler (AdaptiveCards-style)

Template defines actions declaratively:
```javascript
{
  template: {
    div: {
      $children: [
        {
          button: {
            type: "button",
            "data-action": "save",
            "data-id": "123",
            $children: ["Save"]
          }
        },
        {
          button: {
            type: "button",
            "data-action": "delete",
            "data-id": "456",
            $children: ["Delete"]
          }
        }
      ]
    }
  },
  data: { /* template data */ }
}
```

Application provides a single handler:
```javascript
const fragment = renderToDOM(input, {
  onAction: (action, payload) => {
    switch(action) {
      case 'save':
        console.log('Save item', payload.id);
        break;
      case 'delete':
        console.log('Delete item', payload.id);
        break;
    }
  }
});
```

**Pros:**
- Clean separation: templates define structure, app defines behavior
- Single handler reduces boilerplate
- Easy to understand and maintain
- Aligns with declarative template philosophy

**Cons:**
- Requires DOM renderer (won't work in string renderer)
- Additional API surface in RenderOptions
- Need to decide how to extract action/payload from button

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

### Payload Extraction Strategy

If we go with context handlers, how do we extract action/payload?

**Strategy 1: Convention-based**
- Look for `data-action` attribute for action name
- Collect all `data-*` attributes as payload

**Strategy 2: Explicit configuration**
- Button has special `$action` property
```javascript
{
  button: {
    $action: "save",
    $actionData: { id: 123 },
    $children: ["Save"]
  }
}
```

**Strategy 3: Mixed**
- Support both conventions and explicit for flexibility

## Exploration 2: Form Elements

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

### Possible Form Pattern

#### Read-only Forms (Display Only)

```javascript
{
  template: {
    form: {
      $children: [
        { label: { for: "name", $children: ["Name:"] } },
        { input: { type: "text", id: "name", readonly: "true", value: "{{userName}}" } },
        
        { label: { for: "email", $children: ["Email:"] } },
        { input: { type: "email", id: "email", readonly: "true", value: "{{userEmail}}" } }
      ]
    }
  },
  data: { userName: "Alice", userEmail: "alice@example.com" }
}
```

**Use case:** Displaying form-like data (receipts, confirmations, etc.)

#### Interactive Forms with Context Handler

```javascript
{
  template: {
    form: {
      "data-form-id": "user-form",
      $children: [
        { label: { for: "name", $children: ["Name:"] } },
        { input: { type: "text", id: "name", name: "name", value: "{{userName}}" } },
        
        { label: { for: "email", $children: ["Email:"] } },
        { input: { type: "email", id: "email", name: "email", value: "{{userEmail}}" } },
        
        { button: { type: "submit", "data-action": "submitForm", $children: ["Save"] } }
      ]
    }
  },
  data: { userName: "Alice", userEmail: "alice@example.com" }
}

// Render with handler
const fragment = renderToDOM(input, {
  onAction: (action, payload) => {
    if (action === 'submitForm') {
      const formData = new FormData(payload.target.closest('form'));
      console.log('Form submitted:', Object.fromEntries(formData));
    }
  }
});
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
  'button': new Set(['type', 'disabled']),
  'input': new Set(['type', 'name', 'value', 'placeholder', 'readonly', 'disabled', 'checked']),
  'textarea': new Set(['name', 'rows', 'cols', 'placeholder', 'readonly', 'disabled']),
  'select': new Set(['name', 'multiple', 'disabled']),
  'option': new Set(['value', 'selected']),
  'label': new Set(['for']),
  'form': new Set(['data-form-id']) // Explicitly NOT action/method
};
```

### 3. Context Handler API

```typescript
interface RenderOptions {
  indent?: string | number | boolean;
  logger?: Logger;
  onAction?: ActionHandler; // NEW
}

type ActionHandler = (action: string, payload: ActionPayload) => void;

interface ActionPayload {
  target: HTMLElement;
  [key: string]: unknown; // Additional data-* attributes
}
```

### 4. DOM Renderer Changes

```javascript
function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = [], logger: Logger, onAction?: ActionHandler): void {
  // ... existing attribute handling ...
  
  // If button and onAction handler provided
  if (tag === 'button' && onAction) {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      
      const action = element.getAttribute('data-action');
      if (!action) {
        logger.warn('Button with onAction handler must have data-action attribute');
        return;
      }
      
      // Collect all data-* attributes as payload
      const payload: ActionPayload = { target: element };
      for (const attr of element.attributes) {
        if (attr.name.startsWith('data-') && attr.name !== 'data-action') {
          const key = attr.name.substring(5); // Remove 'data-' prefix
          payload[key] = attr.value;
        }
      }
      
      onAction(action, payload);
    });
  }
}
```

## Recommendations

Based on this exploration, here are potential paths forward:

### Path 1: Minimal - Button Tag Only

**Implementation:**
- Allow `button` tag in whitelist
- Support `type` and `disabled` attributes
- No special event handling - apps attach handlers externally
- Document best practices for using data-* attributes

**Pros:** Minimal change, clear security model, easy to understand
**Cons:** Doesn't provide much value over current workarounds

### Path 2: Button with Optional Context Handler

**Implementation:**
- Allow `button` tag in whitelist
- Add optional `onAction` to RenderOptions (DOM only)
- Auto-wire buttons with `data-action` to the handler
- Extract data-* attributes as payload

**Pros:** Elegant for simple cases, optional for complex cases
**Cons:** DOM-only feature, new API to maintain

### Path 3: Full Form Support with Context Handlers

**Implementation:**
- Allow button, input, select, textarea, label, form
- Strict attribute whitelisting (no action/method on form)
- Optional context handlers for both actions and form submission
- Comprehensive documentation on security model

**Pros:** Powerful for content-driven apps with forms
**Cons:** Large API surface, security concerns, complexity

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
