const express=require("express")
const middleware=require("../imports/middleware")
const controller=require("../imports/controller")
const router=express.Router()

router.route("/addNewDoneActivity").post(middleware.token,controller.doneActivity.addNewDoneActivity)
router.route("/setWkupTime").post(middleware.token,controller.doneActivity.setWkupTime)
router.route("/getDoneActivityByDate").post(middleware.token,controller.doneActivity.getDoneActivityByDate)
router.route("/deleteWKupTime").post(middleware.token,controller.doneActivity.deleteWKupTime)
router.route("/deleteOneActivity").post(middleware.token,controller.doneActivity.deleteOneActivity)
router.route("/editWKupTime").put(middleware.token,controller.doneActivity.EditWkupTime)
router.route("/editDoneActivity").put(middleware.token,controller.doneActivity.editDoneActivity)
router.route("/sleepBoardDetails").post(middleware.token,controller.doneActivity.sleepBoardDetails)
router.route("/dailyProgressDetails").get(middleware.token,controller.doneActivity.dailyProgressDetails)




module.exports=router