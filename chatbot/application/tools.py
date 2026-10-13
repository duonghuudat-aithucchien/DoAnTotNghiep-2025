import re
from domain.models import public_product
from application.understanding import extract_filters

STATUS_LABELS = {
    "pending": "Chờ xác nhận", "confirmed": "Đã xác nhận", "shipping": "Đang vận chuyển",
    "delivered": "Đã giao", "cancelled": "Đã hủy", "expired": "Hết hạn thanh toán",
    "payment_review": "Thanh toán cần được kiểm tra",
}


def policy_text(policy_type, data):
    if not data:
        return "Chưa có dữ liệu chính sách đã xác minh. Bạn có thể liên hệ cửa hàng."
    if policy_type == "payment":
        return "Các hình thức thanh toán đang khả dụng: " + ", ".join(method["label"] for method in data.get("methods", [])) + "."
    if policy_type == "returns":
        return f'Bạn có thể yêu cầu trả hàng/hoàn tiền trong {data["windowDays"]} ngày từ khi giao thành công. Yêu cầu được cửa hàng xét duyệt; mở chi tiết đơn để gửi yêu cầu.'
    if policy_type == "shipping":
        return data.get("estimate", "Lịch giao hàng được cập nhật trong chi tiết đơn.")
    return f'Lịch sử mới của chatbot được lưu tối đa {data.get("retentionDays", 30)} ngày. Bạn có thể xóa từng cuộc trò chuyện. Không gửi mật khẩu, thông tin thẻ hoặc thông tin nhạy cảm.'


class ShoppingTools:
    def __init__(self, retriever, commerce, settings):
        self.retriever = retriever
        self.commerce = commerce
        self.settings = settings

    def execute(self, plan, actor, state):
        if plan.intent in {"product_search", "stock_check", "outfit_advice"}:
            query = plan.query
            if plan.filters.get("category"):
                query += " " + plan.filters["category"]
            referenced = state.get("last_product_ids", [])
            match = re.search(r"(?:mẫu|mau|cái|cai|sản phẩm|san pham)\s*(?:đầu tiên|dau tien|thứ|thu)?\s*([1-5])?", plan.query.lower())
            use_reference = plan.intent == "stock_check" and referenced and match and not extract_filters(plan.query).get("category")
            if use_reference:
                index = int(match.group(1) or 1) - 1 if match else 0
                live = self.retriever.repository.by_ids(referenced[index:index + 1])
                from domain.models import matching_variants
                products = [product for product in live if matching_variants(product, plan.filters)]
                metadata = {"mode": "live_stock", "retrieval_ms": 0}
            else:
                products, metadata = self.retriever.search(query, plan.filters, top_k=5)
            cards = [public_product(product, plan.filters, self.settings.frontend_url) for product in products]
            sources = [{"id": product["id"], "title": product["name"], "url": product["link"], "type": "product"} for product in cards]
            return {
                "products": cards, "sources": sources, "metadata": metadata,
                "facts": {"products": [{
                    **{key: card[key] for key in ["id", "name", "sizes", "colors", "countInStock"]},
                    "description": product["description"][:800], "style": product.get("style", ""), "occasion": product.get("occasion", ""),
                } for card, product in zip(cards, products)]},
                "fallback": "Mình tìm được các mẫu còn hàng phù hợp với bộ lọc bên dưới. Bạn muốn mình kiểm tra thêm size hay màu nào?"
                    if cards else "Mình chưa tìm được mẫu còn hàng đáp ứng đủ yêu cầu. Bạn muốn đổi màu, size hoặc khoảng giá?",
                "tool": "get_product_stock" if plan.intent == "stock_check" else "search_products",
            }
        if plan.intent in {"order_tracking", "return_eligibility"}:
            if not actor.user_id:
                return self.static("Bạn cần đăng nhập để xem đơn hàng hoặc kiểm tra điều kiện đổi trả.")
            order_id = plan.order_id or state.get("last_order_id", "")
            if not order_id:
                return self.static("Bạn gửi mã đơn đầy đủ (24 ký tự) trong trang Đơn hàng của tôi để mình kiểm tra nhé.")
            data = self.commerce.order(order_id, actor.token)
            if plan.intent == "order_tracking":
                text = f'Đơn #{order_id[-8:]}: {STATUS_LABELS.get(data["status"], data["status"])}.'
                if data.get("trackingNumber"):
                    text += f' Mã vận đơn: {data["trackingNumber"]}.'
                if data.get("carrier"):
                    text += f' Đơn vị vận chuyển: {data["carrier"]}.'
                if data.get("estimatedDeliveryAt"):
                    text += f' Dự kiến giao: {data["estimatedDeliveryAt"]}.'
                for event in (data.get('trackingHistory') or [])[-3:]:
                    text += f'\n• {event.get("createdAt", "")}: {event.get("title", "Cập nhật vận chuyển")}'
                return self.static(text, tool="get_order_tracking", data=data,
                                   sources=[{"id": order_id, "title": "Chi tiết đơn hàng", "type": "order", "url": f"{self.settings.frontend_url}/details-order/{order_id}"}])
            eligibility = self.commerce.return_eligibility(order_id, actor.token)
            eligible = eligibility["eligible"]
            text = "Đơn còn trong thời hạn yêu cầu đổi trả. Mở chi tiết đơn để gửi yêu cầu; cửa hàng sẽ xét duyệt."
            if not eligible:
                text = "Đơn chưa được giao hoặc đã quá thời hạn đổi trả. Bạn có thể liên hệ cửa hàng để kiểm tra thêm."
                if eligibility.get("reason") == "existing_request":
                    text = "Đơn đã có yêu cầu đổi trả. Bạn mở chi tiết đơn để theo dõi yêu cầu hiện tại nhé."
            return self.static(text, tool="check_return_eligibility", data=eligibility,
                               sources=[{"id": order_id, "title": "Chi tiết đơn hàng", "type": "order", "url": f"{self.settings.frontend_url}/details-order/{order_id}"}])
        if plan.intent == "policy":
            policy_type = plan.policy_type or "returns"
            data = self.commerce.policy(policy_type)
            return self.static(policy_text(policy_type, data), tool="get_store_policy", data=data,
                               sources=[{"id": policy_type, "title": "Chính sách cửa hàng", "type": "policy", "url": ""}])
        if plan.intent == "greeting":
            return self.static("Chào bạn! Mình là FashionStyle Assistant. Mình có thể tìm sản phẩm theo giá, size, màu và kiểm tra đơn hàng của bạn.")
        if plan.intent == "blocked":
            return self.static("Mình chỉ hỗ trợ mua sắm và thông tin cửa hàng. Bạn có thể hỏi về sản phẩm, vận chuyển hoặc đổi trả.")
        return self.static("Mình hỗ trợ thời trang và mua sắm tại FashionStyle. Bạn cần tìm sản phẩm, phối đồ hay kiểm tra đơn hàng?")

    @staticmethod
    def static(text, tool="respond_to_message", data=None, sources=None):
        return {
            "products": [], "sources": sources or [], "metadata": {},
            "facts": data or {}, "fallback": text, "tool": tool, "deterministic": True,
        }

