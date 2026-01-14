import { Request, Response } from 'express';
import Call from '../models/Call';
import User from '../models/User';

export const startCall = async (req: Request, res: Response) => {
  try {
    const { type, participants, channelId, settings } = req.body;
    const userId = (req as any).userId;

    const newCall = new Call({
      type,
      participants: [{ userId, joinedAt: new Date(), mediaState: { microphone: true, camera: type === 'video', screenShare: false, volume: 1 } }],
      channelId,
      initiatorId: userId,
      startTime: new Date(),
      settings: settings || {
        maxParticipants: 10,
        requirePassword: false,
        allowScreenShare: true,
        allowCamera: true,
        recordingAllowed: false
      }
    });

    await newCall.save();

    // Add other participants if provided
    if (participants && participants.length > 0) {
      for (const participantId of participants) {
        if (participantId !== userId) {
          newCall.participants.push({
            userId: participantId,
            joinedAt: new Date(),
            mediaState: { microphone: true, camera: type === 'video', screenShare: false, volume: 1 }
          });
        }
      }
      await newCall.save();
    }

    res.status(201).json(newCall);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinCall = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const userId = (req as any).userId;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Check if user is already in the call
    const existingParticipant = call.participants.find(p => p.userId.toString() === userId);
    if (existingParticipant) {
      return res.status(400).json({ message: 'Already in call' });
    }

    // Check max participants
    if (call.participants.length >= call.settings.maxParticipants) {
      return res.status(400).json({ message: 'Call is full' });
    }

    call.participants.push({
      userId,
      joinedAt: new Date(),
      mediaState: { microphone: true, camera: call.type === 'video', screenShare: false, volume: 1 }
    });

    await call.save();
    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const leaveCall = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const userId = (req as any).userId;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    const participantIndex = call.participants.findIndex(p => p.userId.toString() === userId);
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not in call' });
    }

    call.participants[participantIndex].leftAt = new Date();

    // If no participants left, end the call
    const activeParticipants = call.participants.filter(p => !p.leftAt);
    if (activeParticipants.length === 0) {
      call.endTime = new Date();
    }

    await call.save();
    res.json({ message: 'Left call successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCall = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const call = await Call.findById(callId).populate('participants.userId', 'username avatar status');
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }
    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCallParticipant = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { mediaState } = req.body;
    const userId = (req as any).userId;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    const participant = call.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      return res.status(400).json({ message: 'Not in call' });
    }

    if (mediaState) {
      Object.assign(participant.mediaState, mediaState);
    }

    await call.save();
    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActiveCalls = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const calls = await Call.find({
      'participants.userId': userId,
      endTime: { $exists: false },
      'participants.leftAt': { $exists: false }
    }).populate('participants.userId', 'username avatar status');
    res.json(calls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};