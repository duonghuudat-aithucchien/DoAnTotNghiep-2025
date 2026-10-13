"""Reproducible retrieval/query benchmark. Fixture metrics are never production claims."""
import argparse
from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import math
import statistics
import time

from config import Settings, BASE_DIR
from application.bootstrap import build_dependencies
from application.understanding import baseline_plan, validate_llm_plan
from application.retrieval import HybridRetriever
from domain.models import matching_variants
from infrastructure.embedding import SentenceEmbedding
from infrastructure.repositories import MemoryProducts


def ranking_metrics(retrieved, expected, k=5):
    relevant = set(expected)
    if not relevant:
        return {"recall": None, "mrr": None, "ndcg": None}
    hits = [identifier in relevant for identifier in retrieved[:k]]
    recall = len(set(retrieved[:k]) & relevant) / len(relevant)
    mrr = next((1 / (rank + 1) for rank, hit in enumerate(hits) if hit), 0)
    dcg = sum(1 / math.log2(rank + 2) for rank, hit in enumerate(hits) if hit)
    ideal = sum(1 / math.log2(rank + 2) for rank in range(min(len(relevant), k)))
    return {"recall": recall, "mrr": mrr, "ndcg": dcg / ideal}


def macro_f1(rows):
    labels = sorted({row["expected_intent"] for row in rows} | {row["predicted_intent"] for row in rows})
    values = []
    for label in labels:
        tp = sum(row["expected_intent"] == label and row["predicted_intent"] == label for row in rows)
        fp = sum(row["expected_intent"] != label and row["predicted_intent"] == label for row in rows)
        fn = sum(row["expected_intent"] == label and row["predicted_intent"] != label for row in rows)
        values.append(2 * tp / (2 * tp + fp + fn) if tp + fp + fn else 0)
    return statistics.mean(values) if values else 0


def evaluate(cases, retriever, llm=None, mode="bm25"):
    rows = []
    for case in cases:
        started = time.perf_counter()
        plan = baseline_plan(case["query"], case.get("state"))
        if llm:
            payload, _ = llm.plan(case["query"], case.get("state", {}))
            plan = validate_llm_plan(payload, case["query"], plan)
        retrieved = []
        products = []
        if plan.intent in {"product_search", "stock_check", "outfit_advice"}:
            products, _ = retriever.search(plan.query + " " + plan.filters.get("category", ""), plan.filters, mode=mode, allow_category_fallback=False)
            retrieved = [product["id"] for product in products]
        expected = case.get("expected_product_ids", [])
        filters_match = plan.filters == case.get("filters", {})
        row = {
            "id": case["id"], "expected_intent": case["intent"], "predicted_intent": plan.intent,
            "expected_ids": expected, "retrieved_ids": retrieved,
            "expected_filters": case.get("filters", {}), "predicted_filters": plan.filters,
            "filters_correct": filters_match, "latency_ms": (time.perf_counter() - started) * 1000,
            "constraint_valid": all(matching_variants(product, plan.filters) for product in products),
            **ranking_metrics(retrieved, expected),
        }
        rows.append(row)
    retrieval_rows = [row for row in rows if row["recall"] is not None]
    negatives = [row for row, case in zip(rows, cases) if not case.get("expected_product_ids") and case["intent"] in {"product_search", "stock_check", "outfit_advice"}]
    latencies = sorted(row["latency_ms"] for row in rows)
    report = {
        "case_count": len(rows), "retrieval_case_count": len(retrieval_rows),
        "intent_macro_f1": macro_f1(rows),
        "filter_exact_match": statistics.mean(row["filters_correct"] for row in rows),
        "recall_at_5": statistics.mean(row["recall"] for row in retrieval_rows) if retrieval_rows else None,
        "mrr_at_5": statistics.mean(row["mrr"] for row in retrieval_rows) if retrieval_rows else None,
        "ndcg_at_5": statistics.mean(row["ndcg"] for row in retrieval_rows) if retrieval_rows else None,
        "negative_query_accuracy": statistics.mean(not row["retrieved_ids"] for row in negatives) if negatives else None,
        "constraint_validity": statistics.mean(row["constraint_valid"] for row in rows),
        "p50_retrieval_pipeline_ms": latencies[int((len(rows) - 1) * .5)],
        "p95_retrieval_pipeline_ms": latencies[int((len(rows) - 1) * .95)],
        "generation_groundedness": "not_measured_use_evaluation.answers",
        "rows": rows,
    }
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default=str(BASE_DIR / "evaluation/dataset.jsonl"))
    parser.add_argument("--catalog", default=str(BASE_DIR / "evaluation/catalog.json"))
    parser.add_argument("--live", action="store_true", help="Use Mongo catalog; dataset IDs must be real ObjectIds")
    parser.add_argument("--dense", action="store_true")
    parser.add_argument("--llm-routing", action="store_true", help="Calls billed Gemini API; disabled by default")
    parser.add_argument("--embedding-model", action="append", help="Repeat to compare multiple models on identical labels")
    parser.add_argument("--embedding-revision", default="", help="Immutable model commit; use with a single model")
    parser.add_argument("--mode", choices=["bm25", "dense", "hybrid"], default="bm25")
    parser.add_argument("--output", default=str(BASE_DIR / "evaluation/reports/latest.json"))
    parser.add_argument("--min-recall", type=float, default=0)
    parser.add_argument("--min-f1", type=float, default=0)
    args = parser.parse_args()
    dataset_path = Path(args.dataset)
    cases = [json.loads(line) for line in dataset_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if not cases:
        parser.error("Evaluation dataset cannot be empty")
    settings = Settings.from_env() if args.live or args.llm_routing else Settings(storage_mode="memory", embedding_enabled=args.dense)
    settings = replace(settings, embedding_enabled=args.dense, index_refresh_seconds=3600)
    dependencies = build_dependencies(settings)
    products = dependencies["products"] if args.live else MemoryProducts(json.loads(Path(args.catalog).read_text(encoding="utf-8")))
    if args.live and any(case.get("provenance") == "synthetic_fixture_not_production" for case in cases):
        parser.error("Live evaluation requires a separately labeled real-catalog dataset")
    if args.llm_routing and not dependencies["llm"].enabled:
        parser.error("LLM routing requires a configured Gemini provider")
    runs = []
    for model in args.embedding_model or [settings.embedding_model]:
        current = replace(settings, embedding_model=model, embedding_revision=args.embedding_revision or settings.embedding_revision)
        retriever = HybridRetriever(products, current, SentenceEmbedding(current) if args.dense else None)
        retriever.refresh(force=True)
        if args.dense and not retriever.status()["dense_available"]:
            raise RuntimeError("Dense model failed to load. Refusing to publish a dense benchmark as BM25.")
        report = evaluate(cases, retriever, dependencies["llm"] if args.llm_routing else None, args.mode)
        runs.append({"embedding_model": model if args.dense else None, "embedding_revision": retriever.embedding.resolved_revision if args.dense else None, "retrieval_min_cosine": current.retrieval_min_score, "hard_constraints_applied": True, "category_fallback_enabled": False, "mode": args.mode, **report})
    output = {
        "dataset_scope": "real_catalog" if args.live else "synthetic_fixture",
        "warning": "Fixture results demonstrate regression coverage, not generalization or real-world performance.",
        "dataset_sha256": hashlib.sha256(dataset_path.read_bytes()).hexdigest(),
        "prompt_version": settings.prompt_version,
        "timestamp": datetime.now(timezone.utc).isoformat(), "runs": runs,
    }
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({**output, "runs": [{key: value for key, value in run.items() if key != "rows"} for run in runs]}, ensure_ascii=False, indent=2))
    if any(run["intent_macro_f1"] < args.min_f1 or (run["recall_at_5"] or 0) < args.min_recall for run in runs):
        raise SystemExit(1)


if __name__ == "__main__":
    main()

