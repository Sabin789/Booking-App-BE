import  Express  from "express";
import createHttpError from "http-errors";
import UserModel from "./model";
import { createAccessToken, createRefreshToken } from "../../lib/auth/tools";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import { avatarUploader } from "../../lib/cloudinary";
import sequelize, { Op } from "sequelize";


const UserRouter=Express.Router()

UserRouter.post("/",async(req,res,next)=>{
    try {
        const exists= await UserModel.findOne({where:{email:req.body.email}})
        if(exists){
            res.status(409).send(`${req.body.email} is already in use"`)
        }else{
            const {UserId}= await UserModel.create(req.body)
            res.status(201).send({UserId})
        }
    } catch (error) {
        console.error('Error creating user:', error)
        next(error)
    }
})


UserRouter.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ where: { email } });
  
      if (!user) {
        next(createHttpError(401, "Wrong Credentials!"));
      } else {
        const authenticatedUser = await user.checkCredentials(email, password);
  
        if (!authenticatedUser) {
          next(createHttpError(401, "Wrong Credentials!"));
        } else {
          const payload = {
            email: authenticatedUser.email,
            _id: authenticatedUser.UserId,
            role: authenticatedUser.role,
          };
  
          const accessToken = await createAccessToken(payload);
          const refreshToken = await createRefreshToken(payload);
  

          res.cookie('accessToken', accessToken, {
            httpOnly: true, // This helps prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // Set to true if using https
            sameSite: 'strict', // Helps mitigate CSRF attacks
          });
  
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });

          res.send({ user: authenticatedUser, accessToken, refreshToken });
        }
      }
    } catch (err) {
       console.log(err)
      next(err);
    }
  });


UserRouter.post("/avatar",avatarUploader,JWTTokenAuth, async (req, res, next) => {
  try {
    const userId = (req as UserRequest).user!._id;
    const newAvatarPath = req.file?.path;

    await UserModel.update({ avatar: newAvatarPath }, { where: { UserId: userId } });
    res.send({ avatarURL: newAvatarPath });
    console.log("UserId",userId)
   

  } catch (error) {
    console.log(error)
    next(error)
  }
})  


UserRouter.get("/",async(req,res,next)=>{
    try {
        const users=await UserModel.findAll()
        res.send(users)
    } catch (error) {
        next(error)
    }
})


UserRouter.get("/me", JWTTokenAuth, async (req, res, next) => {
    try {
      const user = await UserModel.findByPk((req as UserRequest).user._id);
      res.send(user);
    } catch (error) {
      next(error);
    }
})



UserRouter.get("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
        let user=await UserModel.findByPk(req.params.id)
        if(user){
          res.send(user)
        }else{
          res.send(createHttpError(404,"User Not Found!!!"))
        }
    } catch (error) {
        next(error)
    }
})


UserRouter.put("/:id",async(req,res,next)=>{
    try {
        const user=await UserModel.findByPk(req.params.id)
        if(user){
            const[updatedRowCount,UpdatedUser]=await UserModel.update(req.body,{
                where:{UserId:req.params.id},
                returning: true,
            })
            if(updatedRowCount==0){
                createHttpError(404,"User with that Id does not exist")
            }else{
                res.send(UpdatedUser)
            }
        }else{
            createHttpError(404,"User does not exist")
        }
    } catch (error) {
        next(error)
    }
})


UserRouter.delete("/:id",async(req,res,next)=>{
    try {
        const user=await UserModel.findByPk(req.params.id)
        if(user){
          const DeletedRowCount=await UserModel.destroy({where: { UserId: req.params.id }})
          if (DeletedRowCount === 0) {
            createHttpError(404,"No user with that id found")
          } else {
            res.send(`User with id ${req.params.id} deleted`);
          }
        }else{
            createHttpError(404,"User does not exist")
        }
    } catch (error) {
        next(error)
    }
})

UserRouter.delete("/me/session",JWTTokenAuth,async(req,res,next)=>{
    try {
        const user=await UserModel.findByPk((req as UserRequest).user._id)
       
        if(user){
           
      
            res.send("Refresh token deleted successfully")
        }else{
            res.send("No session to delete")
        }
    } catch (err) {
        next(err)
    }
})


UserRouter.get("/search/:q",JWTTokenAuth,async(req,res,next)=>{
  try {
    const searchQuery = req.params.q;
    const businesses= await UserModel.findAll({where:{
      role:"Business",
      name: {
        [sequelize.Op.like]: `%${searchQuery}%` 
      }
    }})
    res.status(200).send(businesses)
  } catch (error) {
    next(error)
  }
})

UserRouter.post("/block/:id",JWTTokenAuth, async(req,res,next)=>{
  try {
    const userId=(req as UserRequest).user._id
    const user=await UserModel.findByPk(userId)
    const blockedUser=await UserModel.findByPk(req.params.id)
    if(!user){
     res.status(404).send("User Not Found")

    }else{
      if(!blockedUser){
        res.status(404).send("User Not Found")
      }else{
        if(user.blocked.includes(req.params.id)){
          const [updatedRowCount, updatedUser] = await UserModel.update(
            {
              blocked: sequelize.literal(`array_remove("blocked", '${req.params.id}')`)
            },
            {
              where: { UserId: (req as UserRequest).user._id },
              returning: true
            }
          )
          if(updatedRowCount!==0){
            res.status(200).send("User Unblocked Succesfully!!")
          }else{
             res.status(404).send("User not found!!")
          }
          
        }else{
          const [updatedRowCount, updatedUser] = await UserModel.update(
            {
              blocked: sequelize.literal(`array_append("blocked", '${req.params.id}')`)
            },
            {
              where: { UserId: (req as UserRequest).user._id },
              returning: true
            }
          )
          if(updatedRowCount!==0){
            res.status(200).send("User Blocked Succesfully!!")
          }else{
            res.status(404).send("User not found!!")
          }
        
        }
      }

    }
  } catch (error) {
    next(error)
  }
})

export default UserRouter