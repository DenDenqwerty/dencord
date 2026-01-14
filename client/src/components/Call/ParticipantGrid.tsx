import React, { useEffect, useRef } from 'react';
import { useCall } from '../../context/CallContext';

const VideoPlayer: React.FC<{ stream: MediaStream; muted?: boolean }> = ({ stream, muted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video 
        ref={videoRef} 
        autoPlay 
        muted={muted} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const ParticipantGrid: React.FC = () => {
  const { localStream, remoteStreams } = useCall();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full h-full">
      {localStream && (
        <div className="aspect-video">
          <VideoPlayer stream={localStream} muted />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">You</div>
        </div>
      )}
      {Object.entries(remoteStreams).map(([userId, stream]) => (
        <div key={userId} className="aspect-video relative">
          <VideoPlayer stream={stream} />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">User {userId.slice(0, 4)}</div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantGrid;
