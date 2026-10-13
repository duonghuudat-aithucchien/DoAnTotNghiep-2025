"""Maintenance commands do not import Flask or load models until requested."""
import argparse
import json
from config import Settings
from application.bootstrap import build_dependencies


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["reindex", "check"])
    args = parser.parse_args()
    dependencies = build_dependencies(Settings.from_env())
    if args.command == "reindex":
        dependencies["retriever"].refresh(force=True)
        print(json.dumps(dependencies["retriever"].status(), ensure_ascii=False))
    else:
        for name in ["products", "conversations"]:
            dependencies[name].ping()
        print(json.dumps({"status": "OK", "llm_configured": dependencies["llm"].enabled}))


if __name__ == "__main__":
    main()

