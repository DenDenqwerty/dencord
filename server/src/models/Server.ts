import mongoose, { Schema, Document } from 'mongoose';

export interface IServer extends Document {
  name: string;
  iconUrl?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  channels: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ServerSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  iconUrl: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
}, {
  timestamps: true
});

export default mongoose.model<IServer>('Server', ServerSchema);
