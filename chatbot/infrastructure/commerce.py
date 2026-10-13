"""The backend remains the authority for private data and shop policies."""
import re
import requests
from domain.models import ChatError


class HTTPCommerce:
    def __init__(self, settings):
        self.settings = settings

    def _get(self, path, token=""):
        try:
            response = requests.get(
                self.settings.backend_url + path,
                headers={"Authorization": f"Bearer {token}"} if token else {},
                timeout=(3, 8), allow_redirects=False,
            )
            if token and response.status_code in {401, 403, 404}:
                raise ChatError("Bạn chưa có quyền xem đơn này hoặc phiên đăng nhập đã hết hạn.", "ORDER_ACCESS_DENIED", response.status_code)
            if not response.ok:
                raise ChatError("Dịch vụ đơn hàng tạm thời không phản hồi.", "COMMERCE_UNAVAILABLE", 503)
            payload = response.json()
            if payload.get("status") != "OK":
                raise ChatError("Chưa thể kiểm tra thông tin cửa hàng.", "COMMERCE_UNAVAILABLE", 503)
            return payload.get("data") or {}
        except (requests.RequestException, ValueError):
            raise ChatError("Chưa kết nối được dịch vụ cửa hàng. Vui lòng thử lại.", "COMMERCE_UNAVAILABLE", 503) from None

    def policy(self, policy_type):
        data = self._get("/chatbot/policies")
        return data.get(policy_type) or {}

    def order(self, order_id, token):
        if not token:
            raise ChatError("Đăng nhập để kiểm tra đơn hàng.", "AUTH_REQUIRED", 401)
        if not re.fullmatch(r"[0-9a-fA-F]{24}", order_id):
            raise ChatError("Vui lòng cung cấp mã đơn đầy đủ (24 ký tự).", "INVALID_ORDER_ID", 400)
        data = self._get(f"/chatbot/orders/{order_id}/tracking", token)
        # Address, phone, owner, payment metadata never cross into the AI provider.
        return {key: data.get(key) for key in [
            "_id", "status", "isPaid", "paymentStatus", "isDelivered", "deliveredAt",
            "trackingNumber", "carrier", "estimatedDeliveryAt", "refundStatus", "trackingHistory",
        ]}

    def return_eligibility(self, order_id, token):
        if not token or not re.fullmatch(r"[0-9a-fA-F]{24}", order_id):
            raise ChatError("Đăng nhập và cung cấp mã đơn hợp lệ.", "AUTH_REQUIRED", 401)
        return self._get(f"/chatbot/returns/{order_id}/eligibility", token)


class DemoCommerce:
    """Only available through explicit demo/test composition."""
    def policy(self, policy_type):
        policies = {
            "payment": {"methods": [{"id": "COD", "label": "Thanh toán khi nhận hàng"}]},
            "returns": {"windowDays": 7, "requiresDelivery": True},
            "shipping": {"estimate": "Xem lịch giao dự kiến trong chi tiết đơn.", "fees": []},
            "privacy": {"retentionDays": 30},
        }
        return policies.get(policy_type, {})

    def order(self, order_id, token):
        raise ChatError("Chế độ demo không truy cập đơn hàng thật.", "DEMO_MODE", 400)

    def return_eligibility(self, order_id, token):
        raise ChatError("Chế độ demo không truy cập đơn hàng thật.", "DEMO_MODE", 400)

