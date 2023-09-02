import { Model, Optional } from "sequelize";

export interface ServiceAttributes{
    ServiceId:string;
    name:string;
    price:string;
    duration:number;
    BusinessId:string;
}


export interface ServiceDoc extends Optional<ServiceAttributes, 'ServiceId'> {}

export interface ServiceInstance extends Model<ServiceAttributes>, ServiceAttributes {}