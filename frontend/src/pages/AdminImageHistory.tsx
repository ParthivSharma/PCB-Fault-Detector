import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

interface ImageRecord {
  id: number;
  original_filename: string;
  original_image_url: string;
  annotated_image_url: string;
  uploaded_by: number;
  uploaded_at: string;
}

const AdminImageHistory: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [images, setImages] = useState<ImageRecord[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch("http://localhost:8000/admin/uploaded_images", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setImages(data);
    };

    if (token) fetchImages();
  }, [token]);

  const formatToIST = (utcDate: string) => {
    return new Date(utcDate).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-6">Uploaded Images History</h1>
      
      {images.map(image => (
        <div key={image.id} className="bg-slate-800 p-4 rounded shadow border border-slate-700 space-y-2">
          <p><strong>Filename:</strong> {image.original_filename}</p>
          <p><strong>Uploaded By User ID:</strong> {image.uploaded_by}</p>
          <p><strong>Uploaded At:</strong> {formatToIST(image.uploaded_at)}</p>
          <div className="flex gap-4">
            <div>
              <p className="text-slate-400 text-sm">Original Image:</p>
              <img src={`http://localhost:8000${image.original_image_url}`} alt="Original" className="w-40 border border-slate-600"/>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Annotated Image:</p>
              <img src={`http://localhost:8000${image.annotated_image_url}`} alt="Annotated" className="w-40 border border-slate-600"/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminImageHistory;
