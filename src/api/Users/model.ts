import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "../../db";
import { UserAttributes, UserInstance } from "./types";
import BookingModel from "../Bookings/model";
import ServiceModel from "../Services/model";


const UserModel= sequelize.define<UserInstance,UserAttributes>("user",{
    UserId:{
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    name:{
        type: DataTypes.STRING(50),
        allowNull:false
    },
    surname:{
        type: DataTypes.STRING(50),
        allowNull:true
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Please fill a valid email address'
          }
        }
    },
    password:{
        type:DataTypes.STRING(255),
        allowNull: false
    },
    bio:{
        type:DataTypes.STRING(255),
        allowNull: true
    },
    refreshToken: { 
        type:DataTypes.STRING(255),
     },
    avatar:{
        type:DataTypes.STRING(255),
        defaultValue:"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
        allowNull: true
    },
    businessSchedule: {
     type:DataTypes.JSON,
     allowNull:true,
     validate: {
        isValidSchedule(value: any) {
            const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            for (const day in value) {
                if (!validDays.includes(day)) {
                    throw new Error(`${day} is not a valid day.`);
                }
            }
        }
    } 
     
    },
    ServiceIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true, 
    },
    role: {
        type: DataTypes.ENUM('Admin', 'Business', 'User'),
        allowNull: false,
        defaultValue: 'User',
    },
    blocked:{
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true
    },
    pending:{
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true
    }
},{
    tableName: 'users',
    timestamps: true 
  })





UserModel.beforeCreate(async (user) => {
  
    if (user.getDataValue('password')) {
      const hashedPassword = await bcrypt.hash(user.getDataValue('password'), 13);
      user.setDataValue('password', hashedPassword);
    }
});
  
UserModel.beforeUpdate(async (user) => {
    if (user.getDataValue('password')) {
      const hashedPassword = await bcrypt.hash(user.getDataValue('password'), 13);
      user.setDataValue('password', hashedPassword);
    }
});


UserModel.prototype.toJSON = function () {
    const user = this;
    const userObj = user.get();
  
    delete userObj.password;
    delete userObj.createdAt;
    delete userObj.updatedAt;
    delete userObj.__v;
    return userObj;
};

UserModel.prototype.checkCredentials = async function (email: string, password: string): Promise<UserInstance | null> {
    const user = this as UserInstance;
    
   
    if(user){
        const matchingPassword=await bcrypt.compare(password,user.password)
        if(!matchingPassword)  return null
    return user
    }else return null
    }


    UserModel.prototype.isBusinessOpen = function (dayOfWeek:string, time:string) {
        if (this.role === "Business" && this.businessSchedule) {
          const daySchedule = this.businessSchedule[dayOfWeek]; 
      
          if (daySchedule) {
            const openingTime = daySchedule.openingTime;
            const closingTime = daySchedule.closingTime;
      
            return time >= openingTime && time <= closingTime;
          }
        }
      
        return false;
      };



UserModel.hasMany(BookingModel, { foreignKey: 'CustomerId', as: 'customerBookings' });
UserModel.hasMany(BookingModel, { foreignKey: 'BusinessId', as: 'businessBookings' })


BookingModel.belongsTo(UserModel, { foreignKey: 'CustomerId', as: 'customer' });
BookingModel.belongsTo(UserModel, { foreignKey: 'BusinessId', as: 'business' });



export default UserModel