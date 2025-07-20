# PCB Fault Detector

This project detects manufacturing faults in PCBs (Printed Circuit Boards) using a YOLOv8-based deep learning model. It provides a full-stack solution with a FastAPI backend and a React frontend.

---

## Features
- Detects PCB components and identifies faults like missing components.
- Deep learning model: YOLOv8 (Ultralytics).
- Backend: Python with FastAPI.
- Frontend: React with TypeScript.
- JWT-based authentication for users and admins.
- Admin dashboard to manage users and view uploaded images.
- Saves original and annotated images locally; stores paths in SQLite database using SQLAlchemy.

---

## Project Structure
```
PCB-Fault-Detector/
│
├── backend/           # FastAPI backend
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── ...
│
├── frontend/          # React frontend
│
├── runs/              # YOLO annotated images
├── uploaded_images/   # Original uploaded images
├── static/
├── requirements.txt   # Python dependencies
├── package.json       # React dependencies
└── README.md
```

---

## How to Run

### 1. Clone the Repository
```bash
git clone <repository-link>
cd PCB-Fault-Detector
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
✅ Ensure the YOLOv8 model file (`new_best.pt`) is placed inside:
```
backend/models/
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## Requirements
- Python 3.8+
- Node.js 18+
- FastAPI, SQLAlchemy, Ultralytics YOLO
- React, TypeScript, Tailwind CSS

---

## Notes
- Database: SQLite (`backend/database.py`).
- For production, configure environment variables like JWT_SECRET in `.env`.
