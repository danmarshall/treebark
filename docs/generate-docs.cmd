@echo off
REM Generate Jekyll documentation from README.md
REM Language-agnostic batch script for Windows

setlocal enabledelayedexpansion

REM Get the directory of this script (docs folder)
set "DOCS_DIR=%~dp0"
set "README_PATH=%DOCS_DIR%..\README.md"
set "INDEX_PATH=%DOCS_DIR%index.md"

REM Check if README.md exists
if not exist "%README_PATH%" (
    echo Error: README.md not found at %README_PATH%
    exit /b 1
)

REM Create front matter
(
echo ---
echo layout: default
echo title: Home
echo description: Safe tree structures for Markdown and content-driven apps
echo ---
echo.
) > "%INDEX_PATH%"

REM Append README content
type "%README_PATH%" >> "%INDEX_PATH%"

echo ✅ Successfully generated docs/index.md
echo 📄 Combined front matter with README.md