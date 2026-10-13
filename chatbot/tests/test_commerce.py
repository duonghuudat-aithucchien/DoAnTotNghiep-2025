from unittest.mock import Mock, patch
import pytest
from domain.models import ChatError
from infrastructure.commerce import HTTPCommerce


def test_order_adapter_forwards_bearer_to_owner_scoped_endpoint(settings):
    gateway = HTTPCommerce(settings)
    gateway._get = Mock(return_value={'status': 'shipping', 'shippingAddress': {'phone': 'private'}, 'trackingNumber': 'TRACK-1'})
    identifier = '507f1f77bcf86cd799439011'
    result = gateway.order(identifier, 'test-token')
    gateway._get.assert_called_once_with(f'/chatbot/orders/{identifier}/tracking', 'test-token')
    assert 'shippingAddress' not in result


def test_policy_404_is_dependency_error_not_login_error(settings):
    with patch('infrastructure.commerce.requests.get', return_value=Mock(status_code=404, ok=False)):
        with pytest.raises(ChatError) as error:
            HTTPCommerce(settings).policy('returns')
        assert error.value.code == 'COMMERCE_UNAVAILABLE'
