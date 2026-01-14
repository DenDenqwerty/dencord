import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useCall } from '../context/CallContext';

interface Participant {
  id: string;
  name: string;
  avatar?: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream | null;
  volume: number;
  isLocal: boolean;
}

const ParticipantGrid: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.data);
  const { localStream, remoteStreams, isAudioEnabled, isVideoEnabled, isScreenSharing } = useCall();

  const participants = useMemo(() => {
    const localParticipant: Participant = {
      id: currentUser?._id || '',
      name: currentUser?.username || 'You',
      avatar: currentUser?.avatar,
      stream: localStream,
      isLocal: true,
      isMuted: !isAudioEnabled,
      isCameraOff: !isVideoEnabled,
      isScreenSharing: isScreenSharing,
      volume: 1,
    };

    const remoteParticipants: Participant[] = Object.entries(remoteStreams).map(([userId, stream]) => ({
      id: userId,
      name: `User ${userId.slice(-4)}`, // Placeholder, in real app get from server
      avatar: null,
      stream,
      isLocal: false,
      isMuted: false, // TODO: get from server
      isCameraOff: false, // TODO: get from server
      isScreenSharing: false, // TODO: get from server
      volume: 1,
    }));

    return [localParticipant, ...remoteParticipants];
  }, [currentUser, localStream, remoteStreams, isAudioEnabled, isVideoEnabled, isScreenSharing]);

  const handleToggleMute = (participantId: string) => {
    // TODO: emit to server
    console.log('Toggle mute for', participantId);
  };

  const handleToggleCamera = (participantId: string) => {
    // TODO: emit to server
    console.log('Toggle camera for', participantId);
  };

  const handleRemoveParticipant = (participantId: string) => {
    // TODO: emit to server
    console.log('Remove participant', participantId);
  };

  const handleAdjustVolume = (participantId: string, volume: number) => {
    // TODO: implement volume adjustment
    console.log('Adjust volume for', participantId, volume);
  };

  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className={`grid ${getGridClass(participants.length)} gap-4 p-4 h-full overflow-auto`}>
      {participants.map((participant) => (
        <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
          {/* Video or Avatar */}
          <div className="aspect-video bg-gray-700 flex items-center justify-center">
            {participant.stream && !participant.isCameraOff ? (
              <video
                ref={(video) => {
                  if (video && participant.stream) {
                    video.srcObject = participant.stream;
                    video.play().catch(console.error);
                  }
                }}
                className="w-full h-full object-cover"
                muted={participant.id === currentUser?._id}
              />
            ) : (
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                {participant.avatar ? (
                  <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium truncate">
                {participant.name}
              </span>
              <div className="flex items-center space-x-1">
                {participant.isMuted && (
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔇</span>
                  </div>
                )}
                {participant.isCameraOff && (
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📷</span>
                  </div>
                )}
                {participant.isScreenSharing && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🖥️</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Moderator Controls */}
          {currentUser?._id !== participant.id && (
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={() => handleToggleMute(participant.id)}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center"
                title="Toggle mute"
              >
                <span className="text-white text-xs">
                  {participant.isMuted ? '🔊' : '🔇'}
                </span>
              </button>
              <button
                onClick={() => handleToggleCamera(participant.id)}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center"
                title="Toggle camera"
              >
                <span className="text-white text-xs">
                  {participant.isCameraOff ? '📷' : '📹'}
                </span>
              </button>
              <button
                onClick={() => handleRemoveParticipant(participant.id)}
                className="w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center"
                title="Remove participant"
              >
                <span className="text-white text-xs">❌</span>
              </button>
            </div>
          )}

          {/* Volume Control */}
          <div className="absolute top-2 left-2">
            <input
              type="range"
              min="0"
              max="100"
              value={participant.volume * 100}
              onChange={(e) => handleAdjustVolume(participant.id, parseInt(e.target.value) / 100)}
              className="w-16 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              title="Adjust volume"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantGrid;