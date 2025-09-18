# Documentation Setup

This directory contains the Jekyll-based documentation site for Treebark.

## Quick Start

To generate the documentation:

```bash
# From the repository root
npm run docs:generate
```

Or directly:
```bash
# Unix/Linux/macOS
./generate-docs.js

# Windows
generate-docs.cmd

# Or using Node directly
node generate-docs.js
```

## Jekyll Development

To work with Jekyll locally (requires Ruby and Bundler):

```bash
cd docs
bundle install
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000/treebark/`

## How It Works

The `generate-docs.js` script:

1. Reads the main `README.md` from the repository root
2. Prepends Jekyll front matter for proper layout and metadata
3. Outputs the combined content to `docs/index.md`

This ensures the documentation site always reflects the latest README content while maintaining proper Jekyll formatting.

## Files

- `_config.yml` - Jekyll site configuration
- `_layouts/default.html` - Main page layout with Treebark branding
- `Gemfile` - Ruby dependencies for Jekyll
- `index.md` - Generated from README.md (don't edit directly)

## GitHub Pages

This documentation is designed to work with GitHub Pages. When pushed to the main branch, GitHub will automatically build and deploy the site.