import  Express  from "express";
import cors, { CorsOptions } from "cors"
import createHttpError from "http-errors"
import { pgConnect } from "./db"
import { BadRequestHandler, ForbiddenHandler, GenericErrorHandler, NotFoundHandler, UnAuthorizedHandler } from "./errorHandlers"
import UserRouter from "./api/Users";
import BookingRouter from "./api/Bookings";
import ServiceRouter from "./api/Services";

const port=process.env.PORT as string || 3001

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

const corsOptions:CorsOptions = {
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whiteList.includes(currentOrigin)) {
        corsNext(null, true);
      } else {
        corsNext(createHttpError(400, "This origin is not allowed! ", currentOrigin));
      }
    },
    credentials: true
  };


const server=Express()
server.use(Express.json())
server.use(cors(corsOptions))

server.use("/users",UserRouter)
server.use("/bookings",BookingRouter)
server.use("/services",ServiceRouter)

server.use(BadRequestHandler)
server.use(UnAuthorizedHandler)
server.use(ForbiddenHandler)
server.use(NotFoundHandler)
server.use(GenericErrorHandler)

const startServer = async () => {
    try {
      await pgConnect()
      server.listen(port, () => {
        console.log(`Server started on port ${port}`)
      })
    } catch (error) {
      console.error("Error starting server:", error)
      process.exit(1)
    }
}


startServer()