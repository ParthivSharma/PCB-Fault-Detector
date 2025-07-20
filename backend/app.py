from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ultralytics import YOLO
from PIL import Image
from .database import SessionLocal, engine
from .models import Base, User, UploadedImage
import jwt
import os
import shutil
import uuid
from datetime import datetime
from pytz import timezone

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

JWT_SECRET = os.getenv("JWT_SECRET", "defaultsecret")
IST = timezone('Asia/Kolkata')

os.makedirs("backend/runs/detect", exist_ok=True)
os.makedirs("uploaded_images", exist_ok=True)

app.mount(
    "/runs/detect",
    StaticFiles(directory=os.path.join(os.getcwd(), "backend", "runs", "detect")),
    name="runs_detect"
)

app.mount(
    "/uploaded_images",
    StaticFiles(directory=os.path.join(os.getcwd(), "uploaded_images")),
    name="uploaded_images"
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

MODEL_VERSION = "new_best.pt"
MODEL_PATH = os.path.join("backend", "models", MODEL_VERSION)

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = YOLO(MODEL_PATH)

REQUIRED_COMPONENTS = [
    "Electrolytic Capacitor", "IC", "Inductor", "Led",
    "Pads", "Pins", "Resistor", "Transistor"
]

def process_image(file_path: str):
    with Image.open(file_path) as img:
        original_width, original_height = img.size

    save_dir = os.path.join("backend", "runs", "detect")
    os.makedirs(save_dir, exist_ok=True)

    results = model.predict(
        source=file_path,
        save=True,
        save_txt=True,
        conf=0.25,
        imgsz=640,
        project=save_dir,
        name="predict"
    )

    detected_labels = []
    results_list = []

    yolo_save_dir = results[0].save_dir if results else None

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

    return results_list, original_width, original_height, is_faulty, missing_components, yolo_save_dir

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db), authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == payload["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    upload_dir = "uploaded_images"
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    original_path = os.path.join(upload_dir, unique_filename)

    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results_list, original_width, original_height, is_faulty, missing_components, save_dir = process_image(original_path)

    if not save_dir or not os.path.exists(save_dir):
        raise HTTPException(status_code=500, detail="Annotated image directory not found")

    annotated_path = None
    for f in os.listdir(save_dir):
        if f.lower().endswith((".jpg", ".jpeg", ".png")):
            annotated_path = os.path.join(save_dir, f)
            break

    if not annotated_path:
        raise HTTPException(status_code=500, detail="Annotated image not generated")

    annotated_relative_path = os.path.relpath(annotated_path, "backend/runs/detect").replace("\\", "/")

    image_record = UploadedImage(
        original_filename=file.filename,
        original_filepath=original_path,
        annotated_filepath=annotated_path,
        uploaded_by=user.id,
        uploaded_at=datetime.now(IST)  # <<< IST timestamp here
    )
    db.add(image_record)
    db.commit()
    db.refresh(image_record)

    return {
        "message": "Image uploaded and processed successfully",
        "image_id": image_record.id,
        "original_image_path": f"/uploaded_images/{unique_filename}",
        "annotated_image_path": f"/runs/detect/{annotated_relative_path}",
        "results": results_list,
        "original_width": original_width,
        "original_height": original_height,
        "is_faulty": is_faulty,
        "missing_components": missing_components
    }

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

@app.get("/users")
def get_all_users(db: Session = Depends(get_db), authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.split(" ")[1]
    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    users = db.query(User).filter(User.is_admin == False).all()
    return [{"id": u.id, "username": u.username, "is_admin": u.is_admin} for u in users]

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.split(" ")[1]
    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_admin:
        raise HTTPException(status_code=403, detail="Cannot delete an admin user")

    db.delete(user)
    db.commit()
    return {"message": f"User with id {user_id} deleted successfully"}

@app.get("/admin/uploaded_images")
def admin_get_uploaded_images(db: Session = Depends(get_db), authorization: str = Header(...)):
    token = authorization.split(" ")[1]
    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    images = db.query(UploadedImage).all()
    return [
        {
            "id": img.id,
            "original_filename": img.original_filename,
            "original_image_url": f"/uploaded_images/{os.path.basename(img.original_filepath)}",
            "annotated_image_url": f"/runs/detect/{os.path.relpath(img.annotated_filepath, 'backend/runs/detect').replace(os.sep, '/')}",
            "uploaded_by": img.uploaded_by,
            "uploaded_at": img.uploaded_at
        }
        for img in images
    ]
