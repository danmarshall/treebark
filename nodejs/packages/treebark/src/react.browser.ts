// Browser (UMD) entry point for the React renderer.
//
// This deliberately exposes ONLY renderToReact so the global reads as
// window.Treebark.renderToReact — symmetric with renderToString / renderToDOM
// and free of the window.Treebark.Treebark self-reference. The idiomatic
// <Treebark> component stays an npm-only export (see react.ts); anyone
// authoring JSX already has a build step and imports from 'treebark/react'.
export { renderToReact } from './react.js';
