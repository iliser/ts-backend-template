import * as mongoose from 'mongoose';
import { imageSchema } from './image';
import { safeFile, buildFileSaver } from 'utils/fileSaver';

const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaTypes.ObjectId;
// Vehicle
const vehicleSchema = new Schema({
  // TODO get 
  creator: { type: ObjectId, ref: "user", index: true, immutable: true },
  // TODO change to enum
  country: { type: String },
  // TODO provide suggestions
  model: { type: String },
  brand: { type: String },

  year: { type: Number, min: 1950, max: 3000 },
  vin: { type: String },
  // Photos
  photo: imageSchema,
  photoCabin: imageSchema,
  photoPts: imageSchema,
  photoTable: imageSchema
}, { timestamps: true });

vehicleSchema.post("save", buildFileSaver("photo photoCabin photoPts photoTable"));

export default vehicleSchema;