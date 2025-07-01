# PCB Fault Detector

This project detects manufacturing faults in PCB (Printed Circuit Boards) using a YOLOv8-based deep learning model.

## Features
- Detects faults such as missing holes, short circuits, open circuits, etc.
- Trained with Ultralytics YOLOv8
- Python backend using FastAPI
- Prediction results shown using a test image input

## How to Run

```bash
pip install -r requirements.txt
python app.py
