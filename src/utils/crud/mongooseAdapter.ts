import { defaultMongooseQueryTransform, } from "./queryTransform";
import { dbMethodOptionType } from "./crud"
import { vehicleModel } from "model";


export let mongooseAdapter = {
  transformQuery: defaultMongooseQueryTransform,
  get: async (model, data, options: dbMethodOptionType = {}) => {
    return await model.find(data)
      .populate(options._populate)
      // .deepPopulate(options._populate ?? "")
      .sort(options._sort ?? "")
      .select(options._select ?? "")
      .limit(+options._limit ?? 100)
      .skip(+options._offset ?? 0)
      .lean(true);
  },
  post: async (model, data) => {
    return await model.create(data);
  },
  patch: async (model, data) => {
    const doc = await model.findOne({ _id: data._id });
    return await doc.set(data).save().then(it => it.toJSON());;
  },
  count: async (model, data) => await model.count(data)
}