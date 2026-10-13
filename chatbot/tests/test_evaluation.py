from evaluation.run import ranking_metrics


def test_ranking_metrics_use_relevant_sets_not_hit_count_only():
    result = ranking_metrics(["a", "x", "b"], ["a", "b", "c"], k=3)
    assert result["recall"] == 2 / 3
    assert result["mrr"] == 1
    assert 0 < result["ndcg"] < 1


def test_empty_expected_ids_do_not_inflate_recall():
    assert ranking_metrics([], [])["recall"] is None

