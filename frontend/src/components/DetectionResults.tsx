import React from "react";

interface DetectionResultsProps {
  results: { label: string; confidence: number }[] | null;
  isAnalyzing: boolean;
   
}

const DetectionResults: React.FC<DetectionResultsProps> = ({
  results,
  isAnalyzing,
}) => {
  if (!results && !isAnalyzing) return null;

  return (
    <div className="space-y-4 mt-4 text-center">
      {isAnalyzing && (
        <p className="text-yellow-600 font-semibold">Analyzing image...</p>
      )}

      {results && results.length > 0 && (
        <div className="mt-3 space-y-1">
          {results.map((result, index) => (
            <p key={index} className="text-sm text-gray-700">
              <span className="font-semibold">{result.label}</span>:{" "}
              {(result.confidence * 100).toFixed(1)}%
            </p>
          ))}
        </div>
      )}

      {!isAnalyzing && results && results.length === 0 && (
        <p className="text-gray-500">No faults detected in the image.</p>
      )}
    </div>
  );
};

export default DetectionResults;
