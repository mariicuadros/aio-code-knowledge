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
    args = parser.parse_args()
    commit, index = build_index()
    result = generate(args.query, index, args.limit) if args.generate else ask(args.query, index, args.limit)
    result["index_commit"] = commit
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
