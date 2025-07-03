from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os
import uuid

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model_path = "/Users/parthivsharma/Documents/GitHub/PCB-Fault-Detector/best.pt"
model = YOLO(model_path)

@app.get("/")
def read_root():
    return {"message": "Welcome to the PCB Fault Detector API"}

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Validate image type
    if not file.content_type.startswith("image/"):
        return {"error": "File must be an image."}

    # Save uploaded file temporarily
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    input_dir = "uploaded_images"
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Predict using YOLO
    results = model.predict(
        source=input_path,
        save=True,
        save_txt=True,
        conf=0.25,
        imgsz=640
    )

    # Log predictions to terminal
    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            class_name = results[0].names[cls_id]
            conf = round(float(box.conf[0]), 2)
            print(f"🟢 Detected: {class_name} ({conf})")

    return {
        "message": "Prediction complete. Results saved in 'runs/detect/predict'."
    }
