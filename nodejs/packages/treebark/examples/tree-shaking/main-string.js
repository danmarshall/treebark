// Example: Import from string subpath for optimal tree shaking
import { renderToString } from 'treebark/string';

const html = renderToString({
  template: {
    div: {
      class: "greeting",
      $children: ["Hello {{name}}!"]
    }
  },
  data: { name: "World" }
});

console.log(html);
