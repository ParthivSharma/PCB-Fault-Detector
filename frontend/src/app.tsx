import { useState } from "react";
import { Upload, Zap, AlertTriangle } from "lucide-react";
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

const App = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<
    { label: string; confidence: number }[] | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedFile(file);
    setImagePreview(previewUrl);
    setDetectionResults(null);
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
            <p className="text-slate-400 mt-1">
              Powered by YOLOv8 & FastAPI
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex justify-center px-4 py-8 min-h-[calc(100vh-96px)]">
        <div className="grid lg:grid-cols-2 gap-8 w-full max-w-6xl">
          {/* Upload Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload PCB Image
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload an image of your PCB to detect potential faults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageUpload={handleImageUpload} />

              {imagePreview && (
                <div className="mt-6">
                  <img
                    src={imagePreview}
                    alt="Uploaded Preview"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "contain",
                      borderRadius: "6px",
                      border: "1px solid #475569",
                      display: "block",
                      margin: "0 auto 1rem",
                    }}
                  />

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze PCB"}
                  </Button>
                </div>
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
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default App;
