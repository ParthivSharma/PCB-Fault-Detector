from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import shutil
import os
import uuid

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_VERSION = "new_best.pt"
model = YOLO(f"backend/models/{MODEL_VERSION}")

REQUIRED_COMPONENTS = [
    "Electrolytic Capacitor",
    "IC",
    "Inductor",
    "Led",
    "Pads",
    "Pins",
    "Resistor",
    "Transistor"
]

def process_image(file: UploadFile, filename: str):
    input_dir = "uploaded_images"
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with Image.open(input_path) as img:
        original_width, original_height = img.size

    # Clean previous predictions
    output_dir = "runs/detect/predict"
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

    # Inference
    results = model.predict(
        source=input_path,
        save=True,
        save_txt=True,
        conf=0.25,
        imgsz=640
    )

    detected_labels = []
    results_list = []

    if results and results[0].boxes is not None:
        for box in results[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            class_id = int(box.cls[0])
            label = model.names[class_id]
            confidence = float(box.conf[0])
            results_list.append({
                "label": label,
                "confidence": confidence,
                "bbox": [x1, y1, x2 - x1, y2 - y1]
            })
            detected_labels.append(label)

    missing_components = [comp for comp in REQUIRED_COMPONENTS if detected_labels.count(comp) == 0]
    is_faulty = len(missing_components) > 0

    return JSONResponse(content={
        "results": results_list,
        "original_width": original_width,
        "original_height": original_height,
        "is_faulty": is_faulty,
        "missing_components": missing_components
    })


# 🌐 GET Root
@app.get("/")
def read_root():
    return {"message": "Welcome to the PCB Fault Detector API"}


# 📥 Upload Image Endpoint
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    return process_image(file, filename)


# 🎥 Live Detection from Webcam Capture
@app.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    filename = f"frame_{uuid.uuid4().hex}.jpg"
    return process_image(file, filename)
