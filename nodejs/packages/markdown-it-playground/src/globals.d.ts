// Global type declarations for CDN-loaded libraries

import type JSYaml from 'js-yaml';
import type MarkdownIt from 'markdown-it';

declare const jsyaml: typeof JSYaml;
declare const markdownit: typeof MarkdownIt;
declare const MarkdownItTreebark: (md: MarkdownIt, options?: { data?: unknown; indent?: string | boolean; yaml?: boolean }) => void;
