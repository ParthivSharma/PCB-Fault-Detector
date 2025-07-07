from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os
import uuid
from fastapi.responses import JSONResponse
from PIL import Image  # ✅ For getting image dimensions

app = FastAPI()

# Allow CORS from frontend (Vite server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model_path = "/Users/parthivsharma/runs/detect/train/weights/best.pt"
model = YOLO(model_path)

@app.get("/")
def read_root():
    return {"message": "Welcome to the PCB Fault Detector API"}

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

    # ✅ Get original image dimensions
    with Image.open(input_path) as img:
        original_width, original_height = img.size

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

    # Extract predictions
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

    # ✅ Include original image dimensions in response
    return JSONResponse(content={
        "results": results_list,
        "original_width": original_width,
        "original_height": original_height
    })
