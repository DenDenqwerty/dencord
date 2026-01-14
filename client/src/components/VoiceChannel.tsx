import React from 'react';
import { useStream } from '../context/StreamContext';

const VoiceChannel: React.FC = () => {
  const { streams, localStream } = useStream();

  return (
    <div className="flex-1 bg-gray-800 flex flex-col items-center justify-center text-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-full">
        {localStream && (
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={(video) => {
                if (video) video.srcObject = localStream;
              }}
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">You</div>
          </div>
        )}
        {Object.entries(streams).map(([userId, stream]) => (
          <div key={userId} className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={(video) => {
                if (video) video.srcObject = stream;
              }}
              autoPlay
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">User {userId.slice(0, 4)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceChannel;
