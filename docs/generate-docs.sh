#!/bin/bash
# Generate Jekyll documentation from README.md
# Language-agnostic shell script for Unix/Linux/macOS

set -e

# Get the directory of this script (docs folder)
DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
README_PATH="$(dirname "$DOCS_DIR")/README.md"
INDEX_PATH="$DOCS_DIR/index.md"

# Check if README.md exists
if [ ! -f "$README_PATH" ]; then
    echo "Error: README.md not found at $README_PATH"
    exit 1
fi

# Create front matter
cat > "$INDEX_PATH" << 'EOF'
---
layout: default
title: Home
description: Safe HTML tree structures for Markdown and content-driven apps
---

EOF

# Append README content
cat "$README_PATH" >> "$INDEX_PATH"

echo "✅ Successfully generated docs/index.md"
echo "📄 Combined front matter with README.md"