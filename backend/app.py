from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os
import uuid
from fastapi.responses import JSONResponse
from PIL import Image

app = FastAPI()

# CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# 🧠 Model & Reference Setup
# ---------------------------
MODEL_VERSION = "best_model.pt"
model_path = f"backend/models/{MODEL_VERSION}"
model = YOLO(model_path)

REQUIRED_COMPONENTS = [
    "Cap1", "Cap2", "Cap3", "Cap4",
    "MOSFET", "Mov", "Resistor", "Transformer"
]

# ---------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to the PCB Fault Detector API"}

# ---------------------------
# 🔍 Image Upload Endpoint
# ---------------------------
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return JSONResponse(content={"error": "File must be an image."}, status_code=400)

    filename = f"{uuid.uuid4().hex}_{file.filename}"
    input_dir = "uploaded_images"
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with Image.open(input_path) as img:
        original_width, original_height = img.size

    output_dir = "runs/detect/predict"
    if os.path.exists(output_dir):
        for f in os.listdir(output_dir):
            path = os.path.join(output_dir, f)
            try:
                if os.path.isfile(path) or os.path.islink(path):
                    os.remove(path)
                elif os.path.isdir(path):
                    shutil.rmtree(path)
            except Exception as e:
                print(f"❌ Error removing {path}: {e}")

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

    # Check for missing components
    missing_components = [comp for comp in REQUIRED_COMPONENTS if detected_labels.count(comp) == 0]
    is_faulty = len(missing_components) > 0

    return JSONResponse(content={
        "results": results_list,
        "original_width": original_width,
        "original_height": original_height,
        "is_faulty": is_faulty,
        "missing_components": missing_components
    })
