from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock
import pytest
from application.budget import CallBudget
from infrastructure.gemini import GeminiProvider


def test_genai_router_declares_read_only_tools(settings):
    provider = GeminiProvider(settings)
    response = SimpleNamespace(function_calls=[SimpleNamespace(name='search_products', args={'filters': {'max_price': 500000, 'size': 'L'}})], usage_metadata=None)
    provider.client = Mock()
    provider.client.models.generate_content.return_value = response
    payload, _ = provider.plan('Tìm áo size L dưới 500k', {})
    assert payload['intent'] == 'product_search'
    assert payload['filters'] == {'max_price': 500000, 'size': 'L'}
    config = provider.client.models.generate_content.call_args.kwargs['config']
    assert config.automatic_function_calling.disable is True
    assert len(config.tools[0].function_declarations) == 7


def test_stream_reads_first_chunk_and_closes(settings):
    provider = GeminiProvider(settings)
    provider.client = Mock()
    provider.client.models.generate_content_stream.return_value = iter([
        SimpleNamespace(text='Chào bạn.', usage_metadata=None),
        SimpleNamespace(text=' Mình sẽ kiểm tra.', usage_metadata=None),
    ])
    assert ''.join(chunk['text'] for chunk in provider.answer_stream({})) == 'Chào bạn. Mình sẽ kiểm tra.'


def test_budget_counts_retries_and_stops_before_network(settings, dependencies):
    provider = GeminiProvider(settings)
    budget = CallBudget(replace(settings, llm_max_calls_per_turn=1), dependencies['conversations'])
    callback = Mock()
    class TransientError(Exception):
        code = 503
    callback.side_effect = TransientError()
    with pytest.raises(RuntimeError, match='budget'):
        provider._retry(callback, budget)
    assert callback.call_count == 1


def test_settings_repr_hides_secrets(settings):
    private = replace(settings, mongo_uri='mongodb://private', google_api_key='private-key')
    assert 'private-key' not in repr(private)
    assert 'mongodb://private' not in repr(private)
    assert settings.jwt_secret not in repr(private)
