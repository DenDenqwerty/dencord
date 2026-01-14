import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io, { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';

interface CallParticipant {
  userId: string;
  username: string;
  avatar?: string;
  mediaState: {
    microphone: boolean;
    camera: boolean;
    screenShare: boolean;
    volume: number;
  };
  isSpeaking: boolean;
}

interface CallContextType {
  callState: 'idle' | 'incoming' | 'outgoing' | 'connected';
  callerId: string | null;
  localStream: MediaStream | null;
  remoteStreams: { [userId: string]: MediaStream };
  participants: CallParticipant[];
  initiateCall: (receiverId: string, type: 'voice' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  shareScreen: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within a CallProvider');
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: any) => state.auth.data);
  const [callState, setCallState] = useState<'idle' | 'incoming' | 'outgoing' | 'connected'>('idle');
  const [callerId, setCallerId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [userId: string]: MediaStream }>({});
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<{ [userId: string]: any }>({});

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('register_user', user._id);

    peerRef.current = new Peer(user._id);

    peerRef.current.on('call', (call) => {
      // Auto-answer for mesh networking in channels, but for 1:1 we might want manual
      // For now, let's assume if we are in 'connected' state, we auto-answer (adding to group)
      // If 'idle', it's a new call

      // Simplified: Just answer everything for now to get it working,
      // but in real app we'd check state.
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setLocalStream(stream);
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          setRemoteStreams((prev) => ({ ...prev, [call.peer]: remoteStream }));
        });
      });
    });

    socketRef.current.on('call:incoming', ({ callerId, type }) => {
      setCallerId(callerId);
      setCallState('incoming');
    });

    socketRef.current.on('call:accepted', ({ receiverId }) => {
      setCallState('connected');
      // Initiate peer connection
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setLocalStream(stream);
        const call = peerRef.current?.call(receiverId, stream);
        call?.on('stream', (remoteStream) => {
          setRemoteStreams((prev) => ({ ...prev, [receiverId]: remoteStream }));
        });
        callsRef.current[receiverId] = call;
      });
    });

    socketRef.current.on('call:rejected', () => {
      setCallState('idle');
      setCallerId(null);
      alert('Call rejected');
    });

    return () => {
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [user, localStream]);

  const initiateCall = (receiverId: string, type: 'voice' | 'video') => {
    setCallState('outgoing');
    socketRef.current?.emit('call:initiate', { callerId: user._id, receiverId, type });
  };

  const acceptCall = () => {
    if (!callerId) return;
    setCallState('connected');
    socketRef.current?.emit('call:accept', { callerId, receiverId: user._id });
  };

  const rejectCall = () => {
    if (!callerId) return;
    setCallState('idle');
    socketRef.current?.emit('call:reject', { callerId });
    setCallerId(null);
  };

  const leaveCall = () => {
    setCallState('idle');
    setCallerId(null);
    setRemoteStreams({});
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    Object.values(callsRef.current).forEach((call: any) => call.close());
    callsRef.current = {};
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const shareScreen = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (localStream) {
            // Replace video track in all active calls
            Object.values(callsRef.current).forEach((call: any) => {
                const sender = call.peerConnection.getSenders().find((s: any) => s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(screenTrack);
                }
            });
            
            screenTrack.onended = () => {
                stopScreenShare();
            };

            setIsScreenSharing(true);
        }
      } catch (err) {
        console.error("Failed to share screen", err);
      }
    } else {
        stopScreenShare();
    }
  };

  const stopScreenShare = () => {
      if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          Object.values(callsRef.current).forEach((call: any) => {
              const sender = call.peerConnection.getSenders().find((s: any) => s.track.kind === 'video');
              if (sender) {
                  sender.replaceTrack(videoTrack);
              }
          });
          setIsScreenSharing(false);
      }
  };

  return (
    <CallContext.Provider value={{
      callState,
      callerId,
      localStream,
      remoteStreams,
      participants,
      initiateCall,
      acceptCall,
      rejectCall,
      leaveCall,
      toggleAudio,
      toggleVideo,
      shareScreen,
      isAudioEnabled,
      isVideoEnabled,
      isScreenSharing
    }}>
      {children}
    </CallContext.Provider>
  );
};
