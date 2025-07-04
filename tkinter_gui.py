import tkinter as tk
from tkinter import filedialog, Label, Button
from PIL import Image, ImageTk
import requests
import io

BACKEND_URL = "http://127.0.0.1:8000/predict/"

class PCBApp:
    def __init__(self, root):
        self.root = root
        self.root.title("PCB Fault Detection GUI")
        self.root.geometry("900x700")
        self.root.configure(bg="#f0f0f0")

        self.title_label = Label(root, text="PCB Fault Detection", font=("Arial", 24), bg="#f0f0f0")
        self.title_label.pack(pady=20)

        self.upload_btn = Button(root, text="Upload Image", command=self.upload_image)
        self.upload_btn.pack(pady=10)

        self.image_label = Label(root)
        self.image_label.pack(pady=10)

        self.result_label = Label(root, text="", font=("Arial", 14), bg="#f0f0f0")
        self.result_label.pack(pady=10)

        self.annotated_label = Label(root)
        self.annotated_label.pack(pady=10)

        self.exit_btn = Button(root, text="Exit", command=root.quit)
        self.exit_btn.pack(pady=20)

        self.image_path = None

    def upload_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image Files", "*.jpg *.jpeg *.png")])
        if file_path:
            self.image_path = file_path
            img = Image.open(file_path).resize((300, 300))
            img = ImageTk.PhotoImage(img)
            self.image_label.configure(image=img)
            self.image_label.image = img
            self.result_label.config(text="")
            self.send_to_backend()

    def send_to_backend(self):
        with open(self.image_path, "rb") as img_file:
            files = {"file": img_file}
            response = requests.post(BACKEND_URL, files=files)

        if response.status_code == 200:
            data = response.json()
            result = data["result"]
            self.result_label.config(text=f"Detection Result: {result}")

            # Load annotated image from server path
            image_path = data["annotated_image"]
            if os.path.exists(image_path):
                ann_img = Image.open(image_path).resize((300, 300))
                ann_img = ImageTk.PhotoImage(ann_img)
                self.annotated_label.configure(image=ann_img)
                self.annotated_label.image = ann_img
        else:
            self.result_label.config(text="Error in detection", fg="red")

if __name__ == "__main__":
    import os
    root = tk.Tk()
    app = PCBApp(root)
    root.mainloop()
