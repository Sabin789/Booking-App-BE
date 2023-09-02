
import BookingModel from "../api/Bookings/model"
import UserModel from "../api/Users/model"
import moment from 'moment'
import sequelize, { Op } from "sequelize";

export async function isBusinessAvailableOnDay(businessId:string,dayOfWeek:string):Promise<boolean>{
    try {
        const business=await UserModel.findByPk(businessId)
        if(business?.businessSchedule?.[dayOfWeek]?.openingTime!=="none"){
             return false
        }else{
            return true
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

export async function hasNoOverlappingBookings(businessId: string, dayOfWeek: string, startTime: string, endTime: string, serviceIds: string[]): Promise<boolean> {

    try {
        const business=await UserModel.findByPk(businessId)
        const openingTime=business?.businessSchedule[dayOfWeek]?.openingTime as string
        const closingTime=business?.businessSchedule[dayOfWeek]?.closingTime as string
        if (startTime < openingTime || endTime > closingTime) {
            return false;
        }
        const overlappingBookings=await BookingModel.findAll({
            where:{BusinessId: businessId},
            date: moment().isoWeekday(dayOfWeek).format('YYYY-MM-DD'),
            [sequelize.Op.or]: [
                { startTime: { [sequelize.Op.between]: [startTime, endTime] } },
                { endTime: { [sequelize.Op.between]: [startTime, endTime] } },
            ]
        }as any)
        if (overlappingBookings.length > 0) {
            return false;
        }

        return true;
    } catch (error) {
        console.log(error)
        return false
    }
}