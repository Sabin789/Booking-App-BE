import  Express  from "express";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import UserModel from "../Users/model";
import ServiceModel from "./model";
import createHttpError from "http-errors";

const ServiceRouter=Express.Router()

ServiceRouter.get("/",JWTTokenAuth,async(req,res,next)=>{
    try {
        const user = await UserModel.findByPk((req as UserRequest).user._id);
        const services= user?.ServiceIds
        res.send(services)
    } catch (error) {
        next(error)
    }
})

ServiceRouter.post("/",JWTTokenAuth,async(req,res,next)=>{
    try {
        const user = await UserModel.findByPk((req as UserRequest).user._id);
         const exists= await ServiceModel.findOne({where:{
            name:req.body.name,
            BusinessId:user?.UserId}})
        if(!user){
            next(createHttpError(404, "No user found!!!"));
        }else{
           
              if(exists){
                next(createHttpError(409, "You are already advertising that service!!!"));
              }else{
                req.body.BusinessId = user.UserId
                const {ServiceId}= await ServiceModel.create(req.body)
                res.status(201).send({ServiceId})
              }
            }
    } catch (error) {
        next(error)
    }
})

ServiceRouter.get("/me",JWTTokenAuth, async(req,res,next)=>{
    try {
        const user = await UserModel.findByPk((req as UserRequest).user._id);
        if(!user){
            next(createHttpError(404, "No user found!!!"));
        }else{
            const services=await ServiceModel.findAll({where:{
                BusinessId:user.UserId
            }})
            if(!services){
                next(createHttpError(404, "No Services found!!!"));
            }else{
                res.send(services)
            }
        }
    } catch (error) {
        next(error)
    }
})




export default ServiceRouter