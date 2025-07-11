import { useState } from "react";
import { Upload, Zap, AlertTriangle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import DetectionResults from "@/components/DetectionResults";
import CameraCapture from "@/components/CameraCapture";

interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

const App = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<Detection[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [mode, setMode] = useState<"upload" | "live">("upload");

  const [isFaulty, setIsFaulty] = useState<boolean | undefined>(undefined);
  const [missingComponents, setMissingComponents] = useState<string[]>([]);

  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedFile(file);
    setImagePreview(previewUrl);
    setDetectionResults(null);
    setImageDims(null);
    setIsFaulty(undefined);
    setMissingComponents([]);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setDetectionResults(result.results);
      setIsFaulty(result.is_faulty);
      setMissingComponents(result.missing_components || []);
      setImageDims({
        width: result.original_width,
        height: result.original_height,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="w-full px-4 py-6 flex justify-center">
          <div className="flex flex-col items-center text-center max-w-screen-md">
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 rounded-lg bg-blue-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                PCB Fault Detection System
              </h1>
            </div>

            {/* Mode Switcher */}
            <div className="mt-4 flex gap-4">
              <Button
                variant={mode === "upload" ? "default" : "outline"}
                onClick={() => setMode("upload")}
              >
                <Upload className="w-4 h-4 mr-1" /> Upload Image
              </Button>
              <Button
                variant={mode === "live" ? "default" : "outline"}
                onClick={() => setMode("live")}
              >
                <Camera className="w-4 h-4 mr-1" /> Live Detection
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex justify-center px-4 py-8 min-h-[calc(100vh-96px)]">
        <div className="grid lg:grid-cols-2 gap-8 w-full max-w-6xl">
          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {mode === "upload" ? <Upload className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                {mode === "upload" ? "Upload PCB Image" : "Live Camera Detection"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {mode === "upload"
                  ? "Upload an image of your PCB to detect potential faults"
                  : "Point your camera at a PCB to detect faults in real time"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 pb-10 px-4">
              {mode === "upload" ? (
                <>
                  <ImageUpload onImageUpload={handleImageUpload} />
                  {imagePreview && (
                    <div className="mt-6 space-y-6">
                      <div className="flex justify-center">
                        <img
                          src={imagePreview}
                          alt="Uploaded preview"
                          style={{ width: "120px", height: "auto" }}
                          className="rounded shadow border border-slate-700"
                        />
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        {isAnalyzing && (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                        )}
                        {isAnalyzing ? "Analyzing..." : "Analyze PCB"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <CameraCapture
                  onResults={(results, previewUrl, dims) => {
                    setDetectionResults(results);
                    setImagePreview(previewUrl);
                    setImageDims(dims);
                    setIsFaulty(undefined);
                    setMissingComponents([]);
                  }}
                  isAnalyzing={isAnalyzing}
                  setIsAnalyzing={setIsAnalyzing}
                />
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Detection Results
              </CardTitle>
              <CardDescription className="text-slate-400">
                Fault detection results and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DetectionResults
                results={detectionResults}
                isAnalyzing={isAnalyzing}
                imageUrl={imagePreview}
                originalWidth={imageDims?.width}
                originalHeight={imageDims?.height}
                isFaulty={isFaulty}
                missingComponents={missingComponents}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-slate-500 pb-4">
        Powered by <span className="text-yellow-400">YOLOv8</span> &{" "}
        <span className="text-blue-400">FastAPI</span>
      </footer>
    </div>
  );
};

export default App;
