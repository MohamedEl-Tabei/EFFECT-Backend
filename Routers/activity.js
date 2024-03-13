const express=require("express")
const router=express.Router()
const controller=require("../imports/controller")
const middleware=require("../imports/middleware")

router.route("/addnewactivity").post(middleware.token,controller.activity.createNewActivity)
router.route("/getAllActivities").get(middleware.token,controller.activity.getAllActivities)
router.route("/getUnhiddenActivitiesName").get(middleware.token,controller.activity.getUnhiddenActivitiesName)
router.route("/getonepageofactivities").post(middleware.token,controller.activity.sendOnepageofActivities)
router.route("/searchActivities").post(middleware.token,controller.activity.searchActivities)
router.route("/deleteOneActivity").post(middleware.token,middleware.deleteOneFromDimension,controller.activity.sendOnepageofActivities)
router.route("/editActivity").put(middleware.token,controller.activity.editActivity)
router.route("/detailsOfActivity").post(middleware.token,controller.activity.getDetailsOfActivity)
module.exports=router