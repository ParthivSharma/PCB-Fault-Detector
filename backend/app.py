from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ultralytics import YOLO
from PIL import Image
from .database import SessionLocal, engine
from .models import Base, User
import jwt
import os
import shutil
import uuid

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Ensure tables are created ---
Base.metadata.create_all(bind=engine)

# --- Load JWT secret ---
JWT_SECRET = os.getenv("JWT_SECRET", "defaultsecret")

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Models ---
class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --- Load ML Model ---
MODEL_VERSION = "new_best.pt"
MODEL_PATH = os.path.join("backend", "models", MODEL_VERSION)

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = YOLO(MODEL_PATH)

REQUIRED_COMPONENTS = [
    "Electrolytic Capacitor", "IC", "Inductor", "Led",
    "Pads", "Pins", "Resistor", "Transistor"
]

def process_image(file: UploadFile, filename: str):
    input_dir = "uploaded_images"
    os.makedirs(input_dir, exist_ok=True)
    input_path = os.path.join(input_dir, filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with Image.open(input_path) as img:
        original_width, original_height = img.size

    output_dir = "runs/detect/predict"
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

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


@app.get("/")
def read_root():
    return {"message": "Welcome to the PCB Fault Detector & Auth API"}


@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(username=request.username, password_hash=request.password, is_admin=False)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or user.password_hash != request.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token_data = {"username": user.username, "is_admin": user.is_admin}
    token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")

    return {"access_token": token, "is_admin": user.is_admin}


# ✅ New Admin Login Route
@app.post("/admin-login")
def admin_login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or user.password_hash != request.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not user.is_admin:
        raise HTTPException(status_code=403, detail="User is not an admin")

    token_data = {"username": user.username, "is_admin": user.is_admin}
    token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")

    return {"access_token": token, "is_admin": user.is_admin}


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    return process_image(file, filename)


@app.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    filename = f"frame_{uuid.uuid4().hex}.jpg"
    return process_image(file, filename)
