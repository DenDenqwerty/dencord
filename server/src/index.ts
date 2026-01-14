import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ExpressPeerServer } from 'peer';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from './models/User';
import { registerValidation, loginValidation } from './utils/validations';
import handleValidationErrors from './utils/handleValidationErrors';
import * as AuthController from './controllers/authController';
import * as ServerController from './controllers/serverController';
import * as ChannelController from './controllers/channelController';
import * as FriendController from './controllers/friendController';
import checkAuth from './middleware/checkAuth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('io', io);

app.use('/peerjs', ExpressPeerServer(httpServer));

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/discord-clone';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('Failed to connect to local MongoDB, trying in-memory...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to In-Memory MongoDB');
    } catch (memErr) {
      console.error('Failed to connect to In-Memory MongoDB:', memErr);
    }
  }
};

connectDB();

app.get('/', (req, res) => {
  res.send('Discord Clone API is running');
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.post('/auth/register', registerValidation, handleValidationErrors, AuthController.register);
app.post('/auth/login', loginValidation, handleValidationErrors, AuthController.login);
app.get('/auth/me', checkAuth, AuthController.getMe);
app.put('/users/me', checkAuth, AuthController.updateProfile);

app.post('/servers', checkAuth, ServerController.createServer);
app.get('/servers', checkAuth, ServerController.getServers);
app.get('/servers/:id', checkAuth, ServerController.getServer);

app.post('/channels', checkAuth, ChannelController.createChannel);
app.get('/channels/:id/messages', checkAuth, ChannelController.getChannelMessages);
app.post('/messages', checkAuth, ChannelController.createMessage);
app.post('/messages/reaction', checkAuth, ChannelController.addReaction);

// Friend Routes
// Trigger restart
app.post('/friends/request', checkAuth, FriendController.sendFriendRequest);
app.get('/friends/requests', checkAuth, FriendController.getFriendRequests);
app.put('/friends/respond', checkAuth, FriendController.respondToFriendRequest);
app.get('/friends', checkAuth, FriendController.getFriends);

const userSocketMap = new Map();
const voiceStates = new Map(); // channelId -> Set<userId>

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('get_voice_states', async () => {
    const states: any = {};
    for (const [channelId, users] of voiceStates.entries()) {
        try {
            const userDetails = await User.find({ _id: { $in: Array.from(users) } }).select('username avatarUrl');
            states[channelId] = userDetails;
        } catch (e) {
            console.error(e);
        }
    }
    socket.emit('voice_states', states);
  });

  socket.on('register_user', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  });

  socket.on('call:initiate', ({ callerId, receiverId, type }) => {
    const receiverSocketId = userSocketMap.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call:incoming', { callerId, type });
    }
  });

  socket.on('call:accept', ({ callerId, receiverId }) => {
    const callerSocketId = userSocketMap.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:accepted', { receiverId });
    }
  });

  socket.on('call:reject', ({ callerId }) => {
    const callerSocketId = userSocketMap.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:rejected');
    }
  });

  socket.on('call:signal', ({ to, signal }) => {
    const socketId = userSocketMap.get(to);
    if (socketId) {
      io.to(socketId).emit('call:signal', { from: socket.id, signal }); // Note: sending socket.id might be wrong if we use userId for peerjs
    }
  });

  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on('send_message', (message) => {
    io.to(message.channel).emit('receive_message', message);
  });

  socket.on('join_voice', async (channelId, userId) => {
    socket.join(channelId);
    socket.to(channelId).emit('user_connected', userId);

    if (!voiceStates.has(channelId)) voiceStates.set(channelId, new Set());
    voiceStates.get(channelId).add(userId);
    
    try {
      const users = Array.from(voiceStates.get(channelId));
      const userDetails = await User.find({ _id: { $in: users } }).select('username avatarUrl');
      io.emit('voice_status_update', { channelId, users: userDetails });
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('leave_voice', async (channelId, userId) => {
    socket.leave(channelId);
    socket.to(channelId).emit('user_disconnected', userId);

    if (voiceStates.has(channelId)) {
      voiceStates.get(channelId).delete(userId);
      try {
        const users = Array.from(voiceStates.get(channelId));
        const userDetails = await User.find({ _id: { $in: users } }).select('username avatarUrl');
        io.emit('voice_status_update', { channelId, users: userDetails });
      } catch (e) {
        console.error(e);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from map
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        
        // Remove from voice states
        voiceStates.forEach((users, channelId) => {
          if (users.has(userId)) {
            users.delete(userId);
            io.emit('voice_status_update', { channelId, users: Array.from(users) });
          }
        });
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
