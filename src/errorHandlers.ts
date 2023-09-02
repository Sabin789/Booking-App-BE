
import { ErrorRequestHandler } from "express"
import { ValidationError } from "sequelize"


export const BadRequestHandler:ErrorRequestHandler= (err,req,res,next)=>{
    if(err.status===400){
        res.status(400).send({ success: false, message: err.message, errorsList: err.errorsList })  
    
    }else if(err instanceof ValidationError){
        res.status(400).send({ success: false, message: err.errors.map(e => e.message) })
    } else {
      next(err)
    }
}

export const UnAuthorizedHandler:ErrorRequestHandler=(err,req,res,next)=>{
  if(err.status===401){
    res.status(401).send({message:err.message})
  }else{
    next()
   }
}

export const ForbiddenHandler:ErrorRequestHandler=(err,req,res,next)=>{
    if(err.status===403){
        res.status(403).send({message:err.message})
      }else{
        next()
       }
}

export const NotFoundHandler:ErrorRequestHandler=(err,req,res,next)=>{
    if(err.status===404){
        res.status(404).send({message:err.message})
      }else{
        next()
       }
}

export const GenericErrorHandler:ErrorRequestHandler=(err,req,res,next)=>{
   console.log(err)
   res.status(err.status || 500).json({ message: err.message });}



