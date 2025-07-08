import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface CameraCaptureProps {
  onResults: (
    results: Detection[],
    previewUrl: string,
    dims: { width: number; height: number }
  ) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onResults,
  isAnalyzing,
  setIsAnalyzing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start webcam on mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startCamera();
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      setIsAnalyzing(true);

      try {
        const response = await fetch("http://localhost:8000/analyze-frame", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        // Create a preview URL for captured frame
        const previewUrl = URL.createObjectURL(blob);

        onResults(result.results, previewUrl, {
          width: result.original_width,
          height: result.original_height,
        });
      } catch (err) {
        console.error("Error during frame analysis:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, "image/jpeg");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded border border-slate-700 w-full max-w-md"
      />
      <canvas ref={canvasRef} className="hidden" />
      <Button
        onClick={captureAndAnalyze}
        disabled={isAnalyzing}
        className="bg-blue-600 hover:bg-blue-700 w-full"
      >
        {isAnalyzing ? "Analyzing..." : "Capture & Analyze"}
      </Button>
    </div>
  );
};

export default CameraCapture;
