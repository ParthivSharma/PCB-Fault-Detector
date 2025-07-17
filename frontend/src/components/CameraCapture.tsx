import React, { useEffect, useRef, useState } from "react";
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
    dims: { width: number; height: number },
    isFaulty: boolean,
    missingComponents: string[]
  ) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onResults }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const response = await fetch("http://localhost:8000/analyze-frame", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        const previewUrl = URL.createObjectURL(blob);

        onResults(
          result.results,
          previewUrl,
          {
            width: result.original_width,
            height: result.original_height,
          },
          result.is_faulty,
          result.missing_components || []
        );
      } catch (error) {
        console.error("Error during analysis:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }, "image/jpeg");
  };

  const toggleLiveMode = () => {
    if (liveMode) {
      // Stop live detection
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setLiveMode(false);
    } else {
      // Start live detection every 2 seconds
      intervalRef.current = setInterval(() => {
        if (!isAnalyzing) {
          captureAndAnalyze();
        }
      }, 2000);
      setLiveMode(true);
    }
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

      <div className="flex gap-2 w-full max-w-md">
        <Button
          onClick={captureAndAnalyze}
          disabled={isAnalyzing || liveMode}
          className="bg-blue-600 hover:bg-blue-700 flex-1"
        >
          {isAnalyzing ? "Analyzing..." : "Capture PCB & Analyze"}
        </Button>

        <Button
          onClick={toggleLiveMode}
          variant={liveMode ? "destructive" : "default"}
          className="flex-1"
        >
          {liveMode ? "Stop Live Detection" : "Start Live Detection"}
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;
