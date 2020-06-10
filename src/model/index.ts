import * as mongoose from 'mongoose';
import authSchema from './schema/auth';
import pinSchema from './schema/pin';
import sellerSchema from './schema/seller';
import userSchema from './schema/user';


import * as mongooseDeepPopulate from 'mongoose-deep-populate'
[userSchema,sellerSchema].map( v => v.plugin(mongooseDeepPopulate(mongoose)));

export const pinModel = mongoose.model('pin', pinSchema);
export const authModel = mongoose.model('auth', authSchema);

export const userModel = mongoose.model('user', userSchema);
export const sellerModel = mongoose.model('seller', sellerSchema);