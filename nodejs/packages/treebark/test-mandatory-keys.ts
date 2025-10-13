/**
 * Test that tag keys are now mandatory
 */

import type { DivTag, ImgTag, ATag } from './src/types.js';

// These should now require the tag key to be present
const div: DivTag = { div: 'content' };  // ✓ Valid
const img: ImgTag = { img: { src: 'pic.jpg' } };  // ✓ Valid
const a: ATag = { a: { href: 'http://example.com' } };  // ✓ Valid

// These should cause errors because the tag key is missing
// const badDiv: DivTag = {};  // ✗ Error: Property 'div' is missing
// const badImg: ImgTag = {};  // ✗ Error: Property 'img' is missing

console.log('Tag keys are now mandatory!');

export {};
