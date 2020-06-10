import * as mongoose from 'mongoose';
import { phoneSchema } from './phone';


const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

const authSchema = new Schema({
  phone: { ...phoneSchema, unique: true, required: true, immutable: true },
  password: { type: String, required: true, select: false },
});

export default authSchema;