import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import axios from '../axios';
import { fetchAuthMe } from '../store/slices/auth';
import { AppDispatch } from '../store/store';

const UserSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const user = useSelector((state: any) => state.auth.data);
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio || '',
    }
  });

  const onSubmit = async (values: any) => {
    try {
      await axios.put('/users/me', values);
      dispatch(fetchAuthMe()); // Refresh user data
      onClose();
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl text-white font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
            <input {...register('username')} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">Avatar URL</label>
            <input {...register('avatarUrl')} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">Bio</label>
            <textarea {...register('bio')} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
