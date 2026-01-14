import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchMessages, addMessage, updateMessageReaction } from '../store/slices/channel';
import { AppDispatch } from '../store/store';
import axios from '../axios';
import io from 'socket.io-client';
import { Plus } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatArea: React.FC = () => {
  const { channelId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: any) => state.channels.messages);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (channelId) {
      dispatch(fetchMessages(channelId));
      socket.emit('join_channel', channelId);
    }
  }, [channelId, dispatch]);

  useEffect(() => {
    socket.on('receive_message', (message) => {
      if (message.channel === channelId) {
        dispatch(addMessage(message));
      }
    });

    socket.on('message_reaction', (data) => {
      dispatch(updateMessageReaction(data));
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_reaction');
    };
  }, [channelId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await axios.post('/messages', {
        content: input,
        channelId,
      });
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);

      try {
        const { data } = await axios.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        await axios.post('/messages', {
          content: e.target.files[0].name,
          channelId,
          attachments: [data.url],
        });
      } catch (err) {
        console.error(err);
        alert('Failed to upload file');
      }
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await axios.post('/messages/reaction', { messageId, emoji });
      setShowEmojiPicker(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!channelId) return <div className="flex-1 bg-gray-700 flex items-center justify-center text-gray-400">Select a channel</div>;

  return (
    <div className="flex-1 bg-gray-700 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: any) => (
          <div key={msg._id} className="flex items-start space-x-4 group relative hover:bg-gray-800 p-2 rounded">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-white">{msg.author.username}</span>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-gray-300">{msg.content}</p>
              {msg.attachments && msg.attachments.map((url: string, idx: number) => (
                <img key={idx} src={url} alt="attachment" className="mt-2 max-w-xs rounded" />
              ))}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className="flex space-x-2 mt-1">
                  {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                    <div key={emoji} className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 border border-gray-600">
                      {emoji} {users.length}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)} className="text-gray-400 hover:text-white">
                😀
              </button>
              {showEmojiPicker === msg._id && (
                <div className="absolute right-0 top-8 bg-gray-800 p-2 rounded shadow-lg flex space-x-2 z-10">
                  {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                    <button key={emoji} onClick={() => addReaction(msg._id, emoji)} className="hover:bg-gray-700 p-1 rounded">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gray-700">
        <form onSubmit={sendMessage} className="flex items-center bg-gray-600 rounded-lg p-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white px-2">
            <Plus size={24} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message #${channelId}`}
            className="flex-1 bg-transparent text-white p-2 focus:outline-none"
          />
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
