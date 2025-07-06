import React, { useRef } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUpload: (file: File, previewUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageUpload(file, previewUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto mt-12 space-y-4">
      <div
        onClick={handleClick}
        className="cursor-pointer border-2 border-dashed border-slate-600 bg-slate-800/40 hover:bg-slate-800 transition-all duration-200 text-slate-300 rounded-xl p-6 w-full flex flex-col items-center justify-center"
      >
        <Upload className="w-8 h-8 mb-2 text-blue-500" />
        <p className="text-sm">Click to upload a PCB image</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
      <p className="text-xs text-slate-500">
        Supported formats: JPG, PNG, JPEG
      </p>
    </div>
  );
};

export default ImageUpload;
