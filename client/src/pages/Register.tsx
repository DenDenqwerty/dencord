import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchRegister, selectIsAuth } from '../store/slices/auth';
import { AppDispatch } from '../store/store';

const Register: React.FC = () => {
  const isAuth = useSelector(selectIsAuth);
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit, setError, formState: { errors, isValid } } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: ''
    },
    mode: 'onChange'
  });

  const onSubmit = async (values: any) => {
    const data = await dispatch(fetchRegister(values));

    if (!data.payload) {
      return alert('Failed to register');
    }

    if (typeof data.payload === 'object' && data.payload !== null && 'token' in data.payload) {
      window.localStorage.setItem('token', (data.payload as { token: string }).token);
    }
  };

  if (isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              {...register('username', { required: 'Enter username' })}
              className={`w-full p-2 rounded bg-gray-900 border ${errors.username ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:border-blue-500`}
              type="text"
              id="username"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              {...register('email', { required: 'Enter email' })}
              className={`w-full p-2 rounded bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:border-blue-500`}
              type="email"
              id="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              {...register('password', { required: 'Enter password' })}
              className={`w-full p-2 rounded bg-gray-900 border ${errors.password ? 'border-red-500' : 'border-gray-700'} focus:outline-none focus:border-blue-500`}
              type="password"
              id="password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            disabled={!isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            type="submit"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-400 text-sm">Already have an account? </span>
          <a href="/login" className="text-blue-500 text-sm hover:underline">Log In</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
