import config from "config";
import { FastifyRequest } from "fastify";
import * as jwt from 'jsonwebtoken';
import { pinModel, authModel, userModel, sellerModel } from "model";
import * as bcrypt from 'bcrypt'
// import { bcrypt_hash } from 'utils/bcrypt';


export const jwtAuth = async (request, reply) => {
    let token: string = request.headers['authorization'] ?? "";
    let user = null;

    if (token.startsWith("Bearer ")) {
        token = token.substr(7);
        try {
            user = jwt.verify(token, config.secret, { ignoreExpiration: false });
        } catch (err) {
            reply.code(400).send("Invalid token");
            return;
        }
    }
    (request as any).user = user;
};


export async function enterPhone(request: FastifyRequest, reply) {
    const { phone } = request.body;
    try {
        await pinModel.create({ phone });
    } catch (err) {
        if (err.code == 11000) {
            reply.code(409).send("Enter request already created");
            return;
        }
    }
    reply.send("OK");
}

const _enterPinTryCount = {};

const makePayload = (data) => ({ token: jwt.sign({ auth_id: data.auth_id }, config.secret, { expiresIn: '24h' }), data });

export async function enterPin(request: FastifyRequest, reply) {
    const { phone, pin, password } = request.body;
    if (!password) reply.code(422).send({
        error: "Password field must be set"
    });
    const tc = _enterPinTryCount[phone] = (_enterPinTryCount[phone] ?? 0) + 1;
    if (tc == 1) setTimeout(() => delete _enterPinTryCount[phone], config.pin.resetTime);
    if (tc > config.pin.maxCount) {
        console.error("Exceeded login attempts : ", phone);
        reply.code(403).send("Exceeded Login Attempts");
        return;
    }


    let doc = await pinModel.findOne({ phone, pin });
    if (doc && password) {
        let hash = await bcrypt.hash(password, 10);
        let auth = await authModel.findOne({ phone }) ?? await authModel.create({ phone, password: hash });
        reply.send(makePayload({ auth_id: auth._id }));
    }
    else reply.code(401).send();
}

const _loginAttempts = {};

export async function enterPassword(request: FastifyRequest, reply) {
    const { phone, password } = request.body;
    
    console.log(`Phone : ${phone} password : ${password}`);
    const tc = _loginAttempts[phone] = (_loginAttempts[phone] ?? 0) + 1;
    if (tc == 1) setTimeout(() => delete _loginAttempts[phone], config?.pin?.resetTime ?? 1000 * 60);

    let doc = await authModel.findOne({ phone }).select("password");

    if (doc && password) {
        console.log(doc);
        // if auth exists user must exists
        let user = await userModel.findOne({ auth: doc._id }).lean(true);
        let seller = await sellerModel.findOne({ auth: doc._id }).lean(true);
        let valid = await bcrypt.compare(password, (doc as any).password);
        if (valid) {
            reply.send(makePayload({ auth_id: doc._id, user, seller }));
            return
        }
    }

    reply.code(401).send();
}

export async function refreshToken(request: FastifyRequest, reply) {
    let token: string = request.headers['authorization'] ?? "";
    if (token.startsWith("Bearer ")) {
        token = token.substr(7);
        let user: any = jwt.verify(token, config.secret, { ignoreExpiration: false });
        reply.send(makePayload(user));
    } else {
        reply.code(401).send();
    }
}
