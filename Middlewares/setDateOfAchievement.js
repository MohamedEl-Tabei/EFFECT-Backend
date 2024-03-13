const getErrorMessage = require("../imports/error");
const { goal } = require("../imports/model");
const setDateOfAchievement = async (req, res, nxt) => {
  try {
    await goal.findByIdAndUpdate(req.body.goalId, { achievedDate: req.body.date });
    nxt();
  } catch (error) {
    res.status(200).json(getErrorMessage(error));
  }
};
module.exports = setDateOfAchievement;
