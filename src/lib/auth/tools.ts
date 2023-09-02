import createHttpError from "http-errors";
import jwt  from "jsonwebtoken";
import UserModel from "../../api/Users/model";
import { UserDoc } from "../../api/Users/types";
export interface TokenPayload {
    _id: string
    email: string
    role:string
}


export const createAccessToken=(payload:TokenPayload):Promise<string>=>
 new Promise((resolve,reject)=>
    jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { expiresIn: "1 hour" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
        )
)


export const createRefreshToken = (payload: TokenPayload): Promise<string> =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "1 hour" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
    )
);


export const createTokens=async(user:UserDoc)=>{
    const accessToken= await createAccessToken({
        _id: user.UserId||'',
        email: user.email,
        role:user.role
      })

      const refreshToken=await createRefreshToken({
        _id: user.UserId||'',
        email: user.email,
        role:user.role
      })
      user.refreshToken=refreshToken
      return {accessToken,refreshToken}
}



export const verifyAccessToken=async(token:string):Promise<TokenPayload>=>
  new Promise((resolve,reject)=>{
    jwt.verify(
        token,
        process.env.JWT_SECRET!,
        (err,payload)=>{
          if(err) reject(err)
          resolve(payload as TokenPayload)
        } 
    )
  }
)


export const verifyRefreshToken=async(token:string):Promise<TokenPayload>=>
  new Promise((resolve,reject)=>{
    jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!,
        (err,payload)=>{
          if(err) reject(err)
          resolve(payload as TokenPayload)
        } 
    )
  }
)



export const verifyAndCreateNewTokens=async(currentRefreshToken:string)=>{
    try {
        const {_id}=await verifyRefreshToken(currentRefreshToken)
        const user= (await UserModel.findByPk(_id))as UserDoc
        if (!user) throw new createHttpError[404](`User with ${_id} not found!`)
        if(user.refreshToken && user.refreshToken===currentRefreshToken){
            const {accessToken,refreshToken}=await createTokens(user)
            return {accessToken,refreshToken}
        }
    } catch (error) {
        throw new createHttpError[401]("Session expired log in again!");
    }
}