import createHttpError from "http-errors";
import { RequestHandler,Request } from "express";
import { verifyAccessToken,TokenPayload } from "./tools";
import UserModel from "../../api/Users/model";


export interface UserRequest extends Request {
    user: TokenPayload;
  }


export const JWTTokenAuth:RequestHandler=async (req,res,next)=>{
    
    if(!req.headers.authorization){
        next(createHttpError(401,"Please provide a Bearer Authorization Header"))
    }else{
        const accessToken=req.headers.authorization.replace("Bearer ","")
        try {
            const payload=await verifyAccessToken(accessToken)
            req.user={email:payload.email,_id:payload._id,role:payload.role}
            next()
        } 
        catch (err) {
            console.log(err)
            next(createHttpError(401, "Token not valid! Please log in again!"));
        
        }
    }
   
}