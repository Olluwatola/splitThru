function addMinutesToTimestamp(
  inputTimestamp: number | string,
  minutesToAdd: number
) {
  //const inputDate = new Date(inputTimestamp);
  //const resultDate = new Date(inputDate.getTime() + minutesToAdd * 60000); // 60000 milliseconds in a minute

  // const year = resultDate.getFullYear();
  // const month = String(resultDate.getMonth() + 1).padStart(2, '0');
  // const day = String(resultDate.getDate()).padStart(2, '0');
  // const hours = String(resultDate.getHours()).padStart(2, '0');
  // const minutes = String(resultDate.getMinutes()).padStart(2, '0');
  // const seconds = String(resultDate.getSeconds()).padStart(2, '0');
  // const milliseconds = String(resultDate.getMilliseconds()).padStart(3, '0');

  // const timezoneOffset = -resultDate.getTimezoneOffset();
  // const timezoneOffsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  // const timezoneOffsetMinutes = Math.abs(timezoneOffset) % 60;
  // const timezoneOffsetString =
  //   (timezoneOffset < 0 ? '+' : '-') +
  //   String(timezoneOffsetHours).padStart(2, '0') +
  //   String(timezoneOffsetMinutes).padStart(2, '0');

  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}${timezoneOffsetString}`;
  const increasedTimestamp = (inputTimestamp as number) + 60000 * minutesToAdd;
  return new Date(increasedTimestamp).toISOString();
}

export default addMinutesToTimestamp;
