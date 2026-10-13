from domain.models import matching_variants, public_product
from application.retrieval import reciprocal_rank_fusion


def test_same_variant_must_satisfy_size_color_and_budget(dependencies):
    product = dependencies["products"].by_ids(["shirt-black"])[0]
    product["variants"] = [
        {"size": "L", "color": "trắng", "price": 400000, "stock": 5, "isActive": True},
        {"size": "M", "color": "đen", "price": 400000, "stock": 5, "isActive": True},
    ]
    assert matching_variants(product, {"size": "L", "color": "đen"}) == []


def test_uses_variant_sale_price(dependencies):
    product = dependencies["products"].by_ids(["shirt-black"])[0]
    assert matching_variants(product, {"size": "L", "max_price": 370000}) == []
    result = public_product(product, {"size": "L"}, "http://localhost:3000")
    assert result["price"] == 420000
    assert result["salePrice"] == 378000


def test_excludes_disabled_and_sold_out_products(dependencies):
    result, metadata = dependencies["retriever"].search("áo sơ mi đen", {"category": "áo sơ mi", "color": "đen"})
    assert [product["id"] for product in result] == ["shirt-black"]
    assert metadata["dense_available"] is False


def test_live_stock_changes_take_effect_without_reembedding(dependencies):
    retriever = dependencies["retriever"]
    result, _ = retriever.search("áo sơ mi đen", {"category": "áo sơ mi", "color": "đen"})
    assert result
    doc = next(product for product in dependencies["products"].documents if product["id"] == "shirt-black")
    for variant in doc["variants"]:
        variant["stock"] = 0
    result, _ = retriever.search("áo sơ mi đen", {"category": "áo sơ mi", "color": "đen"})
    assert result == []


def test_reindex_discovers_new_product(dependencies):
    retriever = dependencies["retriever"]
    retriever.refresh()
    dependencies["products"].documents.append({
        "id": "new-item", "name": "Áo sơ mi xanh mới", "type": "áo sơ mi",
        "price": 200000, "countInStock": 2, "sizes": ["L"], "colors": ["xanh"],
    })
    retriever.refresh(force=True)
    result, _ = retriever.search("áo sơ mi xanh", {"category": "áo sơ mi", "color": "xanh"})
    assert [product["id"] for product in result] == ["new-item"]


def test_reciprocal_rank_fusion_combines_independent_rankings():
    assert reciprocal_rank_fusion([["a", "b"], ["b", "c"]])[0] == "b"

