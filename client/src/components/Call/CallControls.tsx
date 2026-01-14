import React from 'react';
import { useCall } from '../../context/CallContext';

const CallControls: React.FC = () => {
  const { 
    leaveCall, 
    toggleAudio, 
    toggleVideo, 
    shareScreen, 
    isAudioEnabled, 
    isVideoEnabled, 
    isScreenSharing 
  } = useCall();

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-gray-900 p-4 rounded-full shadow-lg z-50">
      <button 
        onClick={toggleAudio} 
        className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
      >
        {isAudioEnabled ? '🎤' : '🔇'}
      </button>
      <button 
        onClick={toggleVideo} 
        className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
      >
        {isVideoEnabled ? '📹' : '📷'}
      </button>
      <button 
        onClick={shareScreen} 
        className={`p-4 rounded-full ${isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        🖥️
      </button>
      <button 
        onClick={leaveCall} 
        className="p-4 rounded-full bg-red-600 hover:bg-red-700"
      >
        📞
      </button>
    </div>
  );
};

export default CallControls;
