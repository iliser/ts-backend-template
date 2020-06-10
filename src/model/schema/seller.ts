import * as mongoose from 'mongoose';
import { addressSchema } from './address';
import { phoneSchema } from './phone';


const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;


// Продавец
const sellerSchema = new Schema({
  // WARN must be not modifable by user
  auth: { type: ObjectId, ref: "auth", index: true, unique: true, immutable: true,  required: true },
  blocked: {type: Boolean,default:false},

  name: { type: String },
  desc: { type: String },

  lawAddress: addressSchema,
  orgPhones: [phoneSchema],

  inn: { type: String },

  passport: { type: String, maxlength: 10, minlength: 10, match: /\d+/ },
  contactPhone: phoneSchema,

  rating: { type: Number },

  // TODO change to firebase token string validation
  pushToken: { type: String }
})

export default sellerSchema;