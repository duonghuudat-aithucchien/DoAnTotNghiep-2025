import random
import json
import pickle
import numpy as np
import tensorflow as tf
import nltk
from nltk.stem import WordNetLemmatizer
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS  # Thêm CORS để tránh lỗi Cross-Origin Request

# Khởi tạo Flask app
app = Flask(__name__)
CORS(app)  # Cho phép tất cả các nguồn truy cập API

# Đảm bảo tài nguyên của nltk đã được tải xuống
nltk.download("punkt")
nltk.download("wordnet")

# Khởi tạo lemmatizer để chuẩn hóa từ
lemmatizer = WordNetLemmatizer()

# Load dữ liệu intents từ file JSON
intents = json.loads(open('chatbot/intents.json', encoding="utf8").read())

# Load danh sách từ (words) và danh sách intent (classes) đã lưu trước đó
words = pickle.load(open('chatbot/words.pkl', 'rb'))
classes = pickle.load(open('chatbot/classes.pkl', 'rb'))

# Load mô hình đã huấn luyện
model = tf.keras.models.load_model('chatbot/chatbot_model.h5')

def clean_up_sentence(sentence):
    """
    Tiền xử lý câu nhập từ người dùng:
    - Tokenize thành danh sách từ
    - Lemmatization để chuẩn hóa từ về dạng gốc
    """
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bag_of_words(sentence):
    """
    Chuyển câu nhập từ người dùng thành vector Bag of Words (BOW):
    - Nếu từ có trong danh sách words, gán giá trị 1, ngược lại gán 0
    """
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

def predict_class(sentence):
    """
    Dự đoán intent của câu nhập vào bằng cách:
    - Chuyển câu thành vector BOW
    - Dự đoán xác suất intent từ mô hình
    - Chỉ giữ lại những intent có xác suất lớn hơn ngưỡng ERROR_THRESHOLD
    """
    bow = bag_of_words(sentence)
    res = model.predict(np.array([bow]))[0]
    ERROR_THRESHOLD = 0.25  # Chỉ giữ lại các intent có độ tin cậy trên 25%
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)  # Sắp xếp theo xác suất giảm dần
    return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

def get_response(intents_list, intents_json):
    """
    Chọn câu trả lời dựa trên intent dự đoán:
    - Lấy intent có xác suất cao nhất
    - Tìm trong file intents.json câu trả lời tương ứng
    """
    if not intents_list:
        return "Xin lỗi, tôi không hiểu."
    
    tag = intents_list[0]['intent']
    for i in intents_json['intents']:
        if i['tag'] == tag:
            return random.choice(i['responses'])
    return "Xin lỗi, tôi không hiểu."

@app.route("/")
def home():
    """Trang chủ hiển thị giao diện chatbot"""
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def chatbot_response():
    """
    API nhận tin nhắn từ người dùng, xử lý và trả về phản hồi:
    - Lấy tin nhắn từ request JSON
    - Dự đoán intent
    - Trả về câu trả lời phù hợp
    """
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"response": "Xin hãy nhập nội dung tin nhắn."})

        predicted_intents = predict_class(user_message)
        bot_response = get_response(predicted_intents, intents)

        return jsonify({"response": bot_response})

    except Exception as e:
        print(f"Lỗi xử lý chatbot: {e}")
        return jsonify({"response": "Xin lỗi, chatbot đang gặp sự cố."})

if __name__ == "__main__":
    app.run(debug=True)




