import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
const pinSchema = new Schema(
  {
    // TODO add validator
    phone: { type: String, trim: true, required: true, unique: true },
    // pin: { type: String, trim: true, required: true, default: generatePin },
    createdAt: { type: Date, default: Date.now, expires: '5m' }
  },
  { timestamps: true },
);


export default pinSchema;
