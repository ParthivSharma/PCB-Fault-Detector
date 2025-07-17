import { useEffect, useState } from "react";
import { Upload, Zap, AlertTriangle, Camera, LogOut } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

const Dashboard = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<Detection[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const [mode, setMode] = useState<"upload" | "live">("upload");
  const [isFaulty, setIsFaulty] = useState<boolean | undefined>(undefined);
  const [missingComponents, setMissingComponents] = useState<string[]>([]);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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

  const switchMode = (newMode: "upload" | "live") => {
    setMode(newMode);
    setUploadedFile(null);
    setImagePreview(null);
    setDetectionResults(null);
    setImageDims(null);
    setIsFaulty(undefined);
    setMissingComponents([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white flex-col space-y-4">
        <h1 className="text-3xl font-bold">Welcome to PCB Fault Detector</h1>
        <div className="space-x-4">
          <Button onClick={() => navigate("/login")}>Login as User</Button>
          <Button onClick={() => navigate("/login?admin=true")}>Login as Admin</Button>
          <Button onClick={() => navigate("/register")} className="bg-green-600 hover:bg-green-700">
            Register New User
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="w-full px-4 py-6 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">PCB Fault Detection System</h1>
          </div>

          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="flex flex-col items-center px-4 py-8 min-h-[calc(100vh-96px)]">
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={mode === "upload" ? "default" : "outline"}
            onClick={() => switchMode("upload")}
          >
            Upload Mode
          </Button>
          <Button
            variant={mode === "live" ? "default" : "outline"}
            onClick={() => switchMode("live")}
          >
            Live Camera Mode
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 w-full max-w-6xl">
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
                        {isAnalyzing ? "Analyzing..." : "Analyze PCB"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <CameraCapture
                  onResults={(results, previewUrl, dims, isFaultyResult, missing) => {
                    setDetectionResults(results);
                    setImagePreview(previewUrl);
                    setImageDims(dims);
                    setIsFaulty(isFaultyResult);
                    setMissingComponents(missing);
                  }}
                />
              )}
            </CardContent>
          </Card>

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
              {detectionResults ? (
                <DetectionResults
                  results={detectionResults}
                  isAnalyzing={isAnalyzing}
                  imageUrl={imagePreview}
                  originalWidth={imageDims?.width}
                  originalHeight={imageDims?.height}
                  isFaulty={isFaulty}
                  missingComponents={missingComponents}
                  mode={mode}
                />
              ) : (
                <div className="text-slate-400 text-center py-10">
                  {mode === "upload" ? (
                    <>No detection results yet. Upload a PCB image and click <strong>Analyze PCB</strong> to see results.</>
                  ) : (
                    <>No detection results yet. Point your camera at a PCB to start detecting.</>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="text-center text-sm text-slate-500 pb-4">
        Powered by <span className="text-yellow-400">YOLOv8</span> & <span className="text-blue-400">FastAPI</span>
      </footer>
    </div>
  );
};

export default Dashboard;
