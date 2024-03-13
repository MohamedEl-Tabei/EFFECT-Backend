const { goal, doneActivity,activity } = require("../imports/model");
const getErrorMessage = require("../imports/error/index");
const {getHrs} =require("../imports/util")
const addNewGoal = async (req, res) => {
  try {
    const goal_ = await goal({
      key: {
        userId: req.userId,
        name: req.body.name,
      },
      ...req.body,
    });
    await goal_.save();
    await res.status(200).json("success");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const sendOnepageofGoals = async (req, res) => {
  try {
    let allGoals = await goal.find(
      { "key.userId": req.userId },
      "key.name achievedDate expectedDateToAchieve"
    );
    let numberOfPages =
      (await allGoals.length) % 50 !== 0
        ? allGoals.length / 50 + 1
        : allGoals.length / 50;
    await allGoals.sort((a, b) =>
      a.expectedDateToAchieve.localeCompare(b.expectedDateToAchieve)
    );

    let pageOfGoals = await allGoals.slice(
      (req.body.pageNumber - 1) * 50,
      req.body.pageNumber * 50
    );
    await res.status(200).json({
      pageOfGoals,
      numberOfPages:
        Math.floor(numberOfPages) === 0 ? 1 : Math.floor(numberOfPages),
    });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};

const searchGoals = async (req, res) => {
  try {
    let goals = (
      await goal.find(
        { "key.userId": req.userId },
        "key.name achievedDate expectedDateToAchieve"
      )
    ).filter((v) => {
      return (
        v.key.name.toLowerCase().search(req.body.search.toLowerCase()) !== -1
      );
    });

    let numberOfPages =
      (await goals.length) % 50 !== 0
        ? goals.length / 50 + 1
        : goals.length / 50;
    await goals.sort((a, b) =>
      a.expectedDateToAchieve.localeCompare(b.expectedDateToAchieve)
    );

    let pageOfGoals = await goals.slice(
      (req.body.pageNumber - 1) * 50,
      req.body.pageNumber * 50
    );
    await res.status(200).json({
      items: pageOfGoals,
      numberOfPages:
        Math.floor(numberOfPages) === 0 ? 1 : Math.floor(numberOfPages),
    });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const getUnachievedGoals = async (req, res) => {
  try {
    let unachievedGoals = await goal.find({
      "key.userId": req.userId,
      achievedDate: "Not yet.",
    });
    res.status(200).json(unachievedGoals);
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const getGoalDetails = async (req, res) => {
  try {
    let goalName = req.body.goalName;
    let userId = req.userId;
    let userDoneActivities = await doneActivity.find({ "key.userId": userId });
    let colorKeys=await activity.find({"key.userId":userId},"key colorKey")

    let relatedDoneActivities = userDoneActivities.filter((activity) => {
      return activity.relatedGoals.includes(goalName);
    });
    let labels = [];
    relatedDoneActivities.forEach(rda=>{
      if(!labels.includes(rda.key.name))
      {
        labels.push(rda.key.name)
      }
    })
    
  

    let datasets = [
      {
        label: "",
        data:[],
        borderColor: [],
        backgroundColor: [],
      }
    ];
    let numberOfHours=0
    labels.forEach(l=>{
      let activityOfL=relatedDoneActivities.filter(rda=>rda.key.name===l)
      let activityHrs=0
      activityOfL.forEach(aol=>{
        activityHrs=activityHrs+getHrs(aol.startTime,aol.endTime)
      })
      numberOfHours=numberOfHours+activityHrs
      datasets[0].data.push(activityHrs)
      let ck=colorKeys.find(ck=>ck.key.name===l)
      datasets[0].backgroundColor.push(ck.colorKey.color)
      datasets[0].borderColor.push(ck.colorKey.color)

    })
    res.status(200).json({numberOfHours,data:{
      labels,
      datasets,
    }});
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};

module.exports = {
  addNewGoal,
  sendOnepageofGoals,
  searchGoals,
  getUnachievedGoals,
  getGoalDetails,
};
