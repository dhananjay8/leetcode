#!/usr/bin/env python3
"""Validate local Markdown links in this repository.

Usage:
    python3 tools/validate_markdown_links.py
"""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import unquote


LINK_PATTERN = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


def iter_markdown_files(root: Path) -> list[Path]:
    return sorted(root.rglob("*.md"))


def resolve_target(md_file: Path, target: str) -> Path:
    clean_target = unquote(target.split()[0].split("#")[0])
    return (md_file.parent / clean_target).resolve()


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    missing: list[tuple[Path, str]] = []

    for md_file in iter_markdown_files(root):
        content = md_file.read_text(encoding="utf-8", errors="ignore")
        for target in LINK_PATTERN.findall(content):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            resolved = resolve_target(md_file, target)
            if not resolved.exists():
                missing.append((md_file.relative_to(root), target))

    if missing:
        print("Broken local markdown links found:")
        for source, target in missing:
            print(f"  - {source} -> {target}")
        return 1

    print("All local markdown links are valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
