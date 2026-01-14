import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import ServerSidebar from '../components/ServerSidebar';
import ChatArea from '../components/ChatArea';
import VoiceChannel from '../components/VoiceChannel';
import UserList from '../components/UserList';
import FriendsView from '../components/FriendsView';
import { fetchServerDetails } from '../store/slices/channel';
import { AppDispatch } from '../store/store';

const Home: React.FC = () => {
  const { serverId, channelId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const currentServer = useSelector((state: any) => state.channels.currentServer);

  useEffect(() => {
    if (serverId) {
      dispatch(fetchServerDetails(serverId));
    }
  }, [serverId, dispatch]);

  const currentChannel = currentServer?.channels.find((c: any) => c._id === channelId);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {!serverId ? (
        <FriendsView />
      ) : (
        <>
          <ServerSidebar />
          {channelId ? (
            currentChannel?.type === 'voice' ? <VoiceChannel /> : <ChatArea />
          ) : (
            <div className="flex-1 bg-gray-700 flex items-center justify-center text-gray-400">
              Select a channel
            </div>
          )}
          <UserList />
        </>
      )}
    </div>
  );
};

export default Home;
