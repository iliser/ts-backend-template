import * as mongoose from 'mongoose';
import { imageSchema, fileSchema } from './image';
import { buildFileSaver } from 'utils/fileSaver';

const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;
// Order to part



export enum OrderState {
  Active = "Active",
  Ended = "Ended"
};

const orderSchema = new Schema({
  creator: { type: ObjectId, ref: "user", index: true },
  vehicle: { type: ObjectId, ref: "vehicle", index: true },

  voice: fileSchema,
  voiceText: { type: String },
  text: { type: String },

  // TODO what is be here
  itemType: { type: String },
  // Photos
  photo: imageSchema,

  // active / ended
  state: { type: String, enum: Object.keys(OrderState), default: OrderState.Active }
}, { timestamps: true });

orderSchema.post("save", buildFileSaver("photo voice"));
orderSchema.virtual("offers", {
  ref: "offer",
  localField: "_id",
  foreignField: "order",
  options: { sort: "updatedAt" }
});

export default orderSchema;