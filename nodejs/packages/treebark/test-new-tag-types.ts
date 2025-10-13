/**
 * Test that the new tag types work correctly
 */

import type { DivTag, ImgTag, ATag, TemplateObject } from './src/types.js';

// Test individual tag types
const divTag: DivTag = { div: 'content' };
const imgTag: ImgTag = { img: { src: 'image.jpg', alt: 'test' } };
const aTag: ATag = { a: { href: 'http://example.com', $children: ['link'] } };

// Test that TemplateObject accepts all tag types
const template1: TemplateObject = { div: 'content' };
const template2: TemplateObject = { img: { src: 'test.jpg' } };
const template3: TemplateObject = { a: { href: 'http://example.com' } };

// Test $if type
const template4: TemplateObject = {
  $if: {
    $check: 'test',
    $then: { div: 'yes' }
  }
};

console.log('All type tests passed!');

export {};
