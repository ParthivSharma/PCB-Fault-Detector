import { useRef } from "react";
import { Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUpload: (file: File, previewUrl: string) => void;
}

const ImageUpload = ({ onImageUpload }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(file, result); // ✅ Send preview to parent
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDrag}
      className="border-2 border-dashed rounded-lg p-8 text-center border-slate-600 hover:border-slate-500 transition-colors"
    >
      <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
      <p className="text-white mb-2">
        Drag and drop your PCB image here, or click to browse
      </p>
      <p className="text-slate-400 text-sm mb-4">
        Supports JPG, PNG, and other image formats
      </p>
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="border-slate-600 text-white hover:bg-slate-700"
      >
        <Image className="h-4 w-4 mr-2" />
        Browse Files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
