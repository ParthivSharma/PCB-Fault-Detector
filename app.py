from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os
import uuid

app = FastAPI()

# Allow CORS from frontend (Vite server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # adjust if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model_path = "/Users/parthivsharma/runs/detect/train/weights/best.pt"  # change if needed
model = YOLO(model_path)

@app.get("/")
def read_root():
    return {"message": "Welcome to the PCB Fault Detector API"}

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Validate uploaded file
    if not file.content_type.startswith("image/"):
        return {"error": "File must be an image."}

    # Save uploaded image
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    input_dir = "uploaded_images"
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Clean previous prediction output
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

    # Run YOLO prediction
    results = model.predict(
        source=input_path,
        save=True,
        save_txt=True,
        conf=0.25,
        imgsz=640
    )

    # Prepare detection results
    results_list = []
    if results and len(results[0].boxes) > 0:
        class_id = int(results[0].boxes.cls[0])
        label = results[0].names[class_id]
        confidence = float(results[0].boxes.conf[0])
        results_list.append({
            "label": label,
            "confidence": confidence
        })

    return {
        "results": results_list
    }
