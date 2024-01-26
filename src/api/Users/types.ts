
import { Model, Optional } from "sequelize";




export interface UserAttributes {
    UserId: string;
    name:string;
    surname:string;
    email: string;
    password: string;
    bio: string;
    avatar: string;
    refreshToken:string;
    role:string;
    businessSchedule: {
      [dayOfWeek: string]: {
        openingTime: string; 
        closingTime: string;
        breaks: {
          startTime: string;
          endTime: string;
        }
      };
    };
    ServiceIds:[string];
  }


 export interface UserDoc extends Optional<UserAttributes, 'UserId'> {}


 export interface UserInstance
  extends Model<UserAttributes, UserDoc>,
    UserAttributes {
  checkCredentials(email: string, password: string): Promise<UserInstance | null>;
}
