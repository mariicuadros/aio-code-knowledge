"""Entry point for public-only evidence retrieval."""

import argparse
import json

from rag.engine import ask, build_index
from rag.generate import generate


def main() -> None:
    parser = argparse.ArgumentParser(description="Query AIO CODE approved public sources")
    parser.add_argument("command", choices=["ask"])
    parser.add_argument("query")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--generate", action="store_true", help="Generate a review-only draft with a configured model")
    parser.add_argument("--scope", choices=['current','historical'], default='current', help='Historical scope returns research passages only, never current identity answers')
    args = parser.parse_args()
    commit, index = build_index()
    if args.scope == 'historical':
        if args.generate: parser.error('Historical scope is retrieval-only')
        from rag.engine import search
        result = {'status':'historical_research_only','sources':search(args.query,index,args.limit,scope='historical')}
    else:
        result = generate(args.query, index, args.limit) if args.generate else ask(args.query, index, args.limit)
    result["index_commit"] = commit
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
