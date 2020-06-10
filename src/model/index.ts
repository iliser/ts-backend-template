import * as mongoose from 'mongoose';
import authSchema from './schema/auth';
import offerSchema from './schema/offer';
import orderSchema from './schema/order';
import pinSchema from './schema/pin';
import sellerSchema from './schema/seller';
import userSchema from './schema/user';
import vehicleSchema from './schema/vehicle';

import * as mongooseDeepPopulate from 'mongoose-deep-populate'
import dealSchema from './schema/deal';
[userSchema,vehicleSchema,orderSchema,sellerSchema,offerSchema].map( v => v.plugin(mongooseDeepPopulate(mongoose)));

export const pinModel = mongoose.model('pin', pinSchema);
export const authModel = mongoose.model('auth', authSchema);

export const userModel = mongoose.model('user', userSchema);
export const vehicleModel = mongoose.model('vehicle', vehicleSchema);
export const orderModel = mongoose.model('order', orderSchema);

export const sellerModel = mongoose.model('seller', sellerSchema);
export const offerModel = mongoose.model('offer', offerSchema);

export const dealModel = mongoose.model('deal',dealSchema);
