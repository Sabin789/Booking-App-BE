import { Model, Optional } from "sequelize";

export interface BookingAttriutes{
    BookingId:string;
    name:string;
    StartTime:string;
    EndTime:string;
    date:string;

    BusinessId:string;
    CustomerId:string;
    ServiceIds:[string];
}

export interface BookingDoc extends Optional<BookingAttriutes, 'BookingId'> {}

export interface BookingInstance extends Model<BookingAttriutes>, BookingAttriutes {}