import random
import json
import pickle
import numpy as np
import tensorflow as tf
import nltk
nltk.download('wordnet')
nltk.download('punkt')
nltk.download('punkt_tab')
from nltk.stem import WordNetLemmatizer

lemmatizer = WordNetLemmatizer()

# Đọc dữ liệu từ file intents.json
with open(r'C:\Users\Admin\OneDrive - National Economics University\Desktop\đồ án\chatbot\intents.json', encoding="utf8") as file:
    intents = json.load(file)

# Khai báo danh sách để xử lý dữ liệu
words = []  # Danh sách từ
classes = []  # Danh sách nhãn (intents)
documents = []  # Cặp dữ liệu (từ, nhãn)
ignore_letters = ['?', '!', '.', ',']  # Loại bỏ các ký tự không cần thiết

# Tiền xử lý dữ liệu
for intent in intents['intents']:
    for pattern in intent['patterns']:
        word_list = nltk.word_tokenize(pattern)  # Tách từ trong câu
        words.extend(word_list)
        documents.append((word_list, intent['tag']))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# Chuẩn hóa dữ liệu
words = [lemmatizer.lemmatize(word.lower()) for word in words if word not in ignore_letters]
words = sorted(set(words))  # Loại bỏ từ trùng lặp
classes = sorted(set(classes))  # Loại bỏ nhãn trùng lặp

# Lưu dữ liệu đã xử lý vào file
pickle.dump(words, open('words.pkl', 'wb'))
pickle.dump(classes, open('classes.pkl', 'wb'))

# Chuẩn bị dữ liệu huấn luyện
training = []
output_empty = [0] * len(classes)

for document in documents:
    bag = []
    word_patterns = document[0]
    word_patterns = [lemmatizer.lemmatize(word.lower()) for word in word_patterns]
    for word in words:
        bag.append(1) if word in word_patterns else bag.append(0)
    
    output_row = list(output_empty)
    output_row[classes.index(document[1])] = 1
    training.append(bag + output_row)

# Xáo trộn dữ liệu để tránh overfitting
random.shuffle(training)
training = np.array(training)

# Tách dữ liệu thành đầu vào (X) và đầu ra (Y)
train_x = training[:, :len(words)]
train_y = training[:, len(words):]

# Xây dựng mô hình mạng nơ-ron nhân tạo (ANN)
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, input_shape=(len(train_x[0]),), activation='relu'),     # Lớp đầu vào: Số lượng neuron đầu vào tương ứng với số lượng từ (features) sau khi tiền xử lý
    tf.keras.layers.Dropout(0.5),     # Lớp Dropout: Giúp giảm overfitting bằng cách vô hiệu hóa ngẫu nhiên 50% số neuron trong mỗi lần huấn luyện
    tf.keras.layers.Dense(64, activation='relu'),     # Lớp ẩn 1: 128 neuron với hàm kích hoạt ReLU
    tf.keras.layers.Dropout(0.5),     # Lớp Dropout: Lặp lại việc vô hiệu hóa 50% số neuron để tăng tính tổng quát của mô hình
    tf.keras.layers.Dense(len(train_y[0]), activation='softmax')     # Lớp đầu ra: Số neuron tương ứng với số lớp đầu ra (intents), sử dụng Softmax để tính xác suất từng intent
])

# Biên dịch mô hình
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# Huấn luyện mô hình
model.fit(np.array(train_x), np.array(train_y), epochs=200, batch_size=5, verbose=1)

# Lưu mô hình đã huấn luyện
model.save('chatbot_model.h5')
print("Training complete. Model saved as chatbot_model.h5")


