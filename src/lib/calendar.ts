export function convertTimeToFormattedString(time:any) {
    const timeParts = time.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1].split(" ")[0]);
    const ampm = timeParts[1].split(" ")[1];
    const timeDate = new Date();
    timeDate.setUTCHours(ampm === "AM" ? hours : hours + 12);
    timeDate.setUTCMinutes(minutes);
    const hour = timeDate.getUTCHours().toString().padStart(2, '0');
    const minute = timeDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
}

export function convertRequestBodyToBookingTime(time:any) {
    const requestedDate = new Date(time);
    const startTimeComponents = time.split(":");
  
    const requestedTime = new Date(Date.UTC(
      requestedDate.getFullYear(),
      requestedDate.getMonth(),
      requestedDate.getDate(),
      Number(startTimeComponents[0]),
      Number(startTimeComponents[1])
    ));
  
    const bookingTimeHour = requestedTime.getUTCHours().toString().padStart(2, '0');
    const bookingTimeMinutes = requestedTime.getUTCMinutes().toString().padStart(2, '0');
    const bookingTime = `${bookingTimeHour}:${bookingTimeMinutes}`;
  
    return bookingTime;
  }