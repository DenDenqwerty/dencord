import { Request, Response } from 'express';
import Server from '../models/Server';
import Channel from '../models/Channel';

export const createServer = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any).userId;

    const newServer = new Server({
      name,
      owner: userId,
      members: [userId],
    });

    await newServer.save();

    // Create default 'general' channel
    const defaultChannel = new Channel({
      name: 'general',
      type: 'text',
      server: newServer._id,
    });

    await defaultChannel.save();

    newServer.channels.push(defaultChannel._id as any);
    await newServer.save();

    res.status(201).json(newServer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getServers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const servers = await Server.find({ members: userId });
    res.json(servers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getServer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const server = await Server.findById(id).populate('channels');
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    res.json(server);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
