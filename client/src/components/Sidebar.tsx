import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServers, createServer } from '../store/slices/server';
import { AppDispatch } from '../store/store';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Settings } from 'lucide-react';
import { logout } from '../store/slices/auth';
import UserSettings from './UserSettings';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const servers = useSelector((state: any) => state.servers.servers);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = React.useState(false);

  useEffect(() => {
    dispatch(fetchServers());
  }, [dispatch]);

  const handleCreateServer = () => {
    const name = prompt('Enter server name');
    if (name) {
      dispatch(createServer(name));
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      window.localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="w-16 bg-gray-900 h-screen flex flex-col items-center py-4 space-y-4 overflow-y-auto">
      <div
        onClick={() => navigate('/')}
        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-600 hover:rounded-xl transition-all duration-200 text-white font-bold mb-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
      </div>
      <div className="w-8 h-0.5 bg-gray-700 rounded-full mb-2"></div>
      {servers.map((server: any) => (
        <div
          key={server._id}
          onClick={() => navigate(`/channels/${server._id}`)}
          className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:rounded-xl transition-all duration-200 text-white font-bold"
        >
          {server.name.substring(0, 2).toUpperCase()}
        </div>
      ))}
      <div
        onClick={handleCreateServer}
        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-all duration-200 text-green-500 hover:text-white"
      >
        <Plus size={24} />
      </div>
      <div className="flex-1"></div>
      <div
        onClick={() => setShowSettings(true)}
        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-all duration-200 text-gray-400 hover:text-white mb-2"
      >
        <Settings size={24} />
      </div>
      <div
        onClick={handleLogout}
        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-all duration-200 text-red-500 hover:text-white mb-4"
      >
        <LogOut size={24} />
      </div>
      {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default Sidebar;
