---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review frontend files for compliance with Web Interface Guidelines.

## How It Works

1. Read the comprehensive guidelines in [references/web-interface-guidelines.md](./references/web-interface-guidelines.md).
2. Read the specified files (or prompt user for files/pattern).
3. Check against all rules in the guidelines.
4. Output findings in the terse `file:line` format.

## Usage

When a user provides a file or pattern argument:
1. Load guidelines from `./references/web-interface-guidelines.md`.
2. Read the specified files.
3. Apply all rules from the guidelines (Accessibility, Focus States, Forms, Animation, Typography, Content Handling, Images, Performance, Navigation & State, Touch & Interaction, Dark Mode, Locale & i18n, Hydration Safety, Hover States).
4. Output findings using the format specified in the guidelines.

If no files specified, ask the user which files to review.
