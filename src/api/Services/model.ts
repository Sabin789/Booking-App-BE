import { DataTypes, Model } from "sequelize";
import sequelize from "../../db";
import { ServiceAttributes, ServiceInstance } from "./types";

const ServiceModel = sequelize.define<ServiceInstance, ServiceAttributes>(
    "service",
    {
      ServiceId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      BusinessId: {
        type: DataTypes.UUID,
        allowNull: false,
      }
    },
    {
      modelName: "Service",
      timestamps: true,
    }
  );
  




  export default ServiceModel;