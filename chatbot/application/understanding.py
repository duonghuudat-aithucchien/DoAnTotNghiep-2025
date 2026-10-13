"""Deterministic, measured baseline; optional LLM extraction handles paraphrases."""
import re
from domain.models import QueryPlan, normalize

CATEGORIES = ["áo sơ mi", "áo khoác", "áo thun", "áo phông", "quần jeans", "quần tây", "quần short", "hoodie", "váy", "giày", "áo", "quần"]
COLORS = ["đen", "trắng", "xanh navy", "xanh dương", "xanh", "đỏ", "hồng", "be", "nâu", "xám", "vàng", "tím"]
INTENTS = {"greeting", "product_search", "stock_check", "outfit_advice", "order_tracking", "return_eligibility", "policy", "unknown", "blocked"}
POLICIES = {"payment", "shipping", "returns", "privacy"}


def money(value):
    value = value.strip().replace(" ", "")
    match = re.fullmatch(r"(\d+(?:[.,]\d+)*)\s*(trieu|tr|nghin|ngan|k|vnd|d)?", value)
    if not match:
        return None
    number, unit = match.groups()
    multiplier = 1_000_000 if unit in {"trieu", "tr"} else 1000 if unit in {"nghin", "ngan", "k"} else 1
    number = float(number.replace(",", ".")) if multiplier > 1 else float(number.replace(".", "").replace(",", ""))
    return round(number * multiplier)


def extract_filters(message):
    text = normalize(message)
    filters = {}
    for category in CATEGORIES:
        if re.search(r"(?<!\w)" + re.escape(normalize(category)) + r"(?!\w)", text):
            filters["category"] = category.replace("áo phông", "áo thun")
            break
    # 'đến' and 'đen' both normalize to 'den'; exclude a monetary range connector.
    color_text = normalize(re.sub(r"\bđồ\b", " ", message.lower()))
    color_text = re.sub(r"\b(?:phoi do|mix do|goi y do|mac do|bo do)\b", " ", color_text)
    color_text = re.sub(r"\bden\b(?=\s*\d)", " ", color_text)
    for color in COLORS:
        if re.search(r"(?<!\w)" + re.escape(normalize(color)) + r"(?!\w)", color_text):
            filters["color"] = color
            break
    size = re.search(r"\b(?:size|co)\s*([234]?xl|xxs|xs|s|m|l|\d{2})\b", text)
    if size:
        filters["size"] = size.group(1).upper()
    if re.search(r"\bnu\b", text):
        filters["gender"] = "nữ"
    elif re.search(r"\bnam\b", text):
        filters["gender"] = "nam"
    number_pattern = r"\d+(?:[.,]\d+)*\s*(?:trieu|tr|nghin|ngan|k|vnd|d)?"
    between = re.search(r"(?:tu|khoang)\s*(" + number_pattern + r")\s*(?:den|-)\s*(" + number_pattern + r")", text)
    if between:
        low, high = between.groups()
        # "từ 200 đến 500k" carries the unit to the first amount.
        high_unit = re.search(r"(trieu|tr|nghin|ngan|k)\s*$", high)
        if high_unit and not re.search(r"[a-z]", low):
            low += high_unit.group(1)
        filters.update(min_price=money(low), max_price=money(high))
    else:
        below = re.search(r"(?:duoi|toi da|khong qua|ngan sach|tam|khoang)\s*(" + number_pattern + r")", text)
        above = re.search(r"(?:tren|tu|toi thieu)\s*(" + number_pattern + r")", text)
        if below:
            filters["max_price"] = money(below.group(1))
        if above:
            filters["min_price"] = money(above.group(1))
    for occasion in ["đi làm", "đi học", "đi chơi", "dự tiệc", "hẹn hò", "phỏng vấn", "thể thao"]:
        if normalize(occasion) in text:
            filters["occasion"] = occasion
            break
    return {key: value for key, value in filters.items() if value is not None}


def baseline_plan(message, state=None):
    state = state or {}
    text = normalize(message)
    explicit = extract_filters(message)
    order_id_match = re.search(r"\b[0-9a-fA-F]{24}\b", message)
    order_id = order_id_match.group(0) if order_id_match else ""
    intent = "unknown"
    policy = ""
    if re.search(r"(doi tra|tra hang|hoan tien|doi hang)", text):
        intent = "return_eligibility" if order_id or "don" in text else "policy"
        policy = "returns"
    elif re.search(r"(don hang|van don|tracking|don cua|kiem tra don|don .*o dau)", text):
        intent = "order_tracking"
    elif re.search(r"(thanh toan|paypal|vnpay|vietqr|\bcod\b)", text):
        intent, policy = "policy", "payment"
    elif re.search(r"(bao mat|du lieu|lich su tro chuyen)", text):
        intent, policy = "policy", "privacy"
    elif re.search(r"(giao hang|van chuyen|phi ship|ship may|bao lau|ship)", text):
        intent, policy = "policy", "shipping"
    elif re.fullmatch(r"\s*(xin chao|chao(?: ban| shop| sop)?|hi|hello|alo|cam on|thank you)[!. ]*", text):
        intent = "greeting"
    elif re.search(r"(phoi do|outfit|mac gi|mix do)", text):
        intent = "outfit_advice"
    elif re.search(r"(con hang|ton kho|con size|con mau|het hang)", text):
        intent = "stock_check"
    elif explicit or re.search(r"(tim|mua|goi y|san pham|mau nao|re hon|bo loc|bat dau lai)", text):
        intent = "product_search"
    elif state.get("intent") in {"product_search", "stock_check", "outfit_advice"} and re.search(r"(mau|size|cai|do|nay|khac)", text):
        intent = "product_search"
    elif order_id and state.get("intent") in {"order_tracking", "return_eligibility"}:
        intent = state["intent"]
    filters = dict(state.get("filters") or {}) if intent in {"product_search", "stock_check", "outfit_advice"} else {}
    if explicit.get("category") and normalize(explicit["category"]) != normalize(filters.get("category", "")):
        filters = {}
    if "bo loc" in text or "bat dau lai" in text:
        filters = {}
    filters.update(explicit)
    return QueryPlan(
        intent=intent, query=message, filters=filters, order_id=order_id,
        policy_type=policy, confidence=0.90 if intent != "unknown" else 0.2,
    )


def validate_llm_plan(payload, message, baseline):
    if not isinstance(payload, dict) or payload.get("intent") not in INTENTS - {"blocked"}:
        return baseline
    filters = dict(baseline.filters)
    for key, value in (payload.get("filters") or {}).items():
        if key in {"min_price", "max_price"} and isinstance(value, (int, float)) and 0 <= value <= 100_000_000:
            filters[key] = int(value)
        elif key in {"category", "size", "color", "gender", "occasion"} and isinstance(value, str) and len(value) <= 80:
            filters[key] = value
    # Literal constraints win over guesses; never invent IDs or access scope.
    filters.update(extract_filters(message))
    intent = payload["intent"]
    if baseline.intent in {"order_tracking", "return_eligibility", "policy", "greeting"}:
        intent = baseline.intent
    return QueryPlan(
        intent=intent, query=message, filters=filters,
        order_id=baseline.order_id, product_id=baseline.product_id,
        policy_type=baseline.policy_type or (payload.get("policy_type") if payload.get("policy_type") in POLICIES else ""),
        confidence=0.8,
    )

