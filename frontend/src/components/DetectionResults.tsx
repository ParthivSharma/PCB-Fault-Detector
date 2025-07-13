import React from "react";
import FaultOverlayImage from "./FaultOverlayImage";
import { AlertCircle } from "lucide-react";

interface DetectionResult {
  label: string;
  confidence: number;
  bbox?: [number, number, number, number];
}

interface DetectionResultsProps {
  results: DetectionResult[] | null;
  isAnalyzing: boolean;
  imageUrl: string | null;
  originalWidth?: number;
  originalHeight?: number;
  isFaulty?: boolean;
  missingComponents?: string[];
  mode: "upload" | "live";
}

const DetectionResults: React.FC<DetectionResultsProps> = ({
  results,
  isAnalyzing,
  imageUrl,
  originalWidth,
  originalHeight,
  isFaulty,
  missingComponents = [],
  mode,
}) => {
  const getBarColor = (confidence: number) => {
    if (confidence >= 0.75) return "bg-green-500";
    if (confidence >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!isAnalyzing && (!results || results.length === 0)) {
    return (
      <div className="text-slate-400 text-center py-10 flex flex-col items-center space-y-2">
        <AlertCircle className="w-12 h-12 text-slate-500" />
        <p>
          {mode === "upload"
            ? "No detection results yet. Upload an image and click Analyze PCB to see results."
            : "No detection results yet. Point your camera at a PCB to detect faults in real-time."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6 w-full max-w-xl mx-auto text-center">
      {isAnalyzing && (
        <p className="text-yellow-500 font-semibold text-lg animate-pulse">
          Analyzing image...
        </p>
      )}

      {!isAnalyzing && isFaulty && (
        <div className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md border border-red-400 transition-all duration-300">
          ⚠ Faults detected in the PCB!
          {missingComponents.length > 0 && (
            <div className="mt-2 text-sm font-normal text-white text-left">
              Missing Components:
              <ul className="list-disc list-inside mt-1">
                {missingComponents.map((component, index) => (
                  <li key={index}>{component}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!isAnalyzing && isFaulty === false && (
        <div className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md border border-green-400 transition-all duration-300">
          ✅ All components are present. No faults detected.
        </div>
      )}

      {results && results.length > 0 && imageUrl && originalWidth && originalHeight && (
        <div className="flex justify-center">
          <FaultOverlayImage
            imageUrl={imageUrl}
            results={results.filter(
              (r): r is {
                label: string;
                confidence: number;
                bbox: [number, number, number, number];
              } => r.bbox !== undefined
            )}
            originalWidth={originalWidth}
            originalHeight={originalHeight}
          />
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index}>
              <p className="text-base text-white font-medium mb-1">
                <span className="text-blue-400 font-semibold">{result.label}</span>{" "}
                ({(result.confidence * 100).toFixed(1)}%)
              </p>
              <div className="w-full bg-slate-800 rounded-full h-3 group relative">
                <div
                  className={`${getBarColor(result.confidence)} h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${result.confidence * 100}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                    {result.label}: {(result.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetectionResults;
