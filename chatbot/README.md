# FashionStyle AI Assistant v2

Trợ lý mua sắm tiếng Việt có hybrid retrieval, công cụ nghiệp vụ chỉ đọc và bộ đánh giá có thể chạy lại. Đây là bản nâng cấp kỹ thuật của đồ án, không phải tuyên bố đã đạt độ tin cậy production.

## Kiến trúc

`React widget → Flask API/SSE → ChatUseCase → validated query plan → shopping tools → grounded response + cards`

- `domain/`: cấu trúc dữ liệu, lọc variant, loại bỏ thông tin nhạy cảm và giao diện adapter.
- `application/`: hội thoại, hiểu yêu cầu, ngân sách API, BM25 + reciprocal rank fusion, công cụ nghiệp vụ.
- `infrastructure/`: Google GenAI, E5/Sentence Transformers, FAISS, MongoDB và API Express.
- `api/`: validation, JWT/guest session, lỗi chuẩn, rate limit và streaming.
- `evaluation/`, `tests/`: dữ liệu hồi quy, benchmark và kiểm thử độc lập với dịch vụ ngoài.

Không dùng ANN/TensorFlow/NLTK hoặc pickle trong luồng xử lý mới. `words.pkl`, `classes.pkl`, `intents.json` giữ lại làm hiện vật của đồ án cũ, không được nạp lúc chạy. `training.py` là entry point tương thích cho evaluation, **không phải training một model mới**.

## Khả năng chính

- Phân loại yêu cầu bằng baseline đo được và Gemini function calling có schema kiểm tra. Server thực thi các công cụ được cho phép; không có agent tự ý thực hiện thanh toán/hoàn tiền.
- Chuẩn hóa ngân sách VND, size, màu, nhóm sản phẩm, giới tính, dịp sử dụng; giữ bộ lọc qua các lượt và bỏ bộ lọc khi đổi nhóm sản phẩm.
- BM25 tiếng Việt không dấu + dense multilingual E5 + FAISS inner product trên vector chuẩn hóa + RRF; optional cross-encoder reranking.
- Embedding dùng `query:` / `passage:` đúng quy ước E5. Cache document theo nội dung/model/revision, cache query giới hạn 256 mục.
- Giá sau giảm, size/màu **cùng một variant**, trạng thái active và tồn kho được kiểm tra bằng MongoDB hiện tại. Không đưa giá/tồn kho vào embedding. Thẻ sản phẩm do server dựng, không lấy giá do LLM viết.
- Theo dõi đơn bằng token người dùng và mã đơn literal. Kiểm tra thời hạn/đơn đã có yêu cầu đổi trả bằng backend; không truy cập đơn của người khác.
- Chính sách lấy từ `/api/chatbot/policies`, không tự bịa phí ship, ngày giao hoặc hình thức thanh toán.
- Lịch sử guest/user được cách ly, context giới hạn, summary theo trạng thái, TTL mặc định 30 ngày, xóa hội thoại/trace/feedback liên quan.
- SSE, nút dừng/thử lại, thẻ sản phẩm, bộ lọc, nguồn, lịch sử và phản hồi. Admin có mục **AI Assistant** xem p50/p95, fallback, no-result, token, feedback và reindex.
- PII redaction trước khi lưu/gửi LLM; chặn một số mẫu prompt injection phổ biến; JWT HS256 với expiration; lỗi không in secrets; per-session và guest per-IP rate limit.
- Tối đa hai provider attempts mỗi lượt (retry cũng tính), ngân sách ngày dùng chung qua MongoDB, timeout, cooldown và fallback không cần LLM. Chỉ số token chưa bao gồm token của request lỗi phía provider nếu API không trả usage.

## Chạy trên Windows

Khuyến nghị Python 3.11. Dùng `npm.cmd` nếu PowerShell chặn `npm.ps1`.

```powershell
cd D:\DATN\Fashion_Style_Clean\chatbot
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install torch==2.14.1 --index-url https://download.pytorch.org/whl/cpu
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

Nếu `.venv` cũ báo thiếu Python ở `pythoncore-3.11-64`, đó là interpreter đã mất. Không xóa dữ liệu đồ án; cài lại Python 3.11 rồi tạo venv mới hoặc dùng runtime cục bộ đã chuẩn bị trên máy này:

```powershell
.\.runtime\python\python.exe app.py
```

`.runtime/` bị Git ignore, có đường dẫn dành riêng cho máy hiện tại; **không sao chép runtime này để deploy**. Docker/CI dùng Python tiêu chuẩn và requirements. Khởi động lại backend và frontend sau khi cập nhật mã.

```powershell
# Terminal backend, từ thư mục project
cd my-backend
npm.cmd start
# Terminal frontend
cd my-frontend
npm.cmd start
```

Chatbot: `http://127.0.0.1:5000`; demo cùng origin tại `/`. `/api/health` kiểm tra tiến trình; `/api/ready` kiểm tra DB và trạng thái index, không đảm bảo Gemini còn quota. Waitress chạy trên Windows/Linux; khi deploy đặt sau HTTPS reverse proxy, tắt buffering cho SSE và cấu hình timeout phù hợp.

## Cấu hình

Sử dụng `.env.example` làm mẫu; không commit `.env`. Secrets đã có trong `.env` không bị thay thế. Những biến quan trọng:

| Biến | Ý nghĩa |
|---|---|
| `MONGO_URI`, `MONGO_DB` | Catalog và dữ liệu chatbot; DB mặc định `test`, phải khớp backend |
| `GOOGLE_API_KEY`, `GEMINI_MODEL` | Provider Gemini; model đổi qua config, mặc định `gemini-2.5-flash` |
| `ACCESS_TOKEN` | JWT signing secret **phải trùng backend**, không phải access token của một user |
| `BACKEND_AUTH_ENV_FILE` | Optional local-only: `../my-backend/.env`, đọc riêng signing secret backend; không dùng trong Docker/cloud |
| `BACKEND_API_URL`, `FRONTEND_URL` | Backend API và frontend origin được CORS cho phép |
| `CHATBOT_STORAGE` | `mongo` production; `memory` demo/test với catalog giả, **không gọi Gemini hoặc đọc đơn thật** |
| `EMBEDDING_ENABLED`, `EMBEDDING_MODEL`, `EMBEDDING_REVISION` | Bật dense; model mặc định `intfloat/multilingual-e5-small`; pin revision cho benchmark |
| `RERANKER_MODEL` | Optional cross-encoder, để trống mặc định; cần đánh giá CPU/latency trước khi bật |
| `INDEX_REFRESH_SECONDS`, `INDEX_CACHE_DIR` | Kiểm tra nội dung catalog sau 60 giây; document embedding cache |
| `RETRIEVAL_MIN_COSINE` | Ngưỡng dense mặc định 0.70; phải hiệu chỉnh trên tập dev, không trên test |
| `LLM_TIMEOUT_SECONDS`, `LLM_MAX_OUTPUT_TOKENS`, `LLM_MAX_CALLS_PER_DAY` | Timeout, độ dài và ngân sách; fallback khi vượt hạn mức |
| `CHAT_RATE_LIMIT`, `HISTORY_TURNS`, `CONVERSATION_RETENTION_DAYS` | Rate limit, context và thời gian lưu |

`.env` cục bộ hiện opt-in đọc secret của backend để tránh lệch cấu hình. Docker compose không mount backend `.env` vào chatbot: bỏ `BACKEND_AUTH_ENV_FILE` khỏi env deploy và inject `ACCESS_TOKEN` khớp nhau. Secret từng lên repo cần được thu hồi/đổi ở dịch vụ gốc; private repo hoặc repo mới không tự vô hiệu hóa secret cũ.

Lần truy hồi đầu cần tải/nạp model nên có cold start. Tải model và kiểm tra trước khi demo:

```powershell
.\.runtime\python\python.exe cli.py check
.\.runtime\python\python.exe cli.py reindex
.\.runtime\python\python.exe smoke.py --live --dense --chat
# Gọi Gemini thật, có thể phát sinh phí; không chạy trong CI
.\.runtime\python\python.exe smoke.py --live --llm
```

`smoke --chat` tạo đúng một phiên thử nghiệm mới rồi xóa phiên/trace liên quan; tắt LLM cho bước này. Gemini 429 cần kiểm tra quota/rate limit/billing trên project Google; chatbot chuyển sang baseline + câu trả lời dựng từ server. Backend đang chạy mã cũ sẽ chưa có endpoint policy/eligibility: **restart backend**, không đổi API sang dữ liệu chính sách tự bịa.

## API

| Endpoint | Quyền/chức năng |
|---|---|
| `POST /api/chat`, `/get` | JSON: `message`, optional `conversation_id`; compatibility response có `response`, `products` |
| `POST /api/chat/stream` | SSE `meta`, `status`, `delta`, optional `reset`, `done`, `error` |
| `GET /api/conversations`, `GET /api/conversations/:id` | Chỉ phiên thuộc actor hiện tại |
| `DELETE /api/conversations/:id` | Xóa phiên thuộc actor; trace/feedback liên quan |
| `POST /api/feedback` | `conversation_id`, `message_id`, `rating` (-1/1/2: chưa hữu ích/hữu ích/mở sản phẩm) |
| `GET /api/admin/metrics`, `POST /api/admin/reindex` | JWT admin |

Guest dùng `X-Chat-Session` opaque tối thiểu 20 ký tự hoặc cookie HttpOnly; đây là bearer capability, ai biết session có thể đọc lịch sử guest đó. User dùng `Authorization: Bearer <access token>`. Không gửi `userId` để chọn tài khoản. Lỗi HTTP 400/401/403/404/409/429/503 có `message`, `code`, `request_id`. Sau khi SSE bắt đầu, lỗi là event `error` chứ không đổi được HTTP status.

Backend có hai endpoint riêng cho chatbot: `GET /api/chatbot/orders/:id/tracking` và `GET /api/chatbot/returns/:id/eligibility`. Cả hai lọc theo token owner, kể cả admin; không trả địa chỉ/số điện thoại, và tracking bỏ `createdBy`. Xóa phiên đang xử lý trả 409 để tránh tái tạo trace sau khi xóa.

Collections mới: `ai_conversations`, `ai_traces`, `ai_feedback`, `ai_rate_limits`. Không tự import hoặc xóa log legacy. TTL là bất đồng bộ và không xóa backup; email/số điện thoại/JWT/địa chỉ có nhãn được redact, không phải DLP bao phủ mọi PII. Nếu deploy sau proxy, cấu hình remote IP đúng ở reverse proxy/WSGI để rate limit không gom mọi guest vào cùng một IP. Browser không lưu nội dung chat mới vào localStorage, chỉ giữ session/conversation ID.

Các key `chatbotMessages_*` từ widget cũ không được đọc hoặc ghi lại, cũng không tự xóa dữ liệu cũ của bạn. Nếu cần làm sạch PII legacy, sao lưu khi cần rồi xóa riêng các key đó trong browser storage; TTL mới không áp dụng ngược cho log cũ.

## Kiểm thử và đánh giá

```powershell
.\.runtime\python\python.exe -m pip install -r requirements-dev.txt
.\.runtime\python\python.exe -m pytest
.\.runtime\python\python.exe -m evaluation.run --min-recall .95 --min-f1 .95
.\.runtime\python\python.exe -m evaluation.run --dense --mode hybrid --output evaluation/reports/hybrid.json
# Khi cần pin E5-small để tái lập kết quả:
.\.runtime\python\python.exe -m evaluation.run --dense --mode hybrid --embedding-revision 614241f622f53c4eeff9890bdc4f31cfecc418b3
.\.runtime\python\python.exe -m evaluation.run --dense --mode dense --output evaluation/reports/dense.json
# So sánh model trên cùng tập nhãn; có thể tải model từ Hugging Face
.\.runtime\python\python.exe -m evaluation.run --dense --mode hybrid --embedding-model intfloat/multilingual-e5-small --embedding-model sentence-transformers/all-MiniLM-L6-v2
```

CI chỉ dùng core dependencies + regression offline, không gọi Gemini/MongoDB hoặc tải model lớn. Dataset hiện có **114 câu hồi quy tổng hợp, 14 sản phẩm giả, 84 câu có nhãn retrieval**. Nó kiểm tra intent/filter, multi-turn, size/màu/ngân sách, âm bản, policies; không phải tập held-out khách hàng thật. Chỉ số: macro-F1, exact filter match, Recall@5, MRR@5, nDCG@5, negative accuracy, constraint validity, latency pipeline. Latency này **không gồm cold start/model generation/network production**. Report có dataset hash, model, prompt version, thời điểm; lưu vào `evaluation/reports/` (ignore Git). Dense model lỗi thì benchmark dừng, không giả báo BM25 là dense.

Để đánh giá trên catalog thật, tạo JSONL riêng với `id`, `query`, `intent`, `filters`, `expected_product_ids` là Mongo ObjectIds thật; gắn provenance phù hợp, rồi chạy `--live --dataset <file>`. `--llm-routing` opt-in sẽ gọi API tính phí. Giữ riêng train/dev/test và câu paraphrase do người khác viết; chọn ngưỡng/model trên dev rồi đánh giá test một lần.

Các mode benchmark đều áp dụng hard constraints nhưng **tắt fallback theo category** để so sánh truy hồi không bị fallback che lỗi. Report ghi rõ ngưỡng cosine và revision. Runtime vẫn có category fallback để gợi ý mẫu đáp ứng yêu cầu khi điểm truy hồi không đạt ngưỡng.

Groundedness/hallucination và task success **chưa được suy ra từ điểm retrieval**. Thu thập câu trả lời đã ẩn PII, gắn nhãn người đánh giá:

```json
{"query":"...","answer":"...","sources":[{"title":"...","content":"..."}],"grounded":true,"task_success":true,"latency_ms":1200,"prompt_tokens":500,"output_tokens":100}
```

```powershell
.\.runtime\python\python.exe -m evaluation.answers annotations.jsonl
# Optional LLM judge: tốn quota, chỉ là hỗ trợ, phải kiểm tra nhãn lại
.\.runtime\python\python.exe -m evaluation.answers annotations.jsonl --judge
```

Chi phí chỉ được tính nếu bạn truyền đơn giá input/output hiện hành bằng `--input-usd-per-million` và `--output-usd-per-million`; mặc định không công bố chi phí bằng 0. Trace chỉ ghi metadata vận hành, không ghi token xác thực hoặc raw prompt; usage của request lỗi có thể không có. Feedback hiện lưu một rating cuối cho mỗi câu trả lời, nên lượt mở sản phẩm không phải analytics click đầy đủ.

## Trình bày trong CV

Có thể mô tả những gì đã xây dựng, không giả nhận đã fine-tune hay tự huấn luyện LLM:

> Built a Vietnamese e-commerce assistant using multilingual E5/FAISS + BM25 hybrid retrieval, schema-validated Gemini tool routing, inventory-aware recommendations, authenticated order tools, SSE chat, and reproducible evaluation/CI.

Nếu thêm chỉ số, ghi rõ *synthetic regression set*, kích thước dataset, phiên bản model và phạm vi latency. Trước khi ghi “production quality”, cần bộ câu hỏi thực tế độc lập, human groundedness/task-success review, load test, pentest authorization/prompt injection, monitoring và cost measurements. Optional reranker đã có adapter nhưng chưa được benchmark; Gemini generation smoke hiện bị quota 429.

Giới hạn quy mô: index hiện ở bộ nhớ từng worker, dùng full catalog refresh và đọc dữ liệu hiện tại của catalog ở mỗi lượt; phù hợp đồ án/danh mục nhỏ, chưa thiết kế cho hàng triệu SKU. Khi mở rộng cần candidate-first DB queries, shared index/vector service, ingestion queue và load test. Model sinh vẫn có thể đưa ra nhận xét phong cách không được nguồn hỗ trợ dù có prompt/guardrail; phải đo groundedness bằng nhãn độc lập.

## Tài liệu nền tảng

- [Google GenAI SDK chính thức](https://ai.google.dev/gemini-api/docs/libraries)
- [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [E5 multilingual model card](https://huggingface.co/intfloat/multilingual-e5-small)
