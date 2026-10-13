from dataclasses import dataclass, field
from typing import Any
import re
import unicodedata


class ChatError(Exception):
    def __init__(self, message, code="BAD_REQUEST", status=400):
        super().__init__(message)
        self.code = code
        self.status = status


def normalize(text):
    text = unicodedata.normalize("NFD", str(text).lower()).replace("đ", "d")
    return "".join(char for char in text if unicodedata.category(char) != "Mn")


def plain_text(value, limit=3000):
    return re.sub(r"<[^>]*>", " ", str(value or ""))[:limit].strip()


@dataclass(frozen=True)
class Actor:
    owner: str
    user_id: str = ""
    token: str = field(default="", repr=False)
    is_admin: bool = False


@dataclass
class QueryPlan:
    intent: str = "unknown"
    query: str = ""
    filters: dict = field(default_factory=dict)
    order_id: str = ""
    product_id: str = ""
    policy_type: str = ""
    confidence: float = 0.0

    def to_dict(self):
        return {
            "intent": self.intent, "query": self.query, "filters": self.filters,
            "order_id": self.order_id, "product_id": self.product_id,
            "policy_type": self.policy_type, "confidence": self.confidence,
        }


def catalog_product(document):
    product = {
        "id": str(document.get("_id", document.get("id", ""))),
        "name": plain_text(document.get("name"), 200),
        "type": plain_text(document.get("type"), 100),
        "description": plain_text(document.get("description")),
        "price": float(document.get("price") or 0),
        "discount": float(document.get("discount") or 0),
        "rating": float(document.get("rating") or 0),
        "countInStock": int(document.get("countInStock") or 0),
        "image": str(document.get("image") or ""),
        "sizes": list(document.get("sizes") or []),
        "colors": list(document.get("colors") or []),
        "gender": plain_text(document.get("gender"), 30),
        "occasion": plain_text(document.get("occasion"), 200),
        "style": plain_text(document.get("style"), 200),
        "isActive": document.get("isActive", True),
        "variants": [],
    }
    for variant in document.get("variants") or []:
        product["variants"].append({
            "id": str(variant.get("_id", "")),
            "sku": str(variant.get("sku", "")),
            "size": str(variant.get("size", "")),
            "color": str(variant.get("color", "")),
            "price": float(variant.get("price", product["price"])),
            "stock": int(variant.get("stock") or 0),
            "isActive": variant.get("isActive", True),
        })
    return product


def product_document(product):
    # No prices/stock in embeddings: they are always checked against live data.
    variants = product.get("variants", [])
    return " | ".join(str(value) for value in [
        product["name"], product["type"], product["description"],
        product.get("gender", ""), product.get("occasion", ""), product.get("style", ""),
        " ".join(product["sizes"]), " ".join(product["colors"]),
        " ".join(f'{v["size"]} {v["color"]}' for v in variants if v["isActive"]),
    ])


def matching_variants(product, filters):
    if product.get("isActive") is False:
        return []
    category = normalize(filters.get("category", ""))
    if category and category not in normalize(product["name"] + " " + product["type"]):
        return []
    gender = normalize(filters.get("gender", ""))
    if gender and gender not in normalize(product.get("gender", "") + " " + product["name"] + " " + product["description"]):
        return []
    variants = product.get("variants") or [{
        "size": "", "color": "", "price": product["price"],
        "stock": product["countInStock"], "isActive": True,
    }]
    result = []
    for variant in variants:
        if not variant["isActive"] or variant["stock"] <= 0:
            continue
        if filters.get("size"):
            choices = [variant["size"]] if product.get("variants") else product["sizes"]
            if normalize(filters["size"]) not in [normalize(size) for size in choices]:
                continue
        if filters.get("color"):
            choices = [variant["color"]] if product.get("variants") else product["colors"]
            if normalize(filters["color"]) not in [normalize(color) for color in choices]:
                continue
        sale_price = round(variant["price"] * (1 - min(100, max(0, product["discount"])) / 100))
        if filters.get("min_price") is not None and sale_price < filters["min_price"]:
            continue
        if filters.get("max_price") is not None and sale_price > filters["max_price"]:
            continue
        result.append({**variant, "sale_price": sale_price})
    return result


def public_product(product, filters, frontend_url):
    variants = matching_variants(product, filters)
    cheapest = min(variants, key=lambda variant: variant["sale_price"]) if variants else None
    return {
        "id": product["id"], "name": product["name"], "price": cheapest["price"] if cheapest else product["price"],
        "salePrice": cheapest["sale_price"] if cheapest else 0,
        "discount": product["discount"], "rating": product["rating"], "image": product["image"],
        "countInStock": sum(variant["stock"] for variant in variants),
        "sizes": sorted({v["size"] for v in variants if v["size"]}) or product["sizes"],
        "colors": sorted({v["color"] for v in variants if v["color"]}) or product["colors"],
        "variants": variants,
        "link": f'{frontend_url}/product-details/{product["id"]}',
    }

