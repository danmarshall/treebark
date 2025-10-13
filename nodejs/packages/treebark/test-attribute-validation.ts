/**
 * Test the new attribute validation from the comment
 */

import type { TemplateObject } from './src/common.js';

// Test case 1: a tag should not have src attribute
const test1: TemplateObject = {
  a: {
    src: "a should not have src",  // Should be TypeScript error
  }
};

// Test case 2: img tag should not have href attribute
const test2: TemplateObject = {
  img: {
    href: "img should not have href",  // Should be TypeScript error
  }
};

// Valid cases for comparison
const valid1: TemplateObject = {
  a: {
    href: "http://example.com",  // Valid
    target: "_blank",  // Valid
  }
};

const valid2: TemplateObject = {
  img: {
    src: "image.jpg",  // Valid
    alt: "An image",  // Valid
  }
};

export {};
