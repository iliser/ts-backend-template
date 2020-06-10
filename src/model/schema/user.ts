import * as mongoose from 'mongoose';
import { addressSchema } from './address';


const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

// Покупатель
const userSchema = new Schema(
  {
    // WARN must be not modifable by user
    auth: { type: ObjectId, ref: "auth", index: true, unique: true, immutable: true, select: false },
    blocked: { type: Boolean, default: false },

    name: { type: String, trim: true },
    address: addressSchema,
    // TODO change to firebase token string validation
    pushToken: { type: String }
  },
  { timestamps: true },
);

export default userSchema;
