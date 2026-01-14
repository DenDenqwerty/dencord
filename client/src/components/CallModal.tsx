import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '../context/CallContext';
import CallControls from './CallControls';
import ParticipantGrid from './ParticipantGrid';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose }) => {
  const { callState, localStream, remoteStreams, leaveCall, isScreenSharing } = useCall();
  const [callDuration, setCallDuration] = useState(0);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (callState === 'connected') {
      durationRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationRef.current) {
        clearInterval(durationRef.current);
        durationRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || callState === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-white text-lg font-semibold">
              {callState === 'incoming' ? 'Входящий звонок' :
               callState === 'outgoing' ? 'Исходящий звонок' :
               'Звонок'}
            </h2>
            {callState === 'connected' && (
              <span className="text-gray-400 text-sm">
                {formatDuration(callDuration)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-[calc(100vh-200px)]">
          {/* Video/Screen Share Area */}
          <div className="flex-1 p-4">
            <ParticipantGrid />
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-gray-700">
            <CallControls
              onLeave={leaveCall}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CallModal;
