/**
 * Test that empty objects are rejected (tag key is mandatory)
 */

import type { DivTag, ImgTag } from './src/types.js';

// These should cause TypeScript errors
const badDiv: DivTag = {};  // Error: Property 'div' is missing
const badImg: ImgTag = {};  // Error: Property 'img' is missing

export {};
