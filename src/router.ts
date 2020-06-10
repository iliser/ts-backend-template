import config from "config";
import { FastifyInstance, FastifyRequest } from "fastify";
import { pinModel, userModel, sellerModel, vehicleModel, orderModel, offerModel, dealModel } from "model";
import { enterPassword, enterPhone, enterPin, jwtAuth, refreshToken } from "routes/auth";
import { getSession, getUser, updateUser } from "routes/user";
import { Crud } from "utils/crud/crud";
import { mongooseAdapter } from "utils/crud/mongooseAdapter";
import { OfferState } from "model/schema/offer";


let crud = Crud(mongooseAdapter);

function removeFields(fields) {
  if (typeof fields == "string") fields = fields.split(' ');
  return v => {
    let o = { ...v };
    for (let k of fields) delete o[k];
    return o;
  }
}

async function modelField(model, id, field): Promise<any> {
  return (await model.findById(id).select(field))[field];
}

async function getAuthInfo(req, res) {
  let aid = req?.user?.auth_id;
  if (!aid) return res.code(401).send();

  return res.send({
    user: await userModel.findOne({ auth: aid }),
    seller: await sellerModel.findOne({ auth: aid })
  });
}


export function registerAuth(fastify, opts, next) {
  fastify
    .post("/api/v1/enter/phone", enterPhone)
    .post("/api/v1/enter/pin", enterPin)
    .post("/api/v1/enter/password", enterPassword)
    .get("/", (req, res) => { res.send("OK") });
  next();
}

export default function router(fastify: FastifyInstance, opts, next) {
  fastify.addHook("preHandler", jwtAuth);

  // Registration and login
  fastify
    .get("/api/v1/enter/refresh", refreshToken)
    .get("/api/v1/auth_info", getAuthInfo);


  let accClearFn = removeFields("auth blocked");
  let accAccessCheck = (model) => async (req) => await modelField(model, req.body._id || req.query._id, "auth") == req.user.auth_id

  //Sellers managment
  fastify
    .post("/api/v1/crud/seller", crud.post(sellerModel, {
      transformData: (v, req) => ({ ...v, auth: req.user.auth_id, blocked: false })
    }))
    .get("/api/v1/crud/seller", crud.get(sellerModel, {
      // transformAns: accClearFn
    }))
    .patch("/api/v1/crud/seller", crud.patch(sellerModel, {
      transformData: accClearFn,
      access: accAccessCheck(sellerModel),
      transformAns: accClearFn
    }))
    .get("/api/v1/crud/seller/count", crud.count(sellerModel));
  //Byers managment
  fastify
    .post("/api/v1/crud/user", crud.post(userModel, {
      transformData: (v, req) => ({ ...v, auth: req.user.auth_id, blocked: false })
    }))
    .get("/api/v1/crud/user", crud.get(userModel, {
      // transformAns: accClearFn
    }))
    .patch("/api/v1/crud/user", crud.patch(userModel, {
      transformData: accClearFn,
      access: accAccessCheck(userModel),
      transformAns: accClearFn
    }))
    .get("/api/v1/crud/user/count", crud.count(userModel));

  // TODO Block users, ADMIN ACCESS 
  fastify
    .post("/api/v1/block/user", () => { })
    .post("/api/v1/block/seller", () => { })

  let setAuthUserAsCreator = async (v, req) => {
    let user = await userModel.findOne({ auth: req.user.auth_id }).lean(true);
    return ({ ...v, creator: user._id });
  };

  // Vehicles managment
  // TODO add image loading
  let authHasUser = async (req) => (await userModel.findOne({ auth: req.user.auth_id }).lean(true) as any) != null;
  fastify
    .get("/api/v1/crud/deal", crud.get(dealModel))
    .post("/api/v1/crud/deal", crud.post(dealModel, {
      access: authHasUser,
      transformData: setAuthUserAsCreator
    }))
    .get("/api/v1/crud/deal/count", crud.count(dealModel));

  fastify
    .get("/api/v1/crud/vehicle", crud.get(vehicleModel))
    .post("/api/v1/crud/vehicle", crud.post(vehicleModel, {
      access: authHasUser,
      transformData: setAuthUserAsCreator
    }))
    .patch("/api/v1/crud/vehicle", crud.patch(vehicleModel, {
      access: async (req) => {
        let veh: any = await vehicleModel.findById(req.body._id || req.query._id).lean(true);
        let user = await userModel.findOne({ auth: req.user.auth_id }).lean(true);

        return veh.creator.toString() == user._id.toString();
      },
      transformData: setAuthUserAsCreator
    }))
    .get("/api/v1/crud/vehicle/count", crud.count(vehicleModel));

  // Order managment
  // TODO add image, voice loading
  //# gen from "order<_id>.creator.toString() == user<auth:r.user.auth_id>._id.toString()"

  let orderPatchAccess = async (req) => (await orderModel.findOne({ _id: req.query._id ?? req.body._id }).lean(true) as any).creator.toString() == (await userModel.findOne({ auth: req.user.auth_id }).lean(true) as any)._id.toString()
  fastify
    .get("/api/v1/crud/order", crud.get(orderModel))
    .post("/api/v1/crud/order", crud.post(orderModel, {
      access: authHasUser,
      transformData: setAuthUserAsCreator
    }))
    .patch("/api/v1/crud/order", crud.patch(orderModel, {
      access: orderPatchAccess,
      transformData: setAuthUserAsCreator
    }))
    .get("/api/v1/crud/order/count", crud.count(orderModel));

  // Offer managment
  // TODO add image loading
  let authHasSeller = async (req) => (await sellerModel.findOne({ auth: req.user.auth_id }).lean(true) as any) != null;
  // # creator:seller<auth:r.user.auth_id>._id
  let setAuthSellerAsCreator = async (v, req) => {
    let user = await sellerModel.findOne({ auth: req.user.auth_id }).lean(true);
    return ({ ...v, creator: user._id });
  };
  // gen from offer<_id>.creator.toString() == seller<auth:r.user.auth_id>._id.toString()
  let offerPatchAccess = async (req) => (await offerModel.findOne({ _id: req.query._id ?? req.body._id }).lean(true) as any).creator.toString() == (await sellerModel.findOne({ auth: req.user.auth_id }).lean(true) as any)._id.toString()

  let setOfferState = (state: OfferState) => async (req, res) => {
    const { _id } = req.query;
    if (!_id) throw "_id field must be set";
    const [doc, user, seller] = await Promise.all([
      await offerModel.findById(_id).populate("order"),
      await userModel.findOne({ auth: (req as any).user.auth_id }).lean(),
      await sellerModel.findOne({ auth: (req as any).user.auth_id }).lean()
    ]);
    if (!doc || !user) res.code(404).send();
    if ((doc as any).order.creator.toString() != user._id.toString() && (doc as any).creator.toString() != seller._id.toString()) res.code(403).send();

    await doc.set("state", state).save();
    res.send("OK")

  }

  fastify
    .get("/api/v1/crud/offer", crud.get(offerModel))
    .post("/api/v1/crud/offer", crud.post(offerModel, {
      access: authHasSeller,
      transformData: setAuthSellerAsCreator
    }))
    .patch("/api/v1/crud/offer", crud.patch(offerModel, {
      access: offerPatchAccess,
      transformData: setAuthSellerAsCreator
    }))
    .get("/api/v1/crud/offer/count", crud.count(offerModel))
    .post("/api/v1/offer/seen", setOfferState(OfferState.Viewed))
    .post("/api/v1/offer/lock", setOfferState(OfferState.Reserved))
    .post("/api/v1/offer/cancel", setOfferState(OfferState.Canceled))

  if (config.isDev) {
    fastify.get("/test/v1/session", getSession);
    fastify.get("/test/v1/pin", async (req: FastifyRequest, res) => {
      console.log(req.body);
      const phone = req.query?.phone;
      let doc: any = await pinModel.findOne({ phone });
      res.send(doc.pin);
    });
  }

  next();
}
