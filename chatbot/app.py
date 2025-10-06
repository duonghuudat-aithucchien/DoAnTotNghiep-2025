import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "YOUR_GOOGLE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "YOUR_MONGO_URI")


mongo_client = MongoClient(MONGO_URI)
db = mongo_client["test"]
products_collection = db["products"]
conversations_collection = db["conversations"]


app = Flask(__name__)
CORS(app)

# Tải mô hình BERT và khởi tạo FAISS index
bert_model = SentenceTransformer("all-MiniLM-L6-v2")
dimension = 384  # embedding size của all-MiniLM-L6-v2
faiss_index = faiss.IndexFlatL2(dimension)
product_embeddings = []
product_data = []

def build_faiss_index():
    global product_embeddings, product_data
    products = list(products_collection.find({}))
    texts = [f"{p.get('name', '')} {p.get('type', '')} {p.get('description', '')}" for p in products]
    embeddings = bert_model.encode(texts, convert_to_numpy=True)
    product_embeddings = embeddings
    product_data = products
    faiss_index.add(embeddings)

build_faiss_index()

# Hàm gọi Gemini API
def call_gemini_api(prompt, model="models/gemini-1.5-flash"):
    url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}]
    }
    params = {"key": GOOGLE_API_KEY}

    try:
        response = requests.post(url, headers=headers, json=payload, params=params)
        response.raise_for_status()
        data = response.json()
        content = data.get("candidates", [])[0].get("content", {}).get("parts", [])
        return {"text": content[0].get("text", "") if content else ""}
    except Exception as e:
        print("Gemini API error:", e)
        return None

# Truy xuất sản phẩm bằng semantic search (FAISS + BERT)
def find_products_by_semantic_search(query, top_k=5, distance_threshold=1.0):
    query_vec = bert_model.encode([query], convert_to_numpy=True)
    distances, indices = faiss_index.search(query_vec, top_k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if dist > distance_threshold:
            continue  # bỏ nếu quá khác biệt
        if idx < len(product_data):
            p = product_data[idx]
            results.append({
                "_id": str(p.get("_id")),
                "name": p.get("name"),
                "price": p.get("price"),
                "image": p.get("image"),
                "rating": p.get("rating"),
                "discount": p.get("discount"),
                "countInStock": p.get("countInStock"),
                "description": p.get("description")
            })
    return results


def is_fashion_intent(user_message):
    fashion_keywords = [
        "áo", "quần", "váy", "giày", "hoodie", "sơ mi", "jeans", "outfit", "mặc gì",
        "phối đồ", "mua", "tư vấn", "style", "trang phục", "phụ kiện", "đi chơi",
        "đi làm", "đi học", "dự tiệc", "mix đồ", "áo thun", "áo khoác", "đồ nam", "đồ nữ"
    ]
    message = user_message.lower()
    return any(kw in message for kw in fashion_keywords)

def is_payment_intent(user_message):
    payment_keywords = [
        "thanh toán", "trả tiền", "cách thanh toán", "thanh toán như thế nào",
        "có chuyển khoản không", "thanh toán paypal", "ship cod", "trả khi nhận hàng"
    ]
    message = user_message.lower()
    return any(kw in message for kw in payment_keywords)

def is_buying_intent(user_message):
    buying_keywords = ["mua hàng", "muốn mua", "đặt hàng", "mua đồ"]
    message = user_message.lower()
    return any(kw in message for kw in buying_keywords)

def is_outfit_intent(user_message):
    outfit_keywords = [
        "phối đồ", "mặc gì", "outfit", "đi chơi mặc gì", "mix đồ", "mặc sao cho đẹp"
    ]
    message = user_message.lower()
    return any(kw in message for kw in outfit_keywords)

def is_shipping_intent(user_message):
    shipping_keywords = [
        "giao hàng", "vận chuyển", "mất bao lâu", "ship mấy ngày", "bao lâu nhận",
        "thời gian giao", "ship hàng", "khi nào nhận"
    ]
    message = user_message.lower()
    return any(kw in message for kw in shipping_keywords)

def is_occasion_intent(user_message):
    occasion_keywords = [
        "đi làm", "đi học", "đi chơi", "đi tiệc", "phỏng vấn", "hẹn hò", "dạo phố", "đi cafe"
    ]
    message = user_message.lower()
    return any(kw in message for kw in occasion_keywords)

def is_location_info(user_message):
    location_keywords = [
        "hà nội", "tp.hcm", "sài gòn", "bình dương", "bắc giang", "đà nẵng", "cần thơ", "hải phòng", "quận", "tỉnh"
    ]
    message = user_message.lower()
    return any(kw in message for kw in location_keywords)

def is_greeting_intent(user_message):
    greeting_keywords = [
        "hi", "hello", "hihi", "chào", "chào bạn", "helo", "yo", "hey", "alo", "hế lô", "hè lố", "xin chào", "chào sốp"
    ]
    message = user_message.lower()
    return any(kw in message for kw in greeting_keywords)


def filter_products_from_response(response_text, products):
    filtered = []
    for p in products:
        if p['name'].lower() in response_text.lower():
            filtered.append(p)
    return filtered


# Route giao diện chatbot
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def chatbot_response():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()
        user_id = data.get("userId", "unknown")
        user_email = data.get("userEmail", "")

        if not user_message:
            return jsonify({"response": "Bạn vui lòng nhập câu hỏi để mình hỗ trợ nhé!"})
        
        def log_conversation(msg, resp):
            conversations_collection.insert_one({
                "userId": user_id,
                "userEmail": user_email,
                "user_message": msg,
                "bot_response": resp,
                "timestamp": datetime.utcnow()
            })
        
        if is_greeting_intent(user_message):
            return jsonify({
                "response": (
                    "Hihi chào bạn, mình là **Tiểu Màn Thầu 🍡**, chuyên viên tư vấn thời trang tại cửa hàng **FashionStyle**.\n"
                    "Bạn đang cần tìm gì nè? Mình có thể gợi ý outfit, áo quần đi chơi hay đi làm đều được nhé! 😊"
                )
            })

        if is_payment_intent(user_message):
            return jsonify({"response": (
                "📦 Cửa hàng hỗ trợ 2 hình thức thanh toán:\n"
                "- **Thanh toán khi nhận hàng (COD)**: Nhận hàng rồi mới trả tiền 💸\n"
                "- **Thanh toán qua PayPal**: An toàn, nhanh chóng 🌐\n"
                "Bạn chọn cách nào thì cứ yên tâm nhé, tụi mình luôn hỗ trợ hết mình ạ! ❤️"
            )})

        if is_shipping_intent(user_message):
            return jsonify({"response": (
                "🚚 Shop giao hàng toàn quốc nha!\n"
                "- Nội thành: 1–2 ngày\n"
                "- Ngoại thành: 3–5 ngày\n"
                "Bạn ở đâu để mình báo cụ thể hơn ạ? 😊"
            )})
        if is_location_info(user_message):
            return jsonify({
                "response": (
                    "Cảm ơn bạn đã chia sẻ vị trí 🗺️\n"
                    "Shop sẽ giao đến khu vực đó khoảng 2–5 ngày tuỳ tuyến nhé. Nếu cần gấp, bạn cứ báo mình nè! Số điện thoại của mình: 0334400884"
                )
            })

        if is_outfit_intent(user_message):
            return jsonify({"response": (
                "Bạn muốn phối đồ đi đâu nè? 😄 Đi chơi, đi làm hay đi tiệc?\n"
                "Mình sẽ gợi ý outfit thật xịnh cho bạn luôn!"
            )})
        
        if is_occasion_intent(user_message):
            return jsonify({
                "response": (
                    "Với dịp này, bạn nên chọn outfit vừa thoải mái vừa đúng phong cách 🧥👖\n"
                    "Bạn muốn sản phẩm nào, nhắn cho mình biết nha!"
                )
            })

        if is_buying_intent(user_message):
            return jsonify({"response": (
                "Bạn muốn mua gì nè? 😊 Áo phông, quần hay áo sơ mi ạ?\n"
                "Bạn cứ gõ tên sản phẩm cụ thể giúp mình nha!"
            )})

        if is_fashion_intent(user_message):
            products = find_products_by_semantic_search(user_message, distance_threshold=1.0)

            if not products:
                return jsonify({"response": "Xin lỗi, hiện tại chưa có sản phẩm phù hợp với yêu cầu của bạn 😥."})

            top_products = products[:3]
            formatted_products = "\n".join([
                f"{i+1}. {p['name']} – Giá: {p['price']} VND, Đánh giá: {p['rating']}/5, Giảm: {p['discount']}%"
                for i, p in enumerate(top_products)
            ])

            prompt = f"""
                Bạn là chuyên gia tư vấn thời trang tại cửa hàng Fashion Style, phong cách thân thiện, ngắn gọn.

                Khách hỏi: \"{user_message}\"

                Dưới đây là 3 sản phẩm phù hợp:
                {formatted_products}

                Hãy:
                - Gợi ý 1–2 sản phẩm tiêu biểu.
                - Viết nội dung tư vấn ngắn gọn (tối đa 4 dòng), có emoji nhẹ.
                - Giải thích ngắn lý do chọn sản phẩm.
                - Không lặp lại danh sách đầy đủ.
                - Viết như đang chat thật với khách.
            """

            response = call_gemini_api(prompt)
            if not response:
                response_text = "Tạm thời mình chưa thể tư vấn được, bạn quay lại sau một chút nhé 😥."
                log_conversation(user_message, response_text)
                return jsonify({"response": response_text})
            
            response_text = response.get("text", "")
            log_conversation(user_message, response_text)
            filtered_products = filter_products_from_response(response_text, top_products)

            return jsonify({
                "response": response_text,
                "products": [
                    {
                        "name": p['name'],
                        "price": p['price'],
                        "discount": p['discount'],
                        "rating": p['rating'],
                        "image": p['image'],
                        "link": f"http://localhost:3000/product-details/{p['_id']}"
                    } for p in filtered_products
                ]
            })

        fallback = call_gemini_api(user_message)
        if not fallback:
            response_text = "Hiện mình đang bận chút, bạn quay lại sau nhé 😅"
        else:
            response_text = fallback.get("text", "")

        log_conversation(user_message, response_text)
        return jsonify({"response": response_text})

    except Exception as e:
        print("Lỗi:", e)
        return jsonify({"response": "Có lỗi xảy ra khi xử lý. Vui lòng thử lại sau!"})
    
@app.route("/get-conversations", methods=["GET"])
def get_conversations_by_user():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Thiếu userId"}), 400

    conversations = list(conversations_collection.find({"userId": user_id}).sort("timestamp", -1))
    result = [{
        "message": c.get("user_message"),
        "response": c.get("bot_response"),
        "timestamp": c.get("timestamp").isoformat()
    } for c in conversations]
    return jsonify({"conversations": result})

if __name__ == "__main__":
    app.run(debug=True)


