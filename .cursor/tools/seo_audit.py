#!/usr/bin/env python3
"""
SEO Audit Tool — Lumina SEO Agent
Analyzes HTML files and URLs for SEO issues.

Usage:
  python seo_audit.py --file index.html
  python seo_audit.py --url https://example.com
  python seo_audit.py --dir ./src/pages/
"""

import re
import sys
import json
import argparse
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

# ── Color output ──────────────────────────────────────────────────────────────
RED    = "\033[91m"
YELLOW = "\033[93m"
GREEN  = "\033[92m"
BLUE   = "\033[94m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


class SEOAuditParser(HTMLParser):
    """Extract SEO-relevant data from HTML."""
    
    def __init__(self):
        super().__init__()
        self.title = None
        self.meta = {}
        self.h1s = []
        self.h2s = []
        self.h3s = []
        self.images = []
        self.links = []
        self.canonical = None
        self.robots_meta = None
        self.og_tags = {}
        self.schema_scripts = []
        self.current_tag = None
        self._current_heading = None
        self._in_title = False
        self._in_heading = False
        self._heading_text = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.current_tag = tag
        
        if tag == "title":
            self._in_title = True
            
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")
            
            if name == "description":
                self.meta["description"] = content
            elif name == "robots":
                self.robots_meta = content
            elif name == "keywords":
                self.meta["keywords"] = content
            elif prop == "og:title":
                self.og_tags["title"] = content
            elif prop == "og:description":
                self.og_tags["description"] = content
            elif prop == "og:image":
                self.og_tags["image"] = content
            elif prop == "og:type":
                self.og_tags["type"] = content
                
        elif tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href", "")
            if rel == "canonical":
                self.canonical = href
                
        elif tag in ("h1", "h2", "h3"):
            self._in_heading = True
            self._current_heading = tag
            self._heading_text = ""
            
        elif tag == "img":
            self.images.append({
                "src": attrs_dict.get("src", ""),
                "alt": attrs_dict.get("alt"),
                "width": attrs_dict.get("width"),
                "height": attrs_dict.get("height"),
                "loading": attrs_dict.get("loading"),
            })
            
        elif tag == "a":
            self.links.append({
                "href": attrs_dict.get("href", ""),
                "text": "",
                "rel": attrs_dict.get("rel", ""),
            })
            
        elif tag == "script" and attrs_dict.get("type") == "application/ld+json":
            self.current_tag = "schema_script"

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag in ("h1", "h2", "h3"):
            if self._current_heading == "h1":
                self.h1s.append(self._heading_text.strip())
            elif self._current_heading == "h2":
                self.h2s.append(self._heading_text.strip())
            elif self._current_heading == "h3":
                self.h3s.append(self._heading_text.strip())
            self._in_heading = False
            self._heading_text = ""

    def handle_data(self, data):
        if self._in_title:
            self.title = (self.title or "") + data
        elif self._in_heading:
            self._heading_text += data


# ── Audit Checks ─────────────────────────────────────────────────────────────

def check_title(data: dict) -> list:
    issues = []
    title = data.get("title", "")
    
    if not title:
        issues.append(("critical", "❌ Missing <title> tag"))
    else:
        length = len(title)
        if length < 30:
            issues.append(("warning", f"⚠️  Title too short ({length} chars) — aim for 50–60 chars: '{title}'"))
        elif length > 60:
            issues.append(("warning", f"⚠️  Title too long ({length} chars) — Google truncates at ~60 chars: '{title}'"))
        else:
            issues.append(("ok", f"✅ Title length ok ({length} chars): '{title}'"))
    
    return issues


def check_meta_description(data: dict) -> list:
    issues = []
    desc = data.get("meta", {}).get("description", "")
    
    if not desc:
        issues.append(("critical", "❌ Missing meta description"))
    else:
        length = len(desc)
        if length < 120:
            issues.append(("warning", f"⚠️  Meta description short ({length} chars) — aim for 120–155: '{desc[:80]}...'"))
        elif length > 155:
            issues.append(("warning", f"⚠️  Meta description too long ({length} chars) — truncated in SERPs: '{desc[:80]}...'"))
        else:
            issues.append(("ok", f"✅ Meta description ok ({length} chars)"))
    
    return issues


def check_headings(data: dict) -> list:
    issues = []
    h1s = data.get("h1s", [])
    h2s = data.get("h2s", [])
    
    if not h1s:
        issues.append(("critical", "❌ Missing H1 tag — every page must have one H1"))
    elif len(h1s) > 1:
        issues.append(("warning", f"⚠️  Multiple H1 tags ({len(h1s)}) — use only one H1 per page"))
        for h in h1s:
            issues.append(("info", f"   H1: '{h}'"))
    else:
        issues.append(("ok", f"✅ Single H1: '{h1s[0]}'"))
    
    if not h2s:
        issues.append(("warning", "⚠️  No H2 tags found — add section headings for structure"))
    else:
        issues.append(("ok", f"✅ {len(h2s)} H2 headings found"))
    
    return issues


def check_images(data: dict) -> list:
    issues = []
    images = data.get("images", [])
    
    if not images:
        return [("info", "ℹ️  No images found")]
    
    missing_alt = [img for img in images if img.get("alt") is None]
    empty_alt   = [img for img in images if img.get("alt") == ""]
    missing_dim = [img for img in images if not img.get("width") or not img.get("height")]
    non_lazy    = [img for img in images if img.get("loading") != "lazy"]
    
    if missing_alt:
        issues.append(("critical", f"❌ {len(missing_alt)} image(s) missing alt attribute (accessibility + SEO)"))
    
    if empty_alt:
        issues.append(("warning", f"⚠️  {len(empty_alt)} image(s) have empty alt text — add descriptive alt text"))
    
    if missing_dim:
        issues.append(("warning", f"⚠️  {len(missing_dim)} image(s) missing width/height — causes CLS (Core Web Vitals)"))
    
    ok_count = len(images) - len(missing_alt) - len(empty_alt)
    if ok_count > 0:
        issues.append(("ok", f"✅ {ok_count}/{len(images)} images have alt text"))
    
    return issues


def check_canonical(data: dict) -> list:
    issues = []
    canonical = data.get("canonical")
    
    if not canonical:
        issues.append(("warning", "⚠️  Missing canonical tag — add <link rel='canonical'> to prevent duplicate content"))
    else:
        parsed = urlparse(canonical)
        if not parsed.scheme:
            issues.append(("critical", f"❌ Canonical tag uses relative URL — must be absolute: '{canonical}'"))
        elif parsed.scheme != "https":
            issues.append(("warning", f"⚠️  Canonical tag uses HTTP — should use HTTPS: '{canonical}'"))
        else:
            issues.append(("ok", f"✅ Canonical tag present: '{canonical}'"))
    
    return issues


def check_og_tags(data: dict) -> list:
    issues = []
    og = data.get("og_tags", {})
    
    required = ["title", "description", "image", "type"]
    missing = [tag for tag in required if tag not in og]
    
    if missing:
        issues.append(("warning", f"⚠️  Missing Open Graph tags: og:{', og:'.join(missing)}"))
    else:
        issues.append(("ok", "✅ All required Open Graph tags present"))
    
    return issues


def check_robots(data: dict) -> list:
    issues = []
    robots = data.get("robots_meta")
    
    if robots:
        if "noindex" in robots.lower():
            issues.append(("critical", f"❌ Page has 'noindex' in robots meta tag: '{robots}' — will be removed from Google"))
        elif "nofollow" in robots.lower():
            issues.append(("warning", f"⚠️  Page has 'nofollow' in robots meta tag: '{robots}' — links won't pass PageRank"))
        else:
            issues.append(("ok", f"✅ Robots meta: '{robots}'"))
    else:
        issues.append(("ok", "✅ No robots meta restrictions (default: index, follow)"))
    
    return issues


# ── Report Generator ──────────────────────────────────────────────────────────

def generate_report(filename: str, html: str) -> dict:
    parser = SEOAuditParser()
    parser.feed(html)
    
    data = {
        "title": parser.title,
        "meta": parser.meta,
        "h1s": parser.h1s,
        "h2s": parser.h2s,
        "h3s": parser.h3s,
        "images": parser.images,
        "links": parser.links,
        "canonical": parser.canonical,
        "robots_meta": parser.robots_meta,
        "og_tags": parser.og_tags,
    }
    
    all_issues = []
    all_issues.extend(check_title(data))
    all_issues.extend(check_meta_description(data))
    all_issues.extend(check_headings(data))
    all_issues.extend(check_images(data))
    all_issues.extend(check_canonical(data))
    all_issues.extend(check_og_tags(data))
    all_issues.extend(check_robots(data))
    
    return {"file": filename, "data": data, "issues": all_issues}


def print_report(report: dict):
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}📊 SEO Audit: {report['file']}{RESET}")
    print(f"{'='*60}")
    
    critical = [i for i in report["issues"] if i[0] == "critical"]
    warnings = [i for i in report["issues"] if i[0] == "warning"]
    ok_items = [i for i in report["issues"] if i[0] == "ok"]
    
    score = 100 - (len(critical) * 20) - (len(warnings) * 5)
    score = max(0, min(100, score))
    
    color = GREEN if score >= 80 else (YELLOW if score >= 60 else RED)
    print(f"\n{BOLD}SEO Score: {color}{score}/100{RESET}")
    print(f"Critical: {RED}{len(critical)}{RESET} | Warnings: {YELLOW}{len(warnings)}{RESET} | OK: {GREEN}{len(ok_items)}{RESET}\n")
    
    if critical:
        print(f"{RED}{BOLD}🔴 CRITICAL ISSUES{RESET}")
        for _, msg in critical:
            print(f"  {RED}{msg}{RESET}")
        print()
    
    if warnings:
        print(f"{YELLOW}{BOLD}🟡 WARNINGS{RESET}")
        for _, msg in warnings:
            print(f"  {YELLOW}{msg}{RESET}")
        print()
    
    if ok_items:
        print(f"{GREEN}{BOLD}🟢 PASSING{RESET}")
        for _, msg in ok_items:
            print(f"  {GREEN}{msg}{RESET}")
        print()
    
    # Quick stats
    data = report["data"]
    print(f"{BLUE}{BOLD}📈 PAGE STATS{RESET}")
    print(f"  Title: {len(data.get('title') or '')} chars")
    print(f"  Meta Desc: {len(data.get('meta', {}).get('description') or '')} chars")
    print(f"  H1: {len(data.get('h1s', []))}, H2: {len(data.get('h2s', []))}, H3: {len(data.get('h3s', []))}")
    print(f"  Images: {len(data.get('images', []))}")
    print(f"  Links: {len(data.get('links', []))}")
    print()


def audit_file(filepath: str):
    path = Path(filepath)
    if not path.exists():
        print(f"{RED}Error: File not found: {filepath}{RESET}")
        return
    
    html = path.read_text(encoding="utf-8", errors="ignore")
    report = generate_report(str(path), html)
    print_report(report)


def audit_directory(dirpath: str):
    path = Path(dirpath)
    html_files = list(path.rglob("*.html"))
    
    if not html_files:
        print(f"{YELLOW}No HTML files found in {dirpath}{RESET}")
        return
    
    print(f"\n{BOLD}Found {len(html_files)} HTML files{RESET}")
    
    for f in html_files:
        html = f.read_text(encoding="utf-8", errors="ignore")
        report = generate_report(str(f), html)
        print_report(report)


def main():
    parser = argparse.ArgumentParser(
        description="SEO Audit Tool — Analyze HTML files for SEO issues",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seo_audit.py --file index.html
  python seo_audit.py --dir ./public/
  python seo_audit.py --file blog-post.html --json > report.json
        """
    )
    parser.add_argument("--file", help="Audit a single HTML file")
    parser.add_argument("--dir",  help="Audit all HTML files in a directory")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    if not args.file and not args.dir:
        parser.print_help()
        sys.exit(1)
    
    if args.file:
        audit_file(args.file)
    elif args.dir:
        audit_directory(args.dir)


if __name__ == "__main__":
    main()
