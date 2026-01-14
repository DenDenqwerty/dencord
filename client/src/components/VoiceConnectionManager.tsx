import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveVoiceChannel } from '../store/slices/channel';
import { Mic, MicOff, PhoneOff, Monitor } from 'lucide-react';
import { useStream } from '../context/StreamContext';

const socket = io('http://localhost:5000');

const VoiceConnectionManager: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.data);
  const activeVoiceChannel = useSelector((state: any) => state.channels.activeVoiceChannel);
  const { addStream, removeStream, setLocalStream } = useStream();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const myPeer = useRef<Peer | null>(null);
  const myStream = useRef<MediaStream | null>(null);
  const peersRef = useRef<any>({});

  useEffect(() => {
    if (!activeVoiceChannel || !user) return;

    myPeer.current = new Peer(user._id);

    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
      myStream.current = stream;
      setLocalStream(stream);

      myPeer.current?.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (userVideoStream) => {
          addStream(call.peer, userVideoStream);
        });
        call.on('close', () => {
            removeStream(call.peer);
        });
      });

      socket.emit('join_voice', activeVoiceChannel, user._id);

      socket.on('user_connected', (userId) => {
        connectToNewUser(userId, stream);
      });
    });

    socket.on('user_disconnected', (userId) => {
      if (peersRef.current[userId]) peersRef.current[userId].close();
      removeStream(userId);
    });

    return () => {
      socket.emit('leave_voice', activeVoiceChannel, user._id);
      socket.off('user_connected');
      socket.off('user_disconnected');
      myPeer.current?.destroy();
      if (myStream.current) {
        myStream.current.getTracks().forEach(track => track.stop());
      }
      setLocalStream(null);
    };
  }, [activeVoiceChannel, user]);

  const connectToNewUser = (userId: string, stream: MediaStream) => {
    const call = myPeer.current?.call(userId, stream);
    call?.on('stream', (userVideoStream) => {
       addStream(userId, userVideoStream);
    });
    call?.on('close', () => {
        removeStream(userId);
    });
    peersRef.current[userId] = call;
  };

  const toggleMute = () => {
    if (myStream.current) {
      const audioTrack = myStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const shareScreen = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (myStream.current) {
            Object.values(peersRef.current).forEach((call: any) => {
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
      if (myStream.current) {
          const videoTrack = myStream.current.getVideoTracks()[0];
          Object.values(peersRef.current).forEach((call: any) => {
              const sender = call.peerConnection.getSenders().find((s: any) => s.track.kind === 'video');
              if (sender) {
                  sender.replaceTrack(videoTrack);
              }
          });
          setIsScreenSharing(false);
      }
  };

  const handleDisconnect = () => {
    dispatch(setActiveVoiceChannel(null));
  };

  if (!activeVoiceChannel) return null;

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-2 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-600 rounded-full mr-2 overflow-hidden">
             {user?.avatarUrl && <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />}
        </div>
        <div className="text-sm">
          <div className="font-bold text-white">{user?.username}</div>
          <div className="text-xs text-green-400">Voice Connected</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={toggleMute} className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button onClick={shareScreen} className={`p-2 hover:bg-gray-700 rounded ${isScreenSharing ? 'text-green-500' : 'text-gray-400'} hover:text-white`}>
          <Monitor size={20} />
        </button>
        <button onClick={handleDisconnect} className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};

export default VoiceConnectionManager;
