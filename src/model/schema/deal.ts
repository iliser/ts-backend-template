import * as mongoose from 'mongoose';
import { imageSchema, fileSchema } from './image';
import { buildFileSaver } from 'utils/fileSaver';

const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;

const dealSchema = new Schema({
  offer: { type: ObjectId, ref: "offer", index: true, required: true, immutable: true },
  order: { type: ObjectId, ref: "order", index: true, required: true, immutable: true },
  seller: { type: ObjectId, ref: "seller", required: true, immutable: true },
  creator: { type: ObjectId, ref: "user", required: true, immutable: true },
  price: { type: Number, required: true, immutable: true },
  text: { type: String }
}, { timestamps: true });


export default dealSchema;