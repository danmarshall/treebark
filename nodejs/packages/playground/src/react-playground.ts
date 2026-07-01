import { examples } from './examples/index.js';

(window as any).TreebarkExamples = examples;

document.addEventListener('DOMContentLoaded', function () {
  const select = document.getElementById('example-select') as HTMLSelectElement;
  if (!select) return;

  const exampleIds = Object.keys(examples);
  exampleIds.forEach((id) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = id;
    select.appendChild(option);
  });

  if (exampleIds.length > 0) {
    select.value = exampleIds[0];
    select.dispatchEvent(new Event('change'));
  }
});
