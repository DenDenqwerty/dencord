import React from 'react';
import { useCall } from '../../context/CallContext';
import CallControls from './CallControls';
import ParticipantGrid from './ParticipantGrid';

const CallModal: React.FC = () => {
  const { callState, callerId, acceptCall, rejectCall } = useCall();

  if (callState === 'idle') return null;

  if (callState === 'incoming') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center">
          <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            👤
          </div>
          <h2 className="text-2xl text-white font-bold mb-2">Incoming Call</h2>
          <p className="text-gray-400 mb-8">User {callerId} is calling you...</p>
          <div className="flex space-x-4 justify-center">
            <button 
              onClick={acceptCall} 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-colors"
            >
              Accept
            </button>
            <button 
              onClick={rejectCall} 
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (callState === 'outgoing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-6 animate-pulse flex items-center justify-center text-5xl">
            📞
          </div>
          <h2 className="text-2xl text-white font-bold">Calling...</h2>
          <button 
            onClick={rejectCall} 
            className="mt-8 bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-full font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 overflow-hidden p-4">
        <ParticipantGrid />
      </div>
      <CallControls />
    </div>
  );
};

export default CallModal;
