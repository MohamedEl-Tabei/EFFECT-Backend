const goal = {
  expectedDateToAchieve: {
    type: String,
    required: "Enter your expected date to achieve.",
  },
  achievedDate: {
    type: String,
    default: "Not yet.",
  },
  numberOfHours: {
    type: Number,
    default: 0,
  },
};
module.exports = goal;
