import { Request, Response } from 'express';
import Channel from '../models/Channel';
import Server from '../models/Server';
import Message from '../models/Message';

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, type, serverId } = req.body;
    
    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check if user is owner (simplified permission check)
    if (server.owner.toString() !== (req as any).userId) {
      return res.status(403).json({ message: 'No permission' });
    }

    const newChannel = new Channel({
      name,
      type,
      server: serverId,
    });

    await newChannel.save();

    server.channels.push(newChannel._id as any);
    await server.save();

    res.status(201).json(newChannel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChannelMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ channel: id }).populate('author', 'username avatarUrl').sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { content, channelId, attachments } = req.body;
    const userId = (req as any).userId;

    const newMessage = new Message({
      content,
      channel: channelId,
      author: userId,
      attachments: attachments || [],
      reactions: {},
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate('author', 'username avatarUrl');

    const io = req.app.get('io');
    io.to(channelId).emit('receive_message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addReaction = async (req: Request, res: Response) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = (req as any).userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.reactions) {
      message.reactions = new Map();
    }
    
    const reactions = message.reactions;
    const users = reactions.get(emoji) || [];

    // Convert ObjectIds to strings for comparison
    const userIds = users.map(id => id.toString());

    if (!userIds.includes(userId)) {
      users.push(userId as any); // Cast to any to avoid ObjectId vs String issues
      reactions.set(emoji, users);
      message.reactions = reactions;
      await message.save();
      
      const io = req.app.get('io');
      io.to(message.channel.toString()).emit('message_reaction', { messageId, emoji, userId });
    }

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
