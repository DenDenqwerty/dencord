import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { fetchAuthMe, selectIsAuth } from './store/slices/auth';
import { AppDispatch } from './store/store';
import { CallProvider } from './context/CallContext';
import { StreamProvider } from './context/StreamContext';
import CallModal from './components/Call/CallModal';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuth);

  useEffect(() => {
    dispatch(fetchAuthMe());
  }, [dispatch]);

  return (
    <div className="App">
      <StreamProvider>
      <CallProvider>
        <CallModal />
        <Routes>
          <Route path="/" element={isAuth ? <Home /> : <Login />} />
          <Route path="/channels/:serverId" element={isAuth ? <Home /> : <Login />} />
          <Route path="/channels/:serverId/:channelId" element={isAuth ? <Home /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </CallProvider>
      </StreamProvider>
    </div>
  );
}

export default App;
