"""Explicit live checks. Never print credentials, raw exceptions or customer data."""
import argparse
import json
from dataclasses import replace
from dotenv import dotenv_values
from config import Settings, BASE_DIR
from application.bootstrap import build_dependencies
from infrastructure.gemini import GeminiProvider


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--live', action='store_true', help='Read live Mongo catalog and shop policies')
    parser.add_argument('--llm', action='store_true', help='Make at most two logical Gemini requests; may be billed')
    parser.add_argument('--dense', action='store_true', help='Download/load the embedding model when necessary')
    parser.add_argument('--chat', action='store_true', help='Check guest history/streaming and delete only the test conversations; LLM disabled')
    args = parser.parse_args()
    settings = Settings.from_env()
    if not args.live:
        settings = replace(settings, storage_mode='memory')
    settings = replace(settings, embedding_enabled=args.dense)
    result = {'scope': 'live' if args.live else 'fixture'}
    try:
        dependencies = build_dependencies(settings)
    except Exception as error:
        dependencies = None
        result['startup'] = {'ok': False, 'error_type': type(error).__name__}

    def check(name, operation):
        try:
            result[name] = {'ok': True, 'data': operation()}
        except Exception as error:
            result[name] = {'ok': False, 'error_type': type(error).__name__, 'code': getattr(error, 'code', None)}

    if dependencies:
        check('mongo', lambda: (dependencies['products'].ping(), {'reachable': True})[-1])
    def search():
        products, metadata = dependencies['retriever'].search('áo sơ mi', {'category': 'áo sơ mi'})
        return {'matches': len(products), **metadata}
    if dependencies:
        check('retrieval', search)
    if args.live:
        if dependencies:
            check('policies', lambda: {'window_days': dependencies['commerce'].policy('returns').get('windowDays')})
        backend = dotenv_values(BASE_DIR.parent / 'my-backend/.env')
        result['jwt_secrets_match'] = bool(settings.jwt_secret and settings.jwt_secret == backend.get('ACCESS_TOKEN'))
    if args.llm:
        provider = GeminiProvider(settings)
        def plan():
            payload, usage = provider.plan('Tìm áo sơ mi dưới 500k', {})
            return {'intent': (payload or {}).get('intent'), **usage}
        check('gemini_routing', plan)
        if result['gemini_routing']['ok']:
            def answer():
                chunks = list(provider.answer_stream({'query': 'Tìm áo sơ mi', 'tool': 'search_products', 'tool_result': {'products': [{'name': 'Áo sơ mi', 'description': 'Vải cotton, kiểu dáng lịch sự'}]}}))
                return {'has_text': any(chunk['text'] for chunk in chunks), 'chunks': len(chunks)}
            check('gemini_stream', answer)
    if args.chat and dependencies:
        from app import create_app
        from infrastructure.gemini import DisabledLLM
        import secrets
        application = create_app(settings, dependencies)
        dependencies['chat'].llm = DisabledLLM()
        client = application.test_client()
        headers = {'X-Chat-Session': secrets.token_urlsafe(32)}
        identifiers = []
        def chat():
            try:
                response = client.post('/api/chat', headers=headers, json={'message': 'Tìm áo sơ mi'})
                assert response.status_code == 200
                identifier = response.json['conversation_id']
                identifiers.append(identifier)
                followup = client.post('/api/chat', headers=headers, json={'message': 'Có size L không?', 'conversation_id': identifier})
                assert followup.status_code == 200
                assert followup.json['filters']['category'] == 'áo sơ mi'
                assert client.get(f'/api/conversations/{identifier}', headers={'X-Chat-Session': secrets.token_urlsafe(32)}).status_code == 404
                stream = client.post('/api/chat/stream', headers=headers, json={'message': 'Xin chào', 'conversation_id': identifier})
                assert 'event: done' in stream.get_data(as_text=True)
                assert len(client.get(f'/api/conversations/{identifier}', headers=headers).json['data']['turns']) == 3
                return {'history': True, 'ownership': True, 'streaming': True, 'followup': True, 'llm': 'disabled_for_check'}
            finally:
                for identifier in identifiers:
                    client.delete(f'/api/conversations/{identifier}', headers=headers)
        check('chat', chat)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if any(isinstance(value, dict) and value.get('ok') is False for value in result.values()):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
