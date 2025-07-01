from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import base64
import io
from PIL import Image
import os

app = Flask(__name__)

# Path to your model (update as needed)
MODEL_PATH = 'mobilenetv3_rotten_fresh.h5'

# Load model (reloads if you swap the file)
def load_model():
    return tf.keras.models.load_model(MODEL_PATH)

model = load_model()
IMG_SIZE = (224, 224)

@app.route('/predict', methods=['POST'])
def predict():
    # Accept either base64 or raw file
    if 'file' in request.files:
        img_file = request.files['file']
        img = Image.open(img_file.stream).convert('RGB')
    elif 'image_base64' in request.json:
        img_data = base64.b64decode(request.json['image_base64'])
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
    else:
        return jsonify({'error': 'No image provided'}), 400

    img = img.resize(IMG_SIZE)
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    pred = model.predict(img_array)[0][0]
    label = 'rotten' if pred > 0.5 else 'fresh'
    return jsonify({'result': label, 'confidence': float(pred)})

@app.route('/reload', methods=['POST'])
def reload():
    global model
    model = load_model()
    return jsonify({'status': 'Model reloaded'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
