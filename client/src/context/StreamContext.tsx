import React, { createContext, useContext, useState } from 'react';

interface StreamContextType {
  streams: { [userId: string]: MediaStream };
  addStream: (userId: string, stream: MediaStream) => void;
  removeStream: (userId: string) => void;
  localStream: MediaStream | null;
  setLocalStream: (stream: MediaStream | null) => void;
}

const StreamContext = createContext<StreamContextType | null>(null);

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
};

export const StreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [streams, setStreams] = useState<{ [userId: string]: MediaStream }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const addStream = (userId: string, stream: MediaStream) => {
    setStreams(prev => ({ ...prev, [userId]: stream }));
  };

  const removeStream = (userId: string) => {
    setStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[userId];
      return newStreams;
    });
  };

  return (
    <StreamContext.Provider value={{ streams, addStream, removeStream, localStream, setLocalStream }}>
      {children}
    </StreamContext.Provider>
  );
};
