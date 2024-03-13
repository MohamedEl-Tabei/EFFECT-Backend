const getHrs = (startTime, endTime) => {
  let sTime = Number(startTime.slice(0, 2)) + Number(startTime.slice(3)) / 60;
  let eTime = Number(endTime.slice(0, 2)) + Number(endTime.slice(3)) / 60;
  let time = eTime - sTime;
  return time;
};

module.exports = { getHrs };
