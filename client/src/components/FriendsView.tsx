import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFriends, fetchFriendRequests, sendFriendRequest, respondToRequest } from '../store/slices/friends';
import { AppDispatch } from '../store/store';
import { useCall } from '../context/CallContext';

const FriendsView: React.FC = () => {
  const { initiateCall } = useCall();
  const dispatch = useDispatch<AppDispatch>();
  const { friends, requests } = useSelector((state: any) => state.friends);
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending' | 'add'>('online');
  const [addUsername, setAddUsername] = useState('');
  const [addStatus, setAddStatus] = useState('');

  useEffect(() => {
    dispatch(fetchFriends());
    dispatch(fetchFriendRequests());
  }, [dispatch]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(sendFriendRequest(addUsername)).unwrap();
      setAddStatus('Friend request sent!');
      setAddUsername('');
    } catch (err: any) {
      setAddStatus(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleRespond = (requestId: string, status: 'accepted' | 'rejected') => {
    dispatch(respondToRequest({ requestId, status }));
  };

  return (
    <div className="flex-1 bg-gray-700 flex flex-col">
      {/* Top Bar */}
      <div className="h-12 border-b border-gray-900 flex items-center px-4 space-x-4 shadow-sm">
        <div className="flex items-center space-x-2 text-gray-400 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span className="font-bold text-white">Friends</span>
        </div>
        <div className="h-6 w-px bg-gray-600 mx-2"></div>
        <button onClick={() => setActiveTab('online')} className={`px-2 py-1 rounded hover:bg-gray-600 ${activeTab === 'online' ? 'text-white bg-gray-600' : 'text-gray-400'}`}>Online</button>
        <button onClick={() => setActiveTab('all')} className={`px-2 py-1 rounded hover:bg-gray-600 ${activeTab === 'all' ? 'text-white bg-gray-600' : 'text-gray-400'}`}>All</button>
        <button onClick={() => setActiveTab('pending')} className={`px-2 py-1 rounded hover:bg-gray-600 ${activeTab === 'pending' ? 'text-white bg-gray-600' : 'text-gray-400'}`}>Pending <span className="bg-red-500 text-white text-xs px-1 rounded-full">{requests.length}</span></button>
        <button onClick={() => setActiveTab('add')} className={`px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 ${activeTab === 'add' ? 'bg-transparent text-green-500' : ''}`}>Add Friend</button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'add' && (
          <div className="max-w-lg">
            <h2 className="text-white text-lg font-bold mb-2">ADD FRIEND</h2>
            <p className="text-gray-400 text-sm mb-4">You can add a friend with their username.</p>
            <form onSubmit={handleSendRequest} className="relative">
              <input
                type="text"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                placeholder="Enter a Username"
                className="w-full bg-gray-900 text-white p-3 rounded border border-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <button type="submit" className="absolute right-2 top-2 bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600">Send Friend Request</button>
            </form>
            {addStatus && <p className={`mt-2 text-sm ${addStatus.includes('sent') ? 'text-green-500' : 'text-red-500'}`}>{addStatus}</p>}
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            <h2 className="text-gray-400 font-bold text-xs mb-4 uppercase">Pending Requests — {requests.length}</h2>
            {requests.map((req: any) => (
              <div key={req._id} className="flex items-center justify-between p-3 hover:bg-gray-600 rounded border-t border-gray-600">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-500 rounded-full mr-3"></div>
                  <span className="text-white font-bold">{req.sender.username}</span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleRespond(req._id, 'accepted')} className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-green-500 hover:text-green-400">✓</button>
                  <button onClick={() => handleRespond(req._id, 'rejected')} className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-red-500 hover:text-red-400">✕</button>
                </div>
              </div>
            ))}
            {requests.length === 0 && <div className="text-gray-500 text-center mt-10">There are no pending friend requests.</div>}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'online') && (
          <div>
            <h2 className="text-gray-400 font-bold text-xs mb-4 uppercase">{activeTab === 'online' ? 'Online' : 'All'} Friends — {friends.length}</h2>
            {friends.map((friend: any) => (
              <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-gray-600 rounded border-t border-gray-600 group">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-500 rounded-full mr-3 relative">
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></div>
                  </div>
                  <div>
                    <div className="text-white font-bold">{friend.username}</div>
                    <div className="text-gray-400 text-xs">Online</div>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => initiateCall(friend._id, 'voice')} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white" title="Voice Call">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </button>
                  <button onClick={() => initiateCall(friend._id, 'video')} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white" title="Video Call">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                  <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white" title="Message">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  </button>
                </div>
              </div>
            ))}
            {friends.length === 0 && <div className="text-gray-500 text-center mt-10">Wumpus is waiting for friends.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsView;
