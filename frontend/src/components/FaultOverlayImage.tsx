import React from "react";

interface FaultOverlayImageProps {
  imageUrl: string;
  originalWidth: number;
  originalHeight: number;
  results: {
    label: string;
    confidence: number;
    bbox: [number, number, number, number]; // x, y, width, height
  }[];
}

const FaultOverlayImage: React.FC<FaultOverlayImageProps> = ({
  imageUrl,
  results,
  originalWidth,
  originalHeight,
}) => {
  return (
    <div className="relative inline-block border border-gray-700 rounded-md overflow-hidden shadow-lg">
      <img src={imageUrl} alt="Detected PCB" className="max-w-full h-auto" />

      {results.map((result, index) => {
        const [x, y, width, height] = result.bbox;

        const top = `${(y / originalHeight) * 100}%`;
        const left = `${(x / originalWidth) * 100}%`;
        const boxWidth = `${(width / originalWidth) * 100}%`;
        const boxHeight = `${(height / originalHeight) * 100}%`;

        return (
          <div
            key={index}
            className="absolute border-2 border-red-500 bg-red-600/10"
            style={{
              top,
              left,
              width: boxWidth,
              height: boxHeight,
              pointerEvents: "none",
            }}
          >
            <div className="absolute -top-5 left-0 bg-red-600 text-white text-xs font-medium px-1 rounded shadow">
              {result.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaultOverlayImage;
