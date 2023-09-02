import  Express  from "express";
import createHttpError from "http-errors";
import UserModel from "../Users/model";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import BookingModel from "./model";
import sequelize, { Op } from "sequelize";
import ServiceModel from "../Services/model";
import moment from "moment";


const BookingRouter=Express.Router()



BookingRouter.get("/me",JWTTokenAuth,async(req,res,next)=>{
    try {
        const user = await UserModel.findByPk((req as UserRequest).user._id);
        if(!user){
            next(createHttpError(404, "No user found!!!"));
        }else{
         const bookings = await BookingModel.findAll({
        where: {
          [sequelize.Op.or]: [
            { BusinessId: user.UserId },
            { CustomerId: user.UserId }
          ]
        }
      });
      res.send(bookings)
        }
    } catch (error) {
        next(error)
    }
})



BookingRouter.post("/:id", JWTTokenAuth, async (req, res, next) => {
    try {
        const user = await UserModel.findByPk((req as UserRequest).user._id);
    
        if (!user) {
            return next(createHttpError(404, "No user found!!!"));
        }

        const business = await UserModel.findByPk(req.params.id);
        const requestedDate = new Date(req.body.date);
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][requestedDate.getDay()];
        const openingTime = business?.businessSchedule[dayOfWeek]?.openingTime as string;
        const closingTime = business?.businessSchedule[dayOfWeek]?.closingTime as string;
        const serviceIds = req.body.ServiceIds
        const f= new Intl.DateTimeFormat("en-us",{

            timeStyle:"short"
        })
        if (openingTime === "none") {
            return res.status(403).send(createHttpError(403, "Business is not available on that day!!!"));
        }else{
        const requestedDate = new Date(req.body.date);
        const startTimeComponents = req.body.StartTime.split(":");
        const requestedTime = new Date(Date.UTC(
            requestedDate.getFullYear(),
            requestedDate.getMonth(),
            requestedDate.getDate(),
            Number(startTimeComponents[0]),
            Number(startTimeComponents[1])
        ))
        

        const bookingTimeHour=requestedTime.getUTCHours().toString().padStart(2, '0');
        const bookingTimeMinutes=requestedTime.getUTCMinutes().toString().padStart(2, '0');
        const bookingTimeOnly=`${bookingTimeHour}:${bookingTimeMinutes}`


        const serviceDurations = await ServiceModel.sum("duration", {
            where: { ServiceId: serviceIds }
        });
        const endTime = new Date(requestedTime.getTime() + serviceDurations * 60000);
        const endBookingTimeHour = endTime.getUTCHours().toString().padStart(2, '0');
        const endBookingTimeMinutes = endTime.getUTCMinutes().toString().padStart(2, '0');
        const endBookingTimeOnly = `${endBookingTimeHour}:${endBookingTimeMinutes}`;
        

        req.body.BusinessId = user.UserId;
        const openingTimeParts = openingTime.split(":");
        const openingHours = parseInt(openingTimeParts[0]);
        const openingMinutes = parseInt(openingTimeParts[1].split(" ")[0]);
        const openingAMPM = openingTimeParts[1].split(" ")[1];
        const openingTimeDate = new Date();
        openingTimeDate.setUTCHours(openingAMPM === "AM" ? openingHours : openingHours + 12);
        openingTimeDate.setUTCMinutes(openingMinutes);
        
        const openingTimeHour=openingTimeDate.getUTCHours().toString().padStart(2, '0');
        const openingTimeMinutes=openingTimeDate.getUTCMinutes().toString().padStart(2, '0');
        const openingTimeOnly=`${openingTimeHour}:${openingTimeMinutes}`


        const closingTimeParts = closingTime.split(":");
        const closingHours = parseInt(closingTimeParts[0]);
        const closingMinutes = parseInt(closingTimeParts[1].split(" ")[0]);
        const closingAMPM = closingTimeParts[1].split(" ")[1];
        const closingTimeDate = new Date();
        closingTimeDate.setUTCHours(closingAMPM === "AM" ? closingHours : closingHours + 12);
        closingTimeDate.setUTCMinutes(closingMinutes);
        const closingTimeHour=closingTimeDate.getUTCHours().toString().padStart(2, '0');
        const closingTimeMinutes=closingTimeDate.getUTCMinutes().toString().padStart(2, '0');
        const closingTimeOnly=`${closingTimeHour}:${closingTimeMinutes}`
        
                
        if (  bookingTimeOnly >= openingTimeOnly && endBookingTimeOnly <= closingTimeOnly) {
            const overlappingBookings = await BookingModel.findAll({
                where: {
                    BusinessId: req.params.id,
                    [sequelize.Op.or]: [
                        // Check if new booking starts during an existing booking
                        {
                            StartTime: { [sequelize.Op.lte]: endBookingTimeOnly }, // New booking starts before or at the same time
                            EndTime: { [sequelize.Op.gt]: bookingTimeOnly } // New booking ends after existing booking starts
                        },
                        // Check if an existing booking starts during the new booking
                        {
                            StartTime: { [sequelize.Op.gte]: bookingTimeOnly }, // Existing booking starts during or after new booking
                            EndTime: { [sequelize.Op.lt]: endBookingTimeOnly } 
                        },
                    ]
                }
            });
            if (overlappingBookings.length > 0) {
                console.log(overlappingBookings)
                return res.status(403).send(createHttpError(403, "Your booking is overlapping with another one! Try another time please!"));
                
            }else{
                const { BookingId } = await BookingModel.create({
                ...req.body,
                CustomerId: user?.UserId,   
                BusinessId: req.params.id, 
                EndTime:endBookingTimeOnly
                 })
            
                res.status(201).send({ BookingId });
  
            }
        }else{      
            return res.status(403).send(createHttpError(403, "Business is not available at that time of the day!!")); 
        }

       }

    } catch (error) {
        next(error);
        res.status(500).send(createHttpError(500, "An error occurred while processing the request."));

    }
});

BookingRouter.delete("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
        const user = await UserModel.findByPk((req as UserRequest).user._id);
        if(!user){
           return res.send(createHttpError(404,"User does not exist"))
        }else{
            const Booking= await BookingModel.findByPk(req.params.id)
            if(!Booking){
                return res.send(createHttpError(404,"Booking does not exist"))

            }else{
              
                const DeletedRowCount = await BookingModel.destroy({
                    where: {
                        [sequelize.Op.or]: [
                            { CustomerId: user.UserId },
                            { BusinessId: user.UserId }
                        ]
                    }
                })
                    if (DeletedRowCount === 0) {
                      createHttpError(404,"No booking with that id found")
                    } else {
                      res.send(`Booking with id ${req.params.id} deleted`);
                    }
                
            }
        }
    } catch (error) {
        next(error)
    }
})

export default BookingRouter