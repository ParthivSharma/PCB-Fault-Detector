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

  const getBarColor = (confidence: number) => {
    if (confidence >= 0.75) return "bg-green-500";
    if (confidence >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6 mt-6 w-full max-w-xl mx-auto text-center">
      {isAnalyzing && (
        <p className="text-yellow-500 font-semibold text-lg animate-pulse">
          Analyzing image...
        </p>
      )}

      {/* 🔴 Fault Alert */}
      {results && results.length > 0 && (
        <div className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md border border-red-400 
                        transition-all duration-300 ease-out opacity-100 translate-y-0 animate-fade-slide">
          ⚠ Faults detected in the PCB!
        </div>
      )}

      {/* ✅ All Clear Alert */}
      {!isAnalyzing && results && results.length === 0 && (
        <div className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md border border-green-400 
                        transition-all duration-300 ease-out opacity-100 translate-y-0 animate-fade-slide">
          ✅ All clear — No faults found. You're good to go!
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index}>
              <p className="text-base text-white font-medium mb-1">
                <span className="text-blue-400 font-semibold">
                  {result.label}
                </span>{" "}
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
