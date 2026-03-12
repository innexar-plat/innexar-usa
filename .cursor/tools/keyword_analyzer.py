#!/usr/bin/env python3
"""
Keyword Analyzer — SEO Agent Tool
Analyzes keyword opportunities from a seed list.

Usage:
  python keyword_analyzer.py --keywords "pilates, pilates para iniciantes, pilates beneficios"
  python keyword_analyzer.py --file keywords.txt
  python keyword_analyzer.py --url https://example.com (extracts keywords from page)
"""

import re
import sys
import json
import argparse
from collections import Counter
from pathlib import Path


# ── Keyword Classification ────────────────────────────────────────────────────

INFORMATIONAL_SIGNALS = [
    "como", "what", "how", "why", "when", "where", "who", "which",
    "what is", "how to", "guide", "tutorial", "learn", "understand",
    "explain", "definition", "meaning", "examples", "tips", "ideas",
    "benefits", "beneficios", "vantagens", "o que é", "como fazer",
    "por que", "quando", "onde", "quem", "qual", "diferença entre",
    "difference between", "vs", "versus",
]

COMMERCIAL_SIGNALS = [
    "best", "top", "review", "compare", "comparison", "vs", "versus",
    "melhor", "melhores", "comparação", "avaliação", "análise",
    "worth it", "pros and cons", "alternatives", "alternativas",
    "rating", "ranked", "list of",
]

TRANSACTIONAL_SIGNALS = [
    "buy", "price", "cost", "cheap", "discount", "offer", "deal",
    "comprar", "preço", "valor", "barato", "desconto", "promoção",
    "subscribe", "sign up", "register", "download", "free trial",
    "schedule", "agendar", "reservar", "matricular", "inscrever",
    "near me", "perto de mim", "online", "delivery",
]

NAVIGATIONAL_SIGNALS = [
    "login", "entrar", "site", "website", "official", "contact",
    "contato", "phone", "telefone", "address", "endereço",
    ".com", ".br", "brand name",
]


def classify_intent(keyword: str) -> str:
    kw = keyword.lower()
    
    for signal in TRANSACTIONAL_SIGNALS:
        if signal in kw:
            return "🟢 Transactional"
    
    for signal in COMMERCIAL_SIGNALS:
        if signal in kw:
            return "🟡 Commercial"
    
    for signal in NAVIGATIONAL_SIGNALS:
        if signal in kw:
            return "🟣 Navigational"
    
    for signal in INFORMATIONAL_SIGNALS:
        if signal in kw:
            return "🔵 Informational"
    
    return "🔵 Informational"  # default


def estimate_difficulty(keyword: str) -> str:
    """Rough difficulty estimate based on keyword characteristics."""
    words = keyword.split()
    length = len(words)
    
    if length == 1:
        return "🔴 Very Hard"
    elif length == 2:
        return "🟠 Hard"
    elif length == 3:
        return "🟡 Medium"
    elif length >= 4:
        return "🟢 Easy (Long-tail)"
    
    return "🟡 Medium"


def estimate_volume_tier(keyword: str) -> str:
    """Rough volume tier estimate."""
    words = keyword.split()
    length = len(words)
    
    if length == 1:
        return "High (10k–100k+)"
    elif length == 2:
        return "Medium (1k–10k)"
    elif length == 3:
        return "Low-Medium (100–1k)"
    else:
        return "Low (10–500) — Long-tail"


def suggest_content_type(intent: str, keyword: str) -> str:
    kw = keyword.lower()
    
    if "🔵" in intent:  # Informational
        if any(w in kw for w in ["como", "how to", "guide", "tutorial", "dicas", "tips"]):
            return "📚 How-to Guide / Tutorial"
        elif any(w in kw for w in ["o que é", "what is", "definition", "beneficios", "benefits"]):
            return "📖 Educational Article / Pillar Page"
        else:
            return "📝 Blog Post"
    
    elif "🟡" in intent:  # Commercial
        return "⚖️  Comparison / Review Page"
    
    elif "🟢" in intent:  # Transactional
        return "💰 Landing Page / Product/Service Page"
    
    elif "🟣" in intent:  # Navigational
        return "🏠 Homepage / Brand Page"
    
    return "📝 Blog Post"


def generate_title_suggestions(keyword: str, intent: str) -> list:
    titles = []
    kw = keyword.title()
    kw_lower = keyword.lower()
    
    if "🔵" in intent:
        titles = [
            f"{kw}: Complete Beginner's Guide (2025)",
            f"Everything You Need to Know About {kw}",
            f"{kw} — Benefits, Tips & Best Practices",
            f"What Is {kw}? A Comprehensive Guide",
        ]
    elif "🟡" in intent:
        titles = [
            f"Best {kw}: Top 10 Options Reviewed (2025)",
            f"{kw}: Pros, Cons & Expert Recommendations",
            f"The Ultimate {kw} Comparison Guide",
        ]
    elif "🟢" in intent:
        titles = [
            f"Get Started with {kw} — Sign Up Today",
            f"{kw}: Affordable Plans Starting at $X/mo",
            f"Book Your {kw} Session Online",
        ]
    
    return titles[:3]


def analyze_keywords(keywords: list) -> None:
    print("\n" + "="*70)
    print("🔍 KEYWORD ANALYSIS REPORT")
    print("="*70)
    
    results = []
    
    for kw in keywords:
        kw = kw.strip()
        if not kw:
            continue
        
        intent     = classify_intent(kw)
        difficulty = estimate_difficulty(kw)
        volume     = estimate_volume_tier(kw)
        content    = suggest_content_type(intent, kw)
        titles     = generate_title_suggestions(kw, intent)
        
        results.append({
            "keyword": kw,
            "intent": intent,
            "difficulty": difficulty,
            "volume": volume,
            "content_type": content,
            "title_suggestions": titles,
        })
    
    # Sort by difficulty (easiest first)
    difficulty_order = {
        "🟢 Easy (Long-tail)": 0,
        "🟡 Medium": 1,
        "🟠 Hard": 2,
        "🔴 Very Hard": 3,
    }
    results.sort(key=lambda x: difficulty_order.get(x["difficulty"], 2))
    
    for i, r in enumerate(results, 1):
        print(f"\n{'─'*70}")
        print(f"\n{i}. \033[1m{r['keyword']}\033[0m")
        print(f"   Intent:     {r['intent']}")
        print(f"   Difficulty: {r['difficulty']}")
        print(f"   Volume:     {r['volume']}")
        print(f"   Content:    {r['content_type']}")
        
        if r["title_suggestions"]:
            print(f"   \033[94mTitle Ideas:\033[0m")
            for t in r["title_suggestions"]:
                print(f"     → {t}")
    
    # Summary
    print(f"\n{'='*70}")
    print("📊 SUMMARY")
    print(f"{'='*70}")
    print(f"Total keywords: {len(results)}")
    
    intents = Counter(r["intent"] for r in results)
    print("\nBy Intent:")
    for intent, count in intents.most_common():
        print(f"  {intent}: {count}")
    
    diffs = Counter(r["difficulty"] for r in results)
    print("\nBy Difficulty:")
    for diff, count in diffs.most_common():
        print(f"  {diff}: {count}")
    
    # Priority recommendations
    easy_trans = [r for r in results if "Easy" in r["difficulty"] and "🟢" in r["intent"]]
    easy_info  = [r for r in results if "Easy" in r["difficulty"] and "🔵" in r["intent"]]
    
    print("\n💡 QUICK WIN OPPORTUNITIES:")
    if easy_trans:
        print(f"\n  High-Priority (Easy + Transactional):")
        for r in easy_trans[:3]:
            print(f"    → {r['keyword']}")
    
    if easy_info:
        print(f"\n  Content Opportunities (Easy + Informational):")
        for r in easy_info[:3]:
            print(f"    → {r['keyword']}")
    
    print()


def main():
    parser = argparse.ArgumentParser(
        description="Keyword Analyzer — Classify and prioritize keywords for SEO",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python keyword_analyzer.py --keywords "pilates, pilates para iniciantes, como fazer pilates"
  python keyword_analyzer.py --file keywords.txt
        """
    )
    parser.add_argument("--keywords", help='Comma-separated keywords: "kw1, kw2, kw3"')
    parser.add_argument("--file",     help="Text file with one keyword per line")
    
    args = parser.parse_args()
    
    keywords = []
    
    if args.keywords:
        keywords = [kw.strip() for kw in args.keywords.split(",") if kw.strip()]
    
    elif args.file:
        path = Path(args.file)
        if not path.exists():
            print(f"Error: File not found: {args.file}")
            sys.exit(1)
        keywords = [line.strip() for line in path.read_text().splitlines() if line.strip()]
    
    else:
        parser.print_help()
        sys.exit(1)
    
    analyze_keywords(keywords)


if __name__ == "__main__":
    main()
