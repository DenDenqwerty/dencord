import React from 'react';
import { useSelector } from 'react-redux';

const UserList: React.FC = () => {
  const currentServer = useSelector((state: any) => state.channels.currentServer);

  if (!currentServer) return null;

  // Mock online status for now, in real app we would use socket events
  const members = currentServer.members || [];

  return (
    <div className="w-60 bg-gray-800 h-screen flex flex-col p-4 overflow-y-auto">
      <h3 className="text-gray-400 font-bold text-xs uppercase mb-4">Members</h3>
      {members.map((member: any) => (
        <div key={member} className="flex items-center mb-4 cursor-pointer hover:bg-gray-700 p-2 rounded">
          <div className="w-8 h-8 bg-gray-600 rounded-full mr-3"></div>
          <span className="text-gray-300 font-medium">User {member.substring(0, 5)}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
