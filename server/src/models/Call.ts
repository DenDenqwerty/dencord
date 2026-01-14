import mongoose, { Schema, Document } from 'mongoose';

export interface ICallParticipant {
  userId: mongoose.Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
  mediaState: {
    microphone: boolean;
    camera: boolean;
    screenShare: boolean;
    volume: number;
  };
}

export interface ICallSettings {
  maxParticipants: number;
  requirePassword: boolean;
  password?: string;
  allowScreenShare: boolean;
  allowCamera: boolean;
  recordingAllowed: boolean;
}

export interface ICall extends Document {
  type: 'voice' | 'video' | 'screen_share';
  participants: ICallParticipant[];
  channelId?: mongoose.Types.ObjectId; // если звонок в канале
  initiatorId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  settings: ICallSettings;
  isActive: boolean;
}

const CallParticipantSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
  mediaState: {
    microphone: { type: Boolean, default: true },
    camera: { type: Boolean, default: false },
    screenShare: { type: Boolean, default: false },
    volume: { type: Number, default: 1.0, min: 0, max: 1 }
  }
}, { _id: false });

const CallSettingsSchema: Schema = new Schema({
  maxParticipants: { type: Number, default: 10, min: 1, max: 100 },
  requirePassword: { type: Boolean, default: false },
  password: { type: String },
  allowScreenShare: { type: Boolean, default: true },
  allowCamera: { type: Boolean, default: true },
  recordingAllowed: { type: Boolean, default: false }
}, { _id: false });

const CallSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['voice', 'video', 'screen_share'],
    required: true
  },
  participants: [CallParticipantSchema],
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
  initiatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  settings: { type: CallSettingsSchema, default: {} },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Индексы для производительности
CallSchema.index({ isActive: 1, startTime: -1 });
CallSchema.index({ 'participants.userId': 1, isActive: 1 });

export default mongoose.model<ICall>('Call', CallSchema);