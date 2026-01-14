import { Request, Response } from 'express';
import User from '../models/User';
import FriendRequest from '../models/FriendRequest';

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const senderId = (req as any).userId;

    const receiver = await User.findOne({ username });
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (receiver._id.toString() === senderId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiver._id },
        { sender: receiver._id, receiver: senderId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already pending' });
    }

    const alreadyFriends = await User.findOne({ _id: senderId, friends: receiver._id });
    if (alreadyFriends) {
      return res.status(400).json({ message: 'User is already your friend' });
    }

    const newRequest = new FriendRequest({
      sender: senderId,
      receiver: receiver._id
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send friend request' });
  }
};

export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'username avatarUrl');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get friend requests' });
  }
};

export const respondToFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId, status } = req.body; // status: 'accepted' | 'rejected'
    const userId = (req as any).userId;

    const request = await FriendRequest.findOne({ _id: requestId, receiver: userId, status: 'pending' });
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
    }

    res.json({ message: `Friend request ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to respond to friend request' });
  }
};

export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).populate('friends', 'username avatarUrl email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get friends' });
  }
};
