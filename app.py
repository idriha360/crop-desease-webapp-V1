# app.py

import os
import io
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import torch

from model.model_utils import load_model, predict_image

# ——— Configuration ———
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'best_val_acc_model.pth')
DEVICE     = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Your 38 classes in exactly the trained order:
CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

# ——— Initialize App & Model ———
app = Flask(
    __name__,
    static_folder='static_site',   # ← serve these files statically
    static_url_path=''             # ← at the root URL
)
CORS(app)  # allow cross‐origin from your front-end if needed

model = load_model(MODEL_PATH, num_classes=len(CLASS_NAMES), device=DEVICE)


# ——— API endpoint ———
@app.route('/predict', methods=['POST'])
def predict():
    # 1) Determine which key was used ('file' or 'image')
    if 'file' in request.files:
        upload_key = 'file'
    elif 'image' in request.files:
        upload_key = 'image'
    else:
        return jsonify({'error': 'No file part'}), 400

    # 2) Grab the uploaded file
    file = request.files[upload_key]
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 3) Read into PIL.Image
    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    except Exception as e:
        return jsonify({'error': f'Invalid image: {e}'}), 400

    # 4) Run your PyTorch model
    result = predict_image(model, DEVICE, img, CLASS_NAMES)

    # 5) Return the JSON result
    return jsonify(result)


# ——— Serve the Single-Page Front-End ———
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """
    For any requested path:
      - If it matches a file in static_site/, serve it.
      - Otherwise, fall back to index.html (client-side routing).
    """
    target = path or 'index.html'
    full_path = os.path.join(app.static_folder, target)

    if os.path.exists(full_path):
        return send_from_directory(app.static_folder, target)
    else:
        # fallback for e.g. /unknown → index.html
        return send_from_directory(app.static_folder, 'index.html')


# ——— Run the App ———
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
