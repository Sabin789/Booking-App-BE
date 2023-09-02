import BookingModel from '../api/Bookings/model';
import UserModel from '../api/Users/model';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  async function sendAppointmentEmail(
    toEmail: string,
    subject: string,
    body: string,
    isBusiness: boolean
  ) {
    const fromEmail = isBusiness ? 'business_email@example.com' : 'your_email@example.com';
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text: body,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  
 export async function createBooking(UserId:string,BusinessId:string,BookingId:string) {
    try {
      const user = await UserModel.findByPk(UserId);
      const business = await UserModel.findByPk(BusinessId);
      const booking=await BookingModel.findByPk(BookingId)
    
      if (user?.role === 'User' && business?.role === 'Business') {
        const userSubject = `You have an appointment with ${business.name}`;
        const userBody = `Hi ${user.name},\n\nYou have an appointment with ${business.name} on ${booking?.date} at ${booking?.StartTime}`;
        await sendAppointmentEmail(user.email, userSubject, userBody, false);
  
        const businessSubject = `Appointment with ${user.name}`;
        const businessBody = `Hi ${business.name},\n\n${user.name} has an appointment with you on ${booking?.date} at ${booking?.StartTime}.`;
        await sendAppointmentEmail(business.email, businessSubject, businessBody, true);
  
        console.log('Booking created and emails sent.');
      } else {
        console.log('Invalid roles for sending emails.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  }