import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { BookingAttriutes, BookingInstance } from "./types";
import ServiceModel from "../Services/model";


const BookingModel= sequelize.define<BookingInstance,BookingAttriutes>("booking",{
    BookingId:{
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    date:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    StartTime:{
        type:DataTypes.STRING,
        allowNull:false
    },
    EndTime:{
      type:DataTypes.STRING,
      allowNull:false
  },
      BusinessId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      CustomerId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      ServiceIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true, 
    }
}, {
    modelName: 'Booking',
    timestamps:true
})


BookingModel.hasMany(ServiceModel)
// BookingModel.belongsToMany(ServiceModel, {
//   through: 'ServiceBooking', // Replace with the actual intermediary model name
//   foreignKey: 'BookingId',
//   as: 'BookingServices',
// })
export default BookingModel;