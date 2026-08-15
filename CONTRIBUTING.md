# Contributing Guide

Thanks for contributing to this interview prep repository.

## Content conventions
- Prefer **pattern-first explanations** for DSA notes.
- Keep examples concise and interview-focused.
- Use Markdown headings consistently (`#`, `##`, `###`).
- Add complexity (`time` and `space`) for every new solution note.

## Solution file naming
- Use kebab-case and include clear problem identity.
- Keep language-specific files under existing folders in `solutions/`.
- Avoid duplicate files for the same problem unless they show a different approach.

## Markdown quality checks
Run before opening a PR:

```bash
python3 tools/validate_markdown_links.py
```

## Suggested PR checklist
- [ ] Links added/updated correctly
- [ ] No broken markdown links
- [ ] Topic index updated (`README.md` or folder README)
- [ ] Content reviewed for grammar and formatting
