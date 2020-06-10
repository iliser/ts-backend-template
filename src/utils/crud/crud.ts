import { defaultMongooseQueryTransform } from "./queryTransform";
import { userModel } from "model";

interface transformFn { (obj: any,req?:any): Promise<any> };
interface accessFn { (req: any): Promise<boolean> };

interface OptionType {
  access?: accessFn,
  transformBody?: transformFn,
  transformQuery?: transformFn,
  transformData?: transformFn,
  transformAns?: transformFn,
}

export interface dbMethodOptionType {
  _populate?: String
  _select?: String,
  _sort?: String,
  _limit?: String,
  _offset?: String,
}

function extractOption(refQuery){
  let options = {};
  for(let k in refQuery){
    if(k[0] == "_" && k != "_id"){
      options[k] = refQuery[k];
      delete refQuery[k];
    }
  }
  return options;
}

interface dbMethod { (model: any, data: any, options: dbMethodOptionType): [any] | any }
export function Crud(dbAdapter) {
  function method(model, options: OptionType, dbMethod) {
    return async (req, res) => {
      if (!options.access || await options.access(req)) {
        // Here we can save file, how delete unusued file
        let body = await options.transformBody?.(req.body) ?? req.body;
        let query = {...req.query};
        let methodOptions = extractOption(query);
        query = await options.transformQuery?.(query,req) ?? query;
        query = await dbAdapter.transformQuery?.(query,req) ?? query;

        let data = { ...query, ...body };
        console.log(data);
        data = await options.transformData?.(data,req) ?? data;

        let ans = await dbMethod(model, data, methodOptions);

        let ta = await options.transformAns ?? (v => v);
        ans = Array.isArray(ans) ? ans.map(v => ta(v)) : ta(ans);

        res.send(ans);
      }else{
        throw {
          statusCode: 403,
          message: "access denied"
        }
      }
    }
  };
  function countMethod(model,dbCount){
    return async (req,res) => {
      let query = {...req.query};
      query = await dbAdapter.transformQuery?.(query,req) ?? query;
      res.send(await dbCount(model,query));
    }
  }
  return {
    post: (model, options: OptionType = {}) => method(model, options, dbAdapter.post),
    get: (model, options: OptionType = {}) => method(model, options, dbAdapter.get),
    patch: (model, options: OptionType = {}) => method(model, options, dbAdapter.patch),
    delete: (model, options: OptionType = {}) => method(model,options, dbAdapter.delete),
    count: (model) => countMethod(model,dbAdapter.count)
  }
}