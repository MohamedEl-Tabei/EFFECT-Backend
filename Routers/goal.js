const express=require("express")
const router= express.Router()
const middleware=require("../imports/middleware")
const controller=require("../imports/controller")
router.route("/addNewGoal").post(middleware.token,controller.goal.addNewGoal);
router.route("/sendOnePageOfGoals").post(middleware.token,controller.goal.sendOnepageofGoals);
router.route("/searchGoals").post(middleware.token,controller.goal.searchGoals);
router.route("/getUnachievedGoals").get(middleware.token,controller.goal.getUnachievedGoals);
router.route("/getGoalDetails").post(middleware.token,controller.goal.getGoalDetails);
router.route("/deleteOneGoal").post(middleware.token,middleware.deleteOneFromDimension,controller.goal.sendOnepageofGoals);
router.route("/setDateOfAchievement").post(middleware.token,middleware.setDateOfAchievement,controller.goal.sendOnepageofGoals);





module.exports= router