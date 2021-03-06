import * as mongoose from 'mongoose';
import config from 'config'


function generatePin() {
  return Math.random().toString().substr(2, 6);
}

const Schema = mongoose.Schema;
const pinSchema = new Schema(
  {
    // TODO add validator
    phone: { type: String, trim: true, required: true, unique: true },
    pin: { type: String, trim: true, required: true, default: generatePin },
    createdAt: { type: Date, default: Date.now, expires: config?.pin?.expiresTime ?? '5m' }
  },
  { timestamps: true },
);


export default pinSchema;
