import { Schema, model } from 'mongoose';

export interface Server {
  _id: string;
  name: string;
  owner: string;
  members: string[];
  channels: string[];
  createdAt: Date;
}

const ServerSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
}, { timestamps: true });

const ServerModel = model('Server', ServerSchema);

export default ServerModel;
