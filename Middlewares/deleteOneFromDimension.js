const models = require("../imports/model");
const getErrorMessage = require("../imports/error");
const deleteOneFromDimension = async (req, res, nxt) => {
  try {
    //get dimension type from user
    const deleted = await models[req.body.type].findOneAndDelete({
      _id: req.body._id,
    });
    if (req.body.type === "activity") {
      await models.doneActivity.deleteMany({ key: deleted.key });
    }
    //delete related done activity when type is goal
    else {
      let relatedDoneActivity = await models.doneActivity.find({
        "key.userId": req.userId,
      });
      let doneActivityToAchieveTheGoal = relatedDoneActivity.filter((a) =>
        a.relatedGoals.includes(deleted.key.name)
      );
      doneActivityToAchieveTheGoal.map(async (a) => {
        if (a.relatedGoals.length === 1) {
          await models.doneActivity.findByIdAndDelete(a._id);
        } else {
          let relatedGoals = [];
          while (a.relatedGoals.length) {
            let goal = a.relatedGoals.pop();
            if (goal !== deleted.key.name) {
              relatedGoals.push(goal);
            }
          }
          await models.doneActivity.findByIdAndUpdate(a._id, { relatedGoals });
        }
      });
    }
    nxt();
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
module.exports = deleteOneFromDimension;
