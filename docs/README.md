# Documentation Setup

This directory contains the Jekyll-based documentation site for Treebark.

## Quick Start

To generate the documentation:

```bash
# From the docs directory
./generate-docs.sh        # Unix/Linux/macOS
generate-docs.cmd         # Windows
```

## Language-Agnostic Design

The generation scripts use simple shell commands (concatenation) that work across all platforms and don't require any specific programming language runtime. This allows developers from any language ecosystem (Python, Go, Rust, etc.) to easily update the documentation.

## Jekyll Development

To work with Jekyll locally (requires Ruby and Bundler):

```bash
cd docs
bundle install
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000/treebark/`

## How It Works

The generation scripts:

1. Read the main `README.md` from the repository root (one level up)
2. Prepend Jekyll front matter for proper layout and metadata
3. Output the combined content to `index.md` in the current directory

This uses simple file concatenation available in all shell environments.

## Files

- `_config.yml` - Jekyll site configuration
- `_layouts/default.html` - Main page layout with Treebark branding
- `Gemfile` - Ruby dependencies for Jekyll
- `index.md` - Generated from README.md (don't edit directly)
- `generate-docs.sh` - Unix/Linux/macOS shell script
- `generate-docs.cmd` - Windows batch script

## GitHub Pages

This documentation is designed to work with GitHub Pages. When pushed to the main branch, GitHub will automatically build and deploy the site.