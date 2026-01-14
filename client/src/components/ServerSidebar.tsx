import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createChannel } from '../store/slices/channel';
import { AppDispatch } from '../store/store';
import { Hash, Volume2, Plus } from 'lucide-react';
import io from 'socket.io-client';
import { setActiveVoiceChannel } from '../store/slices/channel';
import VoiceConnectionManager from './VoiceConnectionManager';

const socket = io('http://localhost:5000');

const ServerSidebar: React.FC = () => {
  const { serverId, channelId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentServer = useSelector((state: any) => state.channels.currentServer);
  const [voiceUsers, setVoiceUsers] = React.useState<{[channelId: string]: any[]}>({});

  React.useEffect(() => {
    socket.emit('get_voice_states');

    socket.on('voice_states', (states) => {
        setVoiceUsers(states);
    });

    socket.on('voice_status_update', ({ channelId, users }) => {
      setVoiceUsers(prev => ({ ...prev, [channelId]: users }));
    });

    return () => {
      socket.off('voice_states');
      socket.off('voice_status_update');
    };
  }, []);

  const handleCreateChannel = (type: 'text' | 'voice') => {
    const name = prompt('Enter channel name');
    if (name) {
      dispatch(createChannel({ name, type, serverId: serverId! }));
    }
  };

  if (!currentServer) return <div className="w-60 bg-gray-800 h-screen"></div>;

  return (
    <div className="w-60 bg-gray-800 h-screen flex flex-col text-gray-400">
      <div className="h-12 shadow-md flex items-center px-4 font-bold text-white border-b border-gray-900">
        {currentServer.name}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="flex items-center justify-between px-2 hover:text-gray-200 cursor-pointer">
          <span className="uppercase text-xs font-bold">Text Channels</span>
          <Plus size={14} onClick={() => handleCreateChannel('text')} className="hover:text-white" />
        </div>
        {currentServer.channels.filter((c: any) => c.type === 'text').map((channel: any) => (
          <div
            key={channel._id}
            onClick={() => navigate(`/channels/${serverId}/${channel._id}`)}
            className={`flex items-center px-2 py-1 rounded cursor-pointer ${channelId === channel._id ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 hover:text-gray-200'}`}
          >
            <Hash size={18} className="mr-2 text-gray-500" />
            {channel.name}
          </div>
        ))}

        <div className="flex items-center justify-between px-2 hover:text-gray-200 cursor-pointer mt-4">
          <span className="uppercase text-xs font-bold">Voice Channels</span>
          <Plus size={14} onClick={() => handleCreateChannel('voice')} className="hover:text-white" />
        </div>
        {currentServer.channels.filter((c: any) => c.type === 'voice').map((channel: any) => (
          <div key={channel._id}>
            <div
              onClick={() => dispatch(setActiveVoiceChannel(channel._id))}
              className={`flex items-center px-2 py-1 rounded cursor-pointer ${channelId === channel._id ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 hover:text-gray-200'}`}
            >
              <Volume2 size={18} className="mr-2 text-gray-500" />
              {channel.name}
            </div>
            {voiceUsers[channel._id] && voiceUsers[channel._id].map((user: any) => (
              <div key={user._id} className="flex items-center ml-8 mt-1 mb-1 text-sm text-gray-400">
                <div className="w-5 h-5 bg-gray-600 rounded-full mr-2 overflow-hidden">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" /> : null}
                </div>
                <span>{user.username}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <VoiceConnectionManager />
    </div>
  );
};

export default ServerSidebar;
