import { FastifyRequest } from "fastify";
import { userModel } from "model";

export async function updateUser(request, reply) {
    if(!request?.user?._id){
        reply.code(401);
        return;
    }
    let {phone,...newData} = request.body;
    let user = await userModel.findById(request.user._id);

    reply.send(await user.set(newData).save());
}

export async function getUser(req,res){
    let aid = req?.user?.auth_id;
    if(!aid){
        res.code(401).send();
        return;
    }
    res.send(await userModel.findOne({auth:aid}));
}
 
export async function getSession(req,res){
    res.send(req.user);
}