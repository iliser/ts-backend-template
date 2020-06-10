import * as mongoose from 'mongoose';
import { imageSchema } from './image';
import { buildFileSaver } from 'utils/fileSaver';

const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;


export enum OfferState {
  New = "New",
  Viewed = "Viewed",
  Reserved = "Reserved",
  Ended = "Ended",
  Canceled = "Canceled"
};


export enum OfferAvaliability {
  Preorder = "Preorder",
  Avaliable = "Avaliable"
};

// Offer of concrete part
const offerSchema = new Schema({
  creator: { type: ObjectId, ref: "seller", index: true, required: true },
  order: { type: ObjectId, ref: "order", index: true, required: true },
  photo: imageSchema,
  price: { type: Number, required: true },
  // need Preorder/Avaliable
  availability: { type: String, enum: Object.keys(OfferAvaliability) },
  // new/viewed/reserved/ended/canceled
  state: { type: String, enum: Object.keys(OfferState), default: OfferState.New },
}, { timestamps: true });

offerSchema.post("save", buildFileSaver("photo"));

export default offerSchema;