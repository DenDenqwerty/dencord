import React, { useState, useEffect } from 'react';
import { useCall } from '../context/CallContext';

interface CallControlsProps {
  onVolumeMixer?: () => void;
  onLeave: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({ onVolumeMixer, onLeave }) => {
  const {
    callState,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    shareScreen,
    acceptCall,
    rejectCall,
    initiateCall
  } = useCall();

  const [isPushToTalk, setIsPushToTalk] = useState(false);
  const [pushToTalkKey, setPushToTalkKey] = useState('Space');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPushToTalk && e.code === pushToTalkKey) {
        toggleAudio();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPushToTalk && e.code === pushToTalkKey) {
        toggleAudio();
      }
    };

    if (isPushToTalk) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPushToTalk, pushToTalkKey, toggleAudio]);

  const handleAccept = () => {
    acceptCall();
  };

  const handleReject = () => {
    rejectCall();
  };


  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-gray-900 rounded-lg">
      {callState === 'incoming' ? (
        <>
          <button
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2"
          >
            <span>📞</span>
            <span>Принять</span>
          </button>
          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2"
          >
            <span>📞</span>
            <span>Отклонить</span>
          </button>
        </>
      ) : callState === 'outgoing' ? (
        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2"
        >
          <span>📞</span>
          <span>Отменить</span>
        </button>
      ) : callState === 'connected' ? (
        <>
          {/* Microphone Control */}
          <button
            onClick={toggleAudio}
            className={`px-4 py-3 rounded-full transition-colors flex items-center space-x-2 ${
              !isAudioEnabled
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isAudioEnabled ? 'Отключить микрофон' : 'Включить микрофон'}
          >
            <span>{isAudioEnabled ? '🎤' : '🔇'}</span>
          </button>

          {/* Camera Control */}
          <button
            onClick={toggleVideo}
            className={`px-4 py-3 rounded-full transition-colors flex items-center space-x-2 ${
              !isVideoEnabled
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isVideoEnabled ? 'Выключить камеру' : 'Включить камеру'}
          >
            <span>{isVideoEnabled ? '📹' : '📷'}</span>
          </button>

          {/* Screen Share Control */}
          <button
            onClick={shareScreen}
            className={`px-4 py-3 rounded-full transition-colors flex items-center space-x-2 ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isScreenSharing ? 'Остановить демонстрацию' : 'Демонстрировать экран'}
          >
            <span>{isScreenSharing ? '🖥️' : '💻'}</span>
          </button>

          {/* Push-to-Talk Toggle */}
          <button
            onClick={() => setIsPushToTalk(!isPushToTalk)}
            className={`px-4 py-3 rounded-full transition-colors flex items-center space-x-2 ${
              isPushToTalk
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isPushToTalk ? 'Отключить Push-to-Talk' : 'Включить Push-to-Talk'}
          >
            <span>{isPushToTalk ? '🎙️' : '🔇'}</span>
          </button>

          {/* Leave Call */}
          <button
            onClick={onLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors flex items-center space-x-2"
            title="Покинуть звонок"
          >
            <span>📞</span>
            <span>Покинуть</span>
          </button>
        </>
      ) : null}
    </div>
  );
};

export default CallControls;