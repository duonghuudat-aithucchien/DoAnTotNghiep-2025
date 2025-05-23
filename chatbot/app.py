import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "YOUR_GOOGLE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "YOUR_MONGO_URI")


mongo_client = MongoClient(MONGO_URI)
db = mongo_client["test"]
products_collection = db["products"]


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
def find_products_by_semantic_search(query, top_k=5):
    query_vec = bert_model.encode([query], convert_to_numpy=True)
    distances, indices = faiss_index.search(query_vec, top_k)

    results = []
    for idx in indices[0]:
        if idx < len(product_data):
            p = product_data[idx]
            results.append({
                "name": p.get("name"),
                "price": p.get("price"),
                "image": p.get("image"),
                "rating": p.get("rating"),
                "discount": p.get("discount"),
                "countInStock": p.get("countInStock"),
                "description": p.get("description")
            })
    return results

# Route giao diện chatbot
@app.route("/")
def home():
    return render_template("index.html")

# API xử lý phản hồi chatbot
@app.route("/get", methods=["POST"])
def chatbot_response():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"response": "Bạn vui lòng nhập câu hỏi để mình hỗ trợ nhé!"})

        # Xác định intent
        intent_check = call_gemini_api(
            f"""
            Người dùng hỏi: "{user_message}".
            Đây có phải là câu hỏi liên quan đến tìm kiếm sản phẩm thời trang không?
            Trả lời ngắn gọn: 'yes' hoặc 'no'.
            """
        )
        if not intent_check:
            return jsonify({"response": "Có lỗi khi kiểm tra nội dung. Thử lại sau nhé!"})

        if "yes" in intent_check.get("text", "").lower():
            products = find_products_by_semantic_search(user_message)

            if not products:
                return jsonify({"response": "Xin lỗi, hiện tại chưa có sản phẩm phù hợp với yêu cầu của bạn 😥."})

            # Soạn prompt tư vấn thời trang
            formatted_products = "\n".join([
                f"- {p['name']} | Giá: {p['price']} VND | Đánh giá: {p['rating']}/5 | Giảm: {p['discount']}% | Tồn kho: {p['countInStock']}"
                for p in products
            ])

            prompt = f"""
                Bạn là chuyên viên tư vấn thời trang của cửa hàng Fashion Style, phong cách tự nhiên, thân thiện.

                Khách hỏi: "{user_message}"

                Dưới đây là các sản phẩm phù hợp:

                {formatted_products}

                Hãy:
                1. Gợi ý 2–3 mẫu nổi bật phù hợp với nhu cầu của khách.
                2. Viết nội dung tư vấn ngắn gọn (3–5 dòng), thân thiện, có emoji nhẹ nhàng.
                3. Đưa ra lý do tại sao sản phẩm phù hợp (ví dụ: phù hợp với mùa, phong cách, hoặc giá cả hợp lý).
                4. Tránh văn phong máy móc (như "dữ liệu", "truy vấn"), hãy viết như đang chat thật với khách hàng.

                Chỉ trả lời phần tư vấn, không cần lặp lại danh sách sản phẩm.
            """

            response = call_gemini_api(prompt)
            if not response:
                return jsonify({"response": "Tạm thời mình chưa thể tư vấn được, bạn quay lại sau một chút nhé 😥."})

            return jsonify({"response": response.get("text", "")})

        # Không phải câu hỏi mua hàng → trả lời thông thường
        fallback = call_gemini_api(user_message)
        if not fallback:
            return jsonify({"response": "Hiện mình đang bận chút, bạn quay lại sau nhé 😅"})
        return jsonify({"response": fallback.get("text", "")})

    except Exception as e:
        print("Lỗi:", e)
        return jsonify({"response": "Có lỗi xảy ra khi xử lý. Vui lòng thử lại sau!"})

if __name__ == "__main__":
    app.run(debug=True)


