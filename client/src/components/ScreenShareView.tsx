import React, { useRef, useEffect, useState } from 'react';

interface ScreenShareViewProps {
  stream: MediaStream | null;
  isSharing: boolean;
  onStopShare: () => void;
  participantName?: string;
}

const ScreenShareView: React.FC<ScreenShareViewProps> = ({
  stream,
  isSharing,
  onStopShare,
  participantName = 'Screen Share'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStopShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onStopShare();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isSharing || !stream) {
    return null;
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Video element for screen share */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
        style={{ display: drawingEnabled ? 'none' : 'block' }}
      />

      {/* Canvas for annotations */}
      {drawingEnabled && (
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: drawingEnabled ? 'auto' : 'none'
          }}
        />
      )}

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {participantName}
        </div>

        <div className="flex items-center space-x-2">
          {/* Drawing toggle */}
          <button
            onClick={() => setDrawingEnabled(!drawingEnabled)}
            className={`px-3 py-1 rounded text-sm ${
              drawingEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
            title="Toggle drawing mode"
          >
            ✏️ Draw
          </button>

          {/* Clear annotations */}
          {drawingEnabled && (
            <button
              onClick={clearAnnotations}
              className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-500"
              title="Clear annotations"
            >
              🗑️ Clear
            </button>
          )}

          {/* Stop sharing */}
          <button
            onClick={handleStopShare}
            className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-500"
            title="Stop screen share"
          >
            ⏹️ Stop
          </button>
        </div>
      </div>

      {/* Drawing tools */}
      {drawingEnabled && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm">Color:</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm">Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16"
              />
              <span className="text-sm w-6">{brushSize}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {drawingEnabled && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded max-w-xs">
          <p className="text-sm">
            Click and drag to draw annotations on the screen share.
            Use the tools below to change color and brush size.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScreenShareView;