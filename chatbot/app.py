# import random
# import json
# import pickle
# import numpy as np
# import tensorflow as tf
# import nltk
# from nltk.stem import WordNetLemmatizer
# from flask import Flask, render_template, request, jsonify
# from flask_cors import CORS  # Thêm CORS để tránh lỗi Cross-Origin Request

# # Khởi tạo Flask app
# app = Flask(__name__)
# CORS(app)  # Cho phép tất cả các nguồn truy cập API

# # Đảm bảo tài nguyên của nltk đã được tải xuống
# nltk.download("punkt")
# nltk.download("wordnet")

# # Khởi tạo lemmatizer để chuẩn hóa từ
# lemmatizer = WordNetLemmatizer()

# # Load dữ liệu intents từ file JSON
# intents = json.loads(open('chatbot/intents.json', encoding="utf8").read())

# # Load danh sách từ (words) và danh sách intent (classes) đã lưu trước đó
# words = pickle.load(open('chatbot/words.pkl', 'rb'))
# classes = pickle.load(open('chatbot/classes.pkl', 'rb'))

# # Load mô hình đã huấn luyện
# model = tf.keras.models.load_model('chatbot/chatbot_model.h5')

# def clean_up_sentence(sentence):
#     """
#     Tiền xử lý câu nhập từ người dùng:
#     - Tokenize thành danh sách từ
#     - Lemmatization để chuẩn hóa từ về dạng gốc
#     """
#     sentence_words = nltk.word_tokenize(sentence)
#     sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
#     return sentence_words

# def bag_of_words(sentence):
#     """
#     Chuyển câu nhập từ người dùng thành vector Bag of Words (BOW):
#     - Nếu từ có trong danh sách words, gán giá trị 1, ngược lại gán 0
#     """
#     sentence_words = clean_up_sentence(sentence)
#     bag = [0] * len(words)
#     for s in sentence_words:
#         for i, w in enumerate(words):
#             if w == s:
#                 bag[i] = 1
#     return np.array(bag)

# def predict_class(sentence):
#     """
#     Dự đoán intent của câu nhập vào bằng cách:
#     - Chuyển câu thành vector BOW
#     - Dự đoán xác suất intent từ mô hình
#     - Chỉ giữ lại những intent có xác suất lớn hơn ngưỡng ERROR_THRESHOLD
#     """
#     bow = bag_of_words(sentence)
#     res = model.predict(np.array([bow]))[0]
#     ERROR_THRESHOLD = 0.25  # Chỉ giữ lại các intent có độ tin cậy trên 25%
#     results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
#     results.sort(key=lambda x: x[1], reverse=True)  # Sắp xếp theo xác suất giảm dần
#     return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

# def get_response(intents_list, intents_json):
#     """
#     Chọn câu trả lời dựa trên intent dự đoán:
#     - Lấy intent có xác suất cao nhất
#     - Tìm trong file intents.json câu trả lời tương ứng
#     """
#     if not intents_list:
#         return "Xin lỗi, tôi không hiểu."
    
#     tag = intents_list[0]['intent']
#     for i in intents_json['intents']:
#         if i['tag'] == tag:
#             return random.choice(i['responses'])
#     return "Xin lỗi, tôi không hiểu."

# @app.route("/")
# def home():
#     """Trang chủ hiển thị giao diện chatbot"""
#     return render_template("index.html")

# @app.route("/get", methods=["POST"])
# def chatbot_response():
#     """
#     API nhận tin nhắn từ người dùng, xử lý và trả về phản hồi:
#     - Lấy tin nhắn từ request JSON
#     - Dự đoán intent
#     - Trả về câu trả lời phù hợp
#     """
#     try:
#         data = request.get_json()
#         user_message = data.get("message", "").strip()

#         if not user_message:
#             return jsonify({"response": "Xin hãy nhập nội dung tin nhắn."})

#         predicted_intents = predict_class(user_message)
#         bot_response = get_response(predicted_intents, intents)

#         return jsonify({"response": bot_response})

#     except Exception as e:
#         print(f"Lỗi xử lý chatbot: {e}")
#         return jsonify({"response": "Xin lỗi, chatbot đang gặp sự cố."})

# if __name__ == "__main__":
#     app.run(debug=True)




import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

# Load biến môi trường
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "YOUR_GOOGLE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "YOUR_MONGO_URI")

# Kết nối MongoDB
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["test"]
products_collection = db["products"]

# Khởi tạo Flask app
app = Flask(__name__)
CORS(app)

# Hàm gọi Gemini API
def call_gemini_api(prompt, model="models/gemini-1.5-flash"):
    url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ]
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

# Truy xuất sản phẩm phù hợp
def find_products_by_keywords(keywords):
    query = {
        "$or": [
            {"name": {"$regex": keywords, "$options": "i"}},
            {"type": {"$regex": keywords, "$options": "i"}},
            {"description": {"$regex": keywords, "$options": "i"}}
        ]
    }
    products = products_collection.find(query).limit(5)
    return [
        {
            "name": p.get("name"),
            "price": p.get("price"),
            "image": p.get("image"),
            "rating": p.get("rating"),
            "discount": p.get("discount"),
            "countInStock": p.get("countInStock"),
            "description": p.get("description")
        }
        for p in products
    ]

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
            f"Người dùng hỏi: \"{user_message}\". Đây có phải câu hỏi tìm sản phẩm thời trang không? Trả lời ngắn: 'yes' hoặc 'no'."
        )
        if not intent_check:
            return jsonify({"response": "Có lỗi khi kiểm tra nội dung. Thử lại sau nhé!"})

        if "yes" in intent_check.get("text", "").lower():
            products = find_products_by_keywords(user_message)

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
                1. Gợi ý 2–3 mẫu nổi bật phù hợp với nhu cầu.
                2. Viết nội dung tư vấn ngắn gọn (3–5 dòng), thân thiện, có emoji nhẹ nhàng.
                3. Tránh văn phong máy móc (như "dữ liệu", "truy vấn"), hãy viết như đang chat thật với khách hàng.

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
