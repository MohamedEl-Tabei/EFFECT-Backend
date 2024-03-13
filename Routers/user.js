const express=require("express")
const router=express.Router()
const controller=require("../imports/controller")
const middleware=require("../imports/middleware")
router.route("/signup").post(controller.user.signUp)
router.route("/login").post(controller.user.login)
router.route("/emailIsUsedChk").post(controller.user.emailIsUsedChk)
router.route("/getUserByToken").post(middleware.token,controller.user.getUserByToken)
router.route("/resetPass").post(controller.user.sendResetLink)
router.route("/updateUser").put(middleware.token,controller.user.updateUser)
router.route("/resetForgottenPass").put(controller.user.resetPassword)
router.route("/verifyUser").post(middleware.token,controller.user.verifyPassword)
router.route("/chkUrlForResetPass").get(controller.user.chkUrl)






module.exports=router